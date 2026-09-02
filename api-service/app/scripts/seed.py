"""Seed the local database with sample shelters, resources, and volunteers.

Run from api-service/:
    python -m app.scripts.seed

Idempotent-ish: creates sample data only when the referenced tables are empty.
"""

import asyncio

from sqlalchemy import func, select

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.enums import (
    AvailabilityStatus,
    ResourceType,
    UserRole,
)
from app.models.resource import Resource
from app.models.shelter import Shelter
from app.models.user import User
from app.models.volunteer import Volunteer


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        # --- Users (needed to anchor volunteers) ---
        existing_users = await db.execute(select(func.count()).select_from(User))
        user_count = existing_users.scalar_one()

        if user_count > 0:
            print("Users already present — skipping user/volunteer/shelter seeding.")
            return

        # --- Shelters ---
        shelters = [
            Shelter(
                name="Central Relief Shelter",
                address="12 Main Street, City Center",
                latitude=17.3850,
                longitude=78.4867,
                capacity=200,
                current_occupancy=40,
                has_medical_facility=True,
            ),
            Shelter(
                name="North Community Hall",
                address="45 North Avenue",
                latitude=17.4500,
                longitude=78.4000,
                capacity=100,
                current_occupancy=60,
                has_medical_facility=False,
            ),
            Shelter(
                name="East District Gymnasium",
                address="8 East Road",
                latitude=17.3900,
                longitude=78.5500,
                capacity=150,
                current_occupancy=20,
                has_medical_facility=True,
            ),
        ]
        db.add_all(shelters)
        await db.flush()

        # --- Resources ---
        resources = [
            Resource(shelter_id=shelters[0].id, resource_type=ResourceType.food, quantity=500, unit="meals"),
            Resource(shelter_id=shelters[0].id, resource_type=ResourceType.water, quantity=800, unit="liters"),
            Resource(shelter_id=shelters[0].id, resource_type=ResourceType.medicine, quantity=120, unit="kits"),
            Resource(shelter_id=shelters[0].id, resource_type=ResourceType.blankets, quantity=300, unit="units"),
            Resource(shelter_id=shelters[1].id, resource_type=ResourceType.food, quantity=200, unit="meals"),
            Resource(shelter_id=shelters[1].id, resource_type=ResourceType.rescue_equipment, quantity=30, unit="units"),
            Resource(shelter_id=shelters[2].id, resource_type=ResourceType.medical_team, quantity=6, unit="teams"),
        ]
        db.add_all(resources)

        # --- Volunteers (with users) ---
        volunteers_data = [
            ("vol1@example.com", "Alice Volunteer", ["medical", "first_aid"], ["first_aid_kit"], 17.40, 78.50, AvailabilityStatus.available, 1),
            ("vol2@example.com", "Bob Volunteer", ["rescue", "driving"], ["boat"], 17.42, 78.48, AvailabilityStatus.available, 0),
            ("vol3@example.com", "Carol Volunteer", ["medical"], ["stretcher"], 17.44, 78.52, AvailabilityStatus.busy, 3),
            ("vol4@example.com", "Dan Volunteer", ["logistics"], [], 17.38, 78.46, AvailabilityStatus.unavailable, 0),
        ]

        volunteers = []
        for email, name, skills, equipment, lat, lon, status, workload in volunteers_data:
            user = User(
                email=email,
                full_name=name,
                hashed_password=hash_password("password123"),
                role=UserRole.volunteer,
            )
            db.add(user)
            await db.flush()
            volunteer = Volunteer(
                user_id=user.id,
                skills=skills,
                equipment=equipment,
                availability_status=status,
                current_workload=workload,
                latitude=lat,
                longitude=lon,
            )
            db.add(volunteer)
            volunteers.append(volunteer)

        await db.commit()
        print(f"Seeded {len(shelters)} shelters, {len(resources)} resources, {len(volunteers)} volunteers.")


if __name__ == "__main__":
    asyncio.run(seed())