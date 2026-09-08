import asyncpg
import asyncio

async def main():
    try:
        conn = await asyncpg.connect('postgresql://drs:drs_password@localhost:5432/disaster_response')
        print('connected successfully')
        await conn.close()
    except Exception as e:
        print(f'error: {e}')

asyncio.run(main())