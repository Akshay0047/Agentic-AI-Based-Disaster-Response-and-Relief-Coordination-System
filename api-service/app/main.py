from fastapi import FastAPI

from app.api.routes import (
    assignments,
    auth,
    health,
    requests,
    resources,
    shelters,
    volunteers,
)
from app.core.config import settings

app = FastAPI(title=settings.app_name, debug=settings.debug)

prefix = settings.api_v1_prefix

app.include_router(health.router, tags=["health"])
app.include_router(auth.router, prefix=prefix)
app.include_router(requests.router, prefix=prefix)
app.include_router(volunteers.router, prefix=prefix)
app.include_router(shelters.router, prefix=prefix)
app.include_router(resources.router, prefix=prefix)
app.include_router(assignments.router, prefix=prefix)