"""Shared fixtures for the API test suite.

These tests require a running PostgreSQL database (via `docker compose up -d`)
with migrations applied (`alembic upgrade head`).
"""

import asyncio

import pytest_asyncio
from sqlalchemy import text

from app.db.session import engine


@pytest_asyncio.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def _truncate_tables():
    """Wipe tables before/after the session so tests are deterministic."""
    async with engine.begin() as conn:
        await conn.execute(
            text(
                "TRUNCATE rescue_assignments, agent_actions_log, agent_plans, "
                "emergency_requests, resources, shelters, volunteers, users "
                "RESTART IDENTITY CASCADE"
            )
        )
    yield
    async with engine.begin() as conn:
        await conn.execute(
            text(
                "TRUNCATE rescue_assignments, agent_actions_log, agent_plans, "
                "emergency_requests, resources, shelters, volunteers, users "
                "RESTART IDENTITY CASCADE"
            )
        )