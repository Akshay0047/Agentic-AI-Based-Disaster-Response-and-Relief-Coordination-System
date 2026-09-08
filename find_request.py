import asyncpg
import asyncio

async def main():
    try:
        conn = await asyncpg.connect('postgresql://drs:drs_password@localhost:5432/disaster_response')
        
        # Search by exact description fragment or user
        rows = await conn.fetch(
            "SELECT id, description, emergency_type, requester_name FROM emergency_requests "
            "WHERE description ILIKE '%ellam%' OR requester_name ILIKE '%239102%' LIMIT 10"
        )
        for r in rows:
            print(f"id={r['id']}, desc={r['description']}, type={r['emergency_type']}, requester={r['requester_name']}")
            
        # Also check if 26295029 maps to any UUID via some pattern
        # Try casting the integer as UUID (may fail but let's see)
        try:
            row = await conn.fetchrow(
                "SELECT id::text FROM emergency_requests WHERE id = '26295029'::uuid"
            )
            print(f"Cast result: {row}")
        except Exception as e:
            print(f"Cast error (expected): {e}")
            
        await conn.close()
    except Exception as e:
        print(f'Error: {e}')

asyncio.run(main())