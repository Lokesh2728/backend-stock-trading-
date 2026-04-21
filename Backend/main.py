from fastapi import FastAPI,Depends, HTTPException,WebSocket,WebSocketDisconnect
from database import engine
import models
import schemas
import os
from sqlalchemy.orm import Session
from database import get_db
from typing import List
from redis_conn import redis_client
from websocket_manager import manager
import asyncio
from price import update_prices
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from decimal import Decimal

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    if os.getenv("REDIS_URL"):
        print("Starting price updater...")
        asyncio.create_task(update_prices())


try:
    models.Base.metadata.create_all(bind=engine)
    print("DB connected ✅")
except Exception as e:
    print("DB ERROR:", e)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev (later restrict)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 👤 Create user
    new_user = models.User(name=user.name,email=user.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    wallet = models.Wallet(user_id=new_user.id,balance=1000000.00)
    db.add(wallet)
    db.commit()

    return new_user

@app.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users


from decimal import Decimal

@app.post("/orders")
async def place_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):

    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == order.user_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    price = Decimal(redis_client.get(f"price:{order.symbol}") or "0")

    if price == 0:
        raise HTTPException(status_code=400, detail="Price not available")

    total_amount = price * Decimal(order.qty)

    position = db.query(models.Position).filter_by(
        user_id=order.user_id,
        symbol=order.symbol
    ).first()

    # 🟢 BUY
    if order.side == "BUY":

        if wallet.balance < total_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        wallet.balance -= total_amount

        if position:
            new_qty = position.quantity + order.qty

            new_avg = (
                (position.quantity * position.avg_price) +
                (Decimal(order.qty) * price)
            ) / Decimal(new_qty)

            position.quantity = new_qty
            position.avg_price = new_avg

        else:
            position = models.Position(
                user_id=order.user_id,
                symbol=order.symbol,
                quantity=order.qty,
                avg_price=price
            )
            db.add(position)

    # 🔴 SELL
    elif order.side == "SELL":

        if not position or position.quantity < order.qty:
            raise HTTPException(status_code=400, detail="Not enough stock to sell")

        position.quantity -= order.qty
        wallet.balance += total_amount

        if position.quantity == 0:
            db.delete(position)

    else:
        raise HTTPException(status_code=400, detail="Invalid order side")

    new_order = models.Order(
        user_id=order.user_id,
        symbol=order.symbol,
        qty=order.qty,
        side=order.side,
        price=price,
        status="COMPLETED"
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    await manager.send(order.user_id, {
        "event": "order_executed",
        "symbol": order.symbol,
        "qty": order.qty,
        "price": float(price),
        "side": order.side,
        "status": "COMPLETED"
    })

    return {
        "message": "Order executed",
        "price": float(price),
        "qty": order.qty,
        "side": order.side
    }


@app.get("/portfolio/{user_id}", response_model=schemas.PortfolioResponse)
def get_portfolio(user_id: int, db: Session = Depends(get_db)):

    positions = db.query(models.Position).filter(models.Position.user_id == user_id).all()

    if not positions:
        return {
            "portfolio": [],
            "total_value": 0
        }

    portfolio = []
    total_value = 0

    for pos in positions:
        price = redis_client.get(f"price:{pos.symbol}")
        current_price = float(price) if price else 0

        pnl = (current_price - float(pos.avg_price)) * pos.quantity

        value = current_price * pos.quantity
        total_value += value

        portfolio.append({
            "symbol": pos.symbol,
            "quantity": pos.quantity,
            "avg_price": float(pos.avg_price),
            "current_price": current_price,
            "pnl": pnl
        })

    return {
        "portfolio": portfolio,
        "total_value": total_value
    }

@app.get("/orders/{user_id}")
def get_orders(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(models.Order).filter(models.Order.user_id == user_id).all()

    return [
        {
            "id": o.id,
            "symbol": o.symbol,
            "qty": o.qty,
            "side": o.side,
            "price": float(o.price),
            "status": o.status,
            "created_at": o.created_at
        }
        for o in orders
    ]

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(user_id, websocket)
    print(f"✅ WS connected: {user_id}")

    try:
        while True:
            symbols = ["SBIN", "RELIANCE"]
            prices = {}

            for symbol in symbols:
                try:
                    price = redis_client.get(f"price:{symbol}")
                    prices[symbol] = float(price) if price else 0
                except Exception as e:
                    print("Redis error:", e)
                    prices[symbol] = 0

            await websocket.send_json({
                "event": "price_update",
                "data": prices
            })

            await asyncio.sleep(1)

    except WebSocketDisconnect:
        print(f"❌ WS disconnected: {user_id}")
        manager.disconnect(user_id)

    except Exception as e:
        print("❌ WS error:", e)
        manager.disconnect(user_id)



@app.websocket("/ws")
async def websocket_global(websocket: WebSocket):
    await websocket.accept()
    print("✅ Global WS connected")

    try:
        while True:
            prices = {}

            for symbol in ["SBIN", "RELIANCE"]:
                try:
                    price = redis_client.get(f"price:{symbol}")
                    prices[symbol] = float(price) if price else 0
                except Exception as e:
                    print("Redis error:", e)
                    prices[symbol] = 0

            await websocket.send_json({
                "event": "price_update",
                "data": prices
            })

            await asyncio.sleep(1)

    except WebSocketDisconnect:
        print("❌ Global WS disconnected")

    except Exception as e:
        print("❌ Global WS error:", e)
