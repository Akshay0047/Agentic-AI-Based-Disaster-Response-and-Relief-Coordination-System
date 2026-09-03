"""Shared fixtures for the API test suite.

These tests require a running PostgreSQL database (via `docker compose up -d`)
with migrations applied (`alembic upgrade head`).

Why the NullPool engine: the suite shares one process across three different
event loops — this async fixture's loop, the anyio portal loop inside
TestClient, and temporary loops from asyncio.run(). The app's default pooled
engine caches asyncpg connections bound to whichever loop created them, so a
later checkout on a different loop crashes on Windows with
"'NoneType' object has no attribute 'send'" / "Event loop is closed".
NullPool opens a fresh connection per checkout on the *current* loop, which
removes the entire class of cross-loop failures. App code is untouched.
"""

import asyncio

import pytest_asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

import app.db.session as session_module
from app.core.config import settings

# Replace the module-level pooled engine/session factory before any test runs.
test_engine = create_async_engine(settings.get_async_database_url(), poolclass=NullPool)
session_module.engine = test_engine
session_module.AsyncSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def _truncate_tables():
    """Wipe tables before/after the session so tests are deterministic."""
    async with test_engine.begin() as conn:
        await conn.execute(
            text(
                "TRUNCATE rescue_assignments, agent_actions_log, agent_plans, "
                "emergency_requests, resources, shelters, volunteers, users "
                "RESTART IDENTITY CASCADE"
            )
        )
    yield
    async with test_engine.begin() as conn:
        await conn.execute(
            text(
                "TRUNCATE rescue_assignments, agent_actions_log, agent_plans, "
                "emergency_requests, resources, shelters, volunteers, users "
                "RESTART IDENTITY CASCADE"
            )
        )
    await test_engine.dispose()
