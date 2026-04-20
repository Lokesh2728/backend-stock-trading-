from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr

    
class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True   

class OrderCreate(BaseModel):
    user_id:int
    symbol:str
    qty:int
    side:str  

class PortfolioItem(BaseModel):
    symbol: str
    quantity: int
    avg_price: float
    current_price: float
    pnl: float

class PortfolioResponse(BaseModel):
    portfolio: list[PortfolioItem]
    total_value: float