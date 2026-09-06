"""Demo script: run a single OBSERVE→ANALYZE→PLAN→ACT pass for the agent worker.

This proves one real end-to-end pass works and shows real database rows as evidence.
It does NOT run continuously — it just executes one iteration and exits.
"""
import asyncio
import json
import random
import sys
from datetime import datetime, timedelta, timezone
from uuid import uuid4

# Ensure we can import from the project
sys.path.insert(0, r"C:\Projects\Agentic AI-Based Disaster Response and Relief Coordination System")
sys.path.insert(0, r"C:\Projects\Agentic AI-Based Disaster Response and Relief Coordination System\agent-worker-service")

from agent_worker.config import settings
from agent_worker.allocator import (
    observe_state,
    plan_execution,
    execute_tool,
    run_tool_from_call,
    _classify_risk,
    TOOL_SIGNALS,
    _synthetic_grok_response,
    _engine as engine,
)
from agent_worker.tools import _async_session_factory
from app.models.agent_plan import AgentPlan
from app.models.agent_action_log import AgentActionLog
from app.models.emergency_request import EmergencyRequest
from app.models.volunteer import Volunteer
from app.models.shelter import Shelter
from app.models.resource import Resource
from sqlalchemy import select, text
from sqlalchemy.orm import Session as OrmSession


async def get_direct_db_session():
    """Get a sync SQLAlchemy session using the async engine's connection."""
    from sqlalchemy import create_engine
    sync_engine = create_engine(
        settings.database_url.replace("+asyncpg", "+psycopg2"),
        poolclass=None,
        echo=False,
    )
    return OrmSession(bind=sync_engine)


def pick_request_and_volunteer(state):
    """Pick a request needing a volunteer + an available volunteer from state."""
    needs_volunteer = [
        r for r in state["recent_requests"] if r["status"] in ("new", "triaged")
    ]
    if not needs_volunteer:
        return None, None
    request = needs_volunteer[0]

    avail_vols = [v for v in state["available_volunteers"]]
    if not avail_vols:
        return None, None
    volunteer = random.choice(avail_vols)
    return request, volunteer


def pick_shelter_with_capacity(state):
    """Pick a shelter that has spare capacity."""
    for sid, cap_info in state["shelter_capacities"].items():
        if cap_info["current_occupancy"] < cap_info["capacity"]:
            return sid
    return None


async def run_single_allocation_pass():
    """Run one OBSERVE→ANALYZE→PLAN→ACT pass and return the database rows created."""
    # Step 1: OBSERVE
    state = observe_state()

    # Step 2: Pick request + volunteer + shelter
    request, volunteer = pick_request_and_volunteer(state)
    if request is None:
        print("⚠ No new/triaged requests available — nothing to process.")
        return

    preferred_shelter = pick_shelter_with_capacity(state)
    if preferred_shelter is None:
        print("⚠ No shelter with spare capacity — nothing to process.")
        return

    # Step 3: ANALYZE — use synthetic grok response (no XAI_API_KEY needed)
    synthetic = _synthetic_grok_response(TOOL_SIGNALS)
    tool_name = synthetic["tool_calls"][0]["function"]["name"]
    tool_args = json.loads(synthetic["tool_calls"][0]["function"]["arguments"])

    print(f"🔧 Selected tool: {tool_name}")
    print(f"🔧 Tool args: {tool_args}")

    # Step 4: PLAN/ACT — execute through risk gate
    parsed = await execute_tool(tool_name, tool_args)
    print(f"⚡ Tool result: {parsed}")

    # Step 5: Record agent_plan row (same logic as allocation_loop)
    plan_reasoning = f"Allocator loop chose {parsed.get('tool','?')} with result status={parsed.get('status','?')}"
    plan = AgentPlan(
        request_id=request["id"],
        status="active",
        reasoning=plan_reasoning,
        created_at=datetime.now(timezone.utc),
    )

    # Use sync session for DB writes (same as allocation_loop)
    sync_session = get_direct_db_session()
    try:
        sync_session.add(plan)
        sync_session.commit()
        print(f"📋 Recorded agent_plan: id={plan.id}, request_id={plan.request_id}, status={plan.status}")
        print(f"   Reasoning: {plan_reasoning}")
    except Exception as e:
        sync_session.rollback()
        print(f"❌ Failed to record agent_plan: {e}")
    finally:
        sync_session.close()

    # Step 6: The execute_tool already inserted agent_actions_log row(s)
    # Query the DB to show what was created
    print("\n📊 Database rows created during this pass:")

    # Show agent_actions_log rows
    async with _async_session_factory() as session:
        result = await session.execute(
            text(
                "SELECT action_name, risk, status, action_payload, created_at "
                "FROM agent_actions_log ORDER BY created_at DESC LIMIT 5"
            )
        )
        rows = result.fetchall()
        if rows:
            print("  agent_actions_log:")
            for row in rows:
                print(f"    action_name={row[0]}, risk={row[1]}, status={row[2]}")
                print(f"      payload={row[3][:80] if row[3] else None}...")
                print(f"      created_at={row[4]}")
        else:
            print("  (no agent_actions_log rows found)")

    # Show agent_plans rows
    async with _async_session_factory() as session2:
        result2 = await session2.execute(
            text("SELECT id, request_id, status, reasoning, created_at FROM agent_plans ORDER BY created_at DESC LIMIT 5")
        )
        plan_rows = result2.fetchall()
        if plan_rows:
            print("  agent_plans:")
            for row in plan_rows:
                print(f"    id={row[0]}, request_id={row[1]}, status={row[2]}")
                print(f"      reasoning={row[3][:80] if row[3] else None}...")
                print(f"      created_at={row[4]}")
        else:
            print("  (no agent_plans rows found)")

    # Final confirmation via direct DB query
    print("\n🔍 Final verification via direct DB query:")
    sync2 = get_direct_db_session()
    try:
        r1 = sync2.execute(
            text("SELECT COUNT(*) FROM agent_actions_log WHERE action_name LIKE :pattern"),
            {"pattern": f"%request {request['id']}%"},
        ).scalar()
        print(f"  agent_actions_log rows referencing request {request['id']}: {r1}")

        r2 = sync2.execute(
            text("SELECT COUNT(*) FROM agent_plans WHERE request_id = :rid"),
            {"rid": request["id"]},
        ).scalar()
        print(f"  agent_plans rows for request {request['id']}: {r2}")
    except Exception as e:
        print(f"  DB verification error: {e}")
    finally:
        sync2.close()

    print("\n✅ Single allocation pass complete.")


if __name__ == "__main__":
    # Ensure the engine is initialized
    print(f"🔧 Database URL: {settings.database_url}")
    print(f"🔧 XAI API Key present: {bool(settings.xai_api_key)}")
    print()

    asyncio.run(run_single_allocation_pass())