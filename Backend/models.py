from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Enum, TIMESTAMP, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class OrderSide(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"

class OrderStatus(str, enum.Enum):
    COMPLETED = "COMPLETED"



# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="user")
    positions = relationship("Position", back_populates="user")


# Wallet 
class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    balance = Column(DECIMAL(15, 2), default=1000000.00)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    user = relationship("User", back_populates="wallet")


# Order 
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    symbol = Column(String(20))
    qty = Column(Integer)
    side = Column(Enum(OrderSide))
    price = Column(DECIMAL(15, 2))
    status = Column(Enum(OrderStatus), default=OrderStatus.COMPLETED)
    created_at = Column(TIMESTAMP, server_default=func.now())
    user = relationship("User", back_populates="orders")


# Position
class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    symbol = Column(String(20))
    quantity = Column(Integer, default=0)
    avg_price = Column(DECIMAL(15, 2), default=0)

    __table_args__ = (UniqueConstraint("user_id", "symbol", name="unique_user_symbol"),)
    user = relationship("User", back_populates="positions")