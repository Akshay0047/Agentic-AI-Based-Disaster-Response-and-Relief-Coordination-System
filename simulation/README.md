# Simulation Data Generator

Generates a demo dataset against your local migrated Postgres:

- 20–50 volunteers (with linked users, all password `password123`)
- 5–10 shelters with resources
- 100–500 emergency requests in mixed statuses

Usage from repo root:

```
python simulation/generate.py --volunteers 30 --shelters 8 --requests 200 --wipe
```

`--wipe` truncates all data tables first (dev DBs only). Without `--wipe`, the
generator refuses to run if any users already exist.

The implementation lives in `api-service/app/scripts/simulation_data.py` and can
also be run directly from `api-service/`:

```
python -m app.scripts.simulation_data --volunteers 30 --shelters 8 --requests 200 --wipe
```
