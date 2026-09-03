"""Simulation data generator for the Disaster Response demo.

Generates a realistic-ish dataset for demos and load testing:
    - 20-50 volunteers (with linked users)
    - 5-10 shelters, each stocked with resources
    - 100-500 emergency requests in mixed states

Run from api-service/ (requires migrated Postgres):
    python -m app.scripts.simulation_data --volunteers 30 --shelters 8 --requests 200

Or from the repo-root simulation/ folder wrapper:
    python simulation/generate.py --volunteers 30 --shelters 8 --requests 200

Idempotent-ish: skips entirely if any users already exist (use the seed
script's convention). Not safe to run twice without clearing tables.
Pass --wipe to TRUNCATE first (dev DBs only).
"""

import argparse
import asyncio
import random

from sqlalchemy import func, select, text

from app.core.security import hash_password
from app.db.base import Base  # noqa: F401  (registers ALL models so string relationships resolve)
from app.db.session import AsyncSessionLocal, engine
from app.models.emergency_request import EmergencyRequest
from app.models.enums import (
    AvailabilityStatus,
    EmergencyType,
    Priority,
    RequestStatus,
    ResourceType,
    Severity,
    UserRole,
)
from app.models.resource import Resource
from app.models.shelter import Shelter
from app.models.user import User
from app.models.volunteer import Volunteer

SKILL_POOL = [
    "medical", "first_aid", "rescue", "driving", "logistics",
    "communications", "engineering", "cooking", "counseling", "swimming",
]
EQUIPMENT_POOL = [
    "first_aid_kit", "stretcher", "boat", "rope", "generator",
    "radio", "ambulance", "excavator", "water_purifier", "tent",
]
SHELTER_NAMES = [
    "Central Relief Shelter", "North Community Hall", "East District Gymnasium",
    "Riverside School Campus", "South Block Stadium", "Hilltop Public Library",
    "West Market Warehouse", "Old Town Convention Center", "Lakeview Clinic Annex",
    "Airport Logistics Hub",
]
FIRST_NAMES = ["Aarav", "Priya", "Rohan", "Sneha", "Vikram", "Ananya", "Karan",
               "Meera", "Arjun", "Divya", "Rahul", "Pooja", "Sanjay", "Lakshmi",
               "Nikhil", "Riya", "Amit", "Kavya", "Manoj", "Shreya"]
REQUEST_DESCRIPTIONS = {
    "flood": "Water level rising fast, {n} people trapped",
    "earthquake": "Building collapsed after tremor, {n} people under debris",
    "cyclone": "Roof torn off, family of {n} needs evacuation",
    "fire": "Fire spreading through apartment block, {n} trapped",
    "landslide": "Mudslide buried road, {n} vehicles stranded",
    "medical": "Medical emergency, {n} person(s) need immediate care",
    "other": "Urgent assistance needed for {n} people",
}

# Roughly Hyderabad-centered bounding box used by the seed script too.
LAT_RANGE = (17.30, 17.50)
LON_RANGE = (78.35, 78.60)


def _coord(rng: random.Random) -> tuple[float, float]:
    return (
        round(rng.uniform(*LAT_RANGE), 5),
        round(rng.uniform(*LON_RANGE), 5),
    )


