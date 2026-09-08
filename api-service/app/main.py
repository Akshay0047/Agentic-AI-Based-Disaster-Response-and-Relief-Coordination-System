import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

import app.db.base  # noqa: F401  (registers all models before routes resolve relationships)

# CORS origins — default to the Vite dev server origin; override via CORS_ORIGINS env var.
_cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173")
_cors_origins = [o.strip() for o in _cors_origins_str.split(",") if o.strip()]

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.routes import (
    agent_activity,
    approvals,
    assignments,
    auth,
    health,
    requests,
    resources,
    shelters,
    volunteers,
)

prefix = settings.api_v1_prefix

app.include_router(health.router, tags=["health"])
app.include_router(auth.router, prefix=prefix)
app.include_router(requests.router, prefix=prefix)
app.include_router(volunteers.router, prefix=prefix)
app.include_router(shelters.router, prefix=prefix)
app.include_router(resources.router, prefix=prefix)
app.include_router(assignments.router, prefix=prefix)
app.include_router(agent_activity.router)
app.include_router(approvals.router)
