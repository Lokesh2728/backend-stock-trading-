import asyncio
import random
from redis_conn import redis_client

symbols = ["SBIN", "RELIANCE"]

async def update_prices():
    while True:
        try:
            for symbol in ["SBIN", "RELIANCE"]:
                price = round(random.uniform(500, 3000), 2)
                redis_client.set(f"price:{symbol}", price)
                print(f"{symbol}: {price}")
        except Exception as e:
            print("Redis error:", e)

        await asyncio.sleep(1)
