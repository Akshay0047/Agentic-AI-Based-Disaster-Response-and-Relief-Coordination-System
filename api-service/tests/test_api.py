"""Phase 1 API tests.

Run from api-service/ (requires running Postgres + applied migrations):
    pytest tests/ -v
"""

import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _register(email: str, role: str = "citizen", name: str | None = None) -> dict:
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": name or email.split("@")[0],
            "password": "secret123",
            "role": role,
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def _token(email: str, password: str = "secret123") -> str:
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_register_and_login():
    _register("citizen1@example.com")
    token = _token("citizen1@example.com")
    assert token


def test_unauthenticated_request_rejected():
    resp = client.get("/api/v1/requests")
    assert resp.status_code == 401


def test_invalid_jwt_rejected():
    resp = client.get("/api/v1/requests", headers=_auth("not-a-jwt"))
    assert resp.status_code == 401


def test_create_and_read_own_request():
    _register("citizen2@example.com")
    token = _token("citizen2@example.com")

    resp = client.post(
        "/api/v1/requests",
        json={
            "emergency_type": "flood",
            "description": "Trapped in flooded house",
            "requester_name": "Citizen Two",
            "requester_contact": "+911111111111",
            "number_of_people": 3,
        },
        headers=_auth(token),
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "new"
    request_id = resp.json()["id"]

    resp = client.get(f"/api/v1/requests/{request_id}", headers=_auth(token))
    assert resp.status_code == 200


def test_citizen_cannot_view_other_citizen_request():
    _register("citizen_a@example.com", name="A")
    _register("citizen_b@example.com", name="B")
    token_a = _token("citizen_a@example.com")
    token_b = _token("citizen_b@example.com")

    resp = client.post(
        "/api/v1/requests",
        json={
            "emergency_type": "fire",
            "description": "fire",
            "requester_name": "A",
            "requester_contact": "111",
        },
        headers=_auth(token_a),
    )
    request_id = resp.json()["id"]

    # B's list should not contain A's request
    resp = client.get("/api/v1/requests", headers=_auth(token_b))
    assert resp.status_code == 200
    ids = [r["id"] for r in resp.json()]
    assert request_id not in ids

    # B cannot read A's request directly
    resp = client.get(f"/api/v1/requests/{request_id}", headers=_auth(token_b))
    assert resp.status_code == 404


def test_citizen_cannot_view_other_citizen_assignment():
    # Setup: two citizens, one volunteer, an admin.
    _register("admin@example.com", role="admin")
    _register("citizen_a2@example.com", name="A2")
    _register("citizen_b2@example.com", name="B2")
    _register("vol@example.com", role="volunteer")

    token_a = _token("citizen_a2@example.com")
    token_b = _token("citizen_b2@example.com")
    admin_token = _token("admin@example.com")

    # A creates a request
    resp = client.post(
        "/api/v1/requests",
        json={
            "emergency_type": "medical",
            "description": "injured person",
            "requester_name": "A2",
            "requester_contact": "111",
        },
        headers=_auth(token_a),
    )
    request_id = resp.json()["id"]

    # Create an assignment for A's request directly via DB (Phase 1 has no POST
    # /assignments endpoint, so insert through SQLAlchemy).
    import asyncio

    from sqlalchemy import select

    from app.db.session import AsyncSessionLocal
    from app.models.rescue_assignment import RescueAssignment
    from app.models.volunteer import Volunteer

    async def _insert_assignment() -> uuid.UUID:
        async with AsyncSessionLocal() as db:
            vol = (await db.execute(select(Volunteer))).scalars().first()
            assignment = RescueAssignment(
                request_id=uuid.UUID(request_id),
                volunteer_id=vol.id,
                shelter_id=None,
            )
            db.add(assignment)
            await db.commit()
            return assignment.id

    assignment_id = asyncio.run(_insert_assignment())

    # B must not see A's assignment in the list
    resp = client.get("/api/v1/assignments", headers=_auth(token_b))
    assert resp.status_code == 200
    ids = [a["id"] for a in resp.json()]
    assert str(assignment_id) not in ids

    # B cannot fetch A's assignment directly
    resp = client.get(f"/api/v1/assignments/{assignment_id}", headers=_auth(token_b))
    assert resp.status_code in (403, 404)

    # Admin CAN see the assignment
    resp = client.get(f"/api/v1/assignments/{assignment_id}", headers=_auth(admin_token))
    assert resp.status_code == 200


def test_enum_definitions():
    from app.models.enums import Priority

    assert Priority("critical").value == "critical"
    assert "p1" not in {p.value for p in Priority}


def test_volunteer_availability_endpoint():
    _register("vol_avail@example.com", role="volunteer")
    token = _token("vol_avail@example.com")

    from app.models.enums import AvailabilityStatus

    # find own volunteer id
    resp = client.get("/api/v1/volunteers", headers=_auth(token))
    assert resp.status_code == 200
    volunteers = resp.json()
    assert len(volunteers) == 1
    volunteer_id = volunteers[0]["id"]
    assert volunteers[0]["availability_status"] == AvailabilityStatus.available.value

    resp = client.patch(
        f"/api/v1/volunteers/{volunteer_id}/availability",
        json={"availability_status": "busy"},
        headers=_auth(token),
    )
    assert resp.status_code == 200
    assert resp.json()["availability_status"] == "busy"