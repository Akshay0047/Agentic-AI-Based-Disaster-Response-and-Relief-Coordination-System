import asyncpg
import asyncio

async def main():
    try:
        conn = await asyncpg.connect('postgresql://drs:drs_password@localhost:5432/disaster_response')
        
        # Delete the request with the found UUID
        result = await conn.execute(
            "DELETE FROM emergency_requests WHERE id = '26295029-db35-4e7f-aecb-46511d1e0ee8'"
        )
        print(f'Delete result: {result}')
        
        # Verify deletion
        check = await conn.fetchrow(
            "SELECT id FROM emergency_requests WHERE id = '26295029-db35-4e7f-aecb-46511d1e0ee8'"
        )
        if check is None:
            print('Successfully deleted - request no longer exists.')
        else:
            print('Request still exists!')
            
        await conn.close()
    except Exception as e:
        print(f'Error: {e}')

asyncio.run(main())