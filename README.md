# Agentic AI-Based Disaster Response and Relief Coordination System

A cloud-native disaster-response coordination system where an **Agentic AI
coordinator** (Claude) observes emergency situations, plans responses, and
executes authorized actions through controlled tools — operating on top of an
AWS architecture (FastAPI, RDS, SQS, SNS, S3).

> **Current status: Phase 1 — Project Foundation** (backend + database + auth).

## Repository structure

```
disaster-response-system/
├── docker-compose.yml          # local PostgreSQL
├── .env.example                # template for environment variables
├── api-service/                # FastAPI service (built in Phase 1)
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   └── app/
│       ├── main.py
│       ├── core/               # config + security (JWT, hashing)
│       ├── db/                 # base + session
│       ├── models/             # SQLAlchemy models
│       ├── schemas/            # Pydantic schemas
│       ├── api/                # deps + route modules
│       └── services/           # auth, request, queue (SQS stub)
└── agent-worker-service/       # placeholder (Phase 3+)
```

## Prerequisites

- Python 3.12+
- Docker + Docker Compose (for local PostgreSQL)

## Local setup

1. Create your environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Create a virtual environment and install dependencies:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r api-service\requirements.txt
   ```

3. Start PostgreSQL:

   ```powershell
   docker compose up -d
   ```

4. Run migrations:

   ```powershell
   cd api-service
   alembic upgrade head
   cd ..
   ```

5. Start the API:

   ```powershell
   cd api-service
   uvicorn app.main:app --reload
   ```

   The API runs at http://localhost:8000.
   Interactive docs: http://localhost:8000/docs

## API endpoints (Phase 1)

| Method | Path                            | Auth                 | Description                          |
|--------|---------------------------------|----------------------|--------------------------------------|
| GET    | `/health`                       | public               | Health check                         |
| POST   | `/api/v1/auth/register`         | public               | Register a user                      |
| POST   | `/api/v1/auth/login`            | public               | Login, returns JWT                   |
| POST   | `/api/v1/requests`              | JWT (all roles)      | Create emergency request             |
| GET    | `/api/v1/requests`              | JWT (all roles)      | List requests (citizens see own)     |
| GET    | `/api/v1/requests/{id}`         | JWT (all roles)      | Get a request                        |
| GET    | `/api/v1/volunteers`            | JWT (admin/vol)      | List volunteers                      |
| GET    | `/api/v1/volunteers/{id}`       | JWT (admin/own)      | Get a volunteer                      |
| PATCH  | `/api/v1/volunteers/{id}/availability` | JWT (admin/own) | Update availability             |
| GET    | `/api/v1/shelters`              | JWT (all roles)      | List shelters                        |
| GET    | `/api/v1/shelters/{id}`         | JWT (all roles)      | Get a shelter                        |
| GET    | `/api/v1/resources`             | JWT (all roles)      | List resources                       |
| GET    | `/api/v1/assignments`           | JWT (all roles)      | List assignments                     |
| GET    | `/api/v1/assignments/{id}`      | JWT (all roles)      | Get an assignment                    |

## Roles

- **admin** — full read access.
- **volunteer** — own volunteer record + own availability.
- **citizen** — create requests + read own requests.

Administrative write operations (volunteers, shelters, resources) arrive in
Phase 2.