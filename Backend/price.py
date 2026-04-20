import asyncio
import random
from redis_conn import redis_client

symbols = ["SBIN", "RELIANCE"]

async def update_prices():
    while True:
        for symbol in symbols:
            price = round(random.uniform(500, 3000), 2)
            redis_client.set(f"price:{symbol}", price) 

        await asyncio.sleep(3)