async def generate(num_volunteers: int, num_shelters: int, num_requests: int,
                   wipe: bool) -> None:
    rng = random.Random(42)

    async with AsyncSessionLocal() as db:
        if wipe:
            await db.execute(
                text(
                    "TRUNCATE rescue_assignments, agent_actions_log, agent_plans, "
                    "emergency_requests, resources, shelters, volunteers, users "
                    "RESTART IDENTITY CASCADE"
                )
            )
            await db.commit()

        existing = (
            await db.execute(select(func.count()).select_from(User))
        ).scalar_one()
        if existing > 0:
            print("Users already exist — aborting. Pass --wipe to reset first.")
            return

        admin = User(
            email="admin@example.com",
            full_name="System Admin",
            hashed_password=hash_password("password123"),
            role=UserRole.admin,
        )
        db.add(admin)

        # --- Shelters ---
        shelters = []
        for i in range(num_shelters):
            lat, lon = _coord(rng)
            shelters.append(
                Shelter(
                    name=f"{rng.choice(SHELTER_NAMES)} #{i + 1}",
                    address=f"{rng.randint(1, 200)} Simulation Ave",
                    latitude=lat,
                    longitude=lon,
                    capacity=rng.randint(50, 500),
                    current_occupancy=rng.randint(0, 100),
                    has_medical_facility=rng.random() < 0.4,
                )
            )
        db.add_all(shelters)
        await db.flush()

        # --- Resources (2-5 per shelter) ---
        resource_types = list(ResourceType)
        resources = []
        for shelter in shelters:
            for _ in range(rng.randint(2, 5)):
                resources.append(
                    Resource(
                        shelter_id=shelter.id,
                        resource_type=rng.choice(resource_types),
                        quantity=rng.randint(10, 800),
                        unit=rng.choice(["units", "meals", "liters", "kits", "boxes"]),
                    )
                )
        db.add_all(resources)

        # --- Volunteers ---
        shared_hash = hash_password("password123")  # one hash, reused
        for i in range(num_volunteers):
            user = User(
                email=f"simvol{i + 1}@example.com",
                full_name=f"{rng.choice(FIRST_NAMES)} Simvol {i + 1}",
                hashed_password=shared_hash,
                role=UserRole.volunteer,
            )
            db.add(user)
            await db.flush()
            lat, lon = _coord(rng)
            status = rng.choices(
                list(AvailabilityStatus), weights=[60, 25, 15]
            )[0]
            db.add(
                Volunteer(
                    user_id=user.id,
                    skills=rng.sample(SKILL_POOL, k=rng.randint(1, 4)),
                    equipment=rng.sample(EQUIPMENT_POOL, k=rng.randint(0, 3)),
                    availability_status=status,
                    current_workload=rng.randint(0, 5)
                    if status != AvailabilityStatus.unavailable
                    else 0,
                    latitude=lat,
                    longitude=lon,
                )
            )

        # --- Emergency requests ---
        types = list(EmergencyType)
        statuses = list(RequestStatus)
        severities = list(Severity)
        for _ in range(num_requests):
            etype = rng.choice(types)
            n = rng.randint(1, 12)
            lat, lon = _coord(rng)
            db.add(
                EmergencyRequest(
                    requester_name=f"{rng.choice(FIRST_NAMES)} Caller",
                    requester_contact=f"+91{rng.randint(6000000000, 9999999999)}",
                    emergency_type=etype,
                    description=REQUEST_DESCRIPTIONS[etype.value].format(n=n),
                    latitude=lat,
                    longitude=lon,
                    number_of_people=n,
                    status=rng.choices(
                        statuses, weights=[40, 15, 15, 10, 15, 5]
                    )[0],
                    severity=rng.choice(severities),
                    priority=rng.choice(list(Priority)),
                )
            )

        await db.commit()
        print(
            f"Simulation data generated: 1 admin, {num_volunteers} volunteers, "
            f"{num_shelters} shelters, {len(resources)} resources, "
            f"{num_requests} emergency requests."
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--volunteers", type=int, default=30,
                        help="number of volunteers (spec range 20-50)")
    parser.add_argument("--shelters", type=int, default=8,
                        help="number of shelters (spec range 5-10)")
    parser.add_argument("--requests", type=int, default=200,
                        help="number of emergency requests (spec range 100-500)")
    parser.add_argument("--wipe", action="store_true",
                        help="TRUNCATE all data tables first (dev only)")
    args = parser.parse_args()

    if not (20 <= args.volunteers <= 50):
        parser.error("--volunteers must be within 20-50")
    if not (5 <= args.shelters <= 10):
        parser.error("--shelters must be within 5-10")
    if not (100 <= args.requests <= 500):
        parser.error("--requests must be within 100-500")

    asyncio.run(generate(args.volunteers, args.shelters, args.requests, args.wipe))


if __name__ == "__main__":
    main()
