"""Execution of previously approved high-risk agent actions.

This module deliberately contains only the mutation step.  The worker records a
proposal first; an admin-only API route calls this function after approval.
"""

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import AvailabilityStatus
from app.models.emergency_request import EmergencyRequest
from app.models.notification import Notification
from app.models.resource import Resource
from app.models.rescue_assignment import RescueAssignment
from app.models.shelter import Shelter
from app.models.volunteer import Volunteer


class DeferredActionError(ValueError):
    """The approved action can no longer be safely executed."""


async def execute_approved_action(
    db: AsyncSession, action_name: str, args: dict[str, Any]
) -> dict[str, Any]:
    """Perform one high-risk mutation without creating another audit log."""
    if action_name == "create_rescue_assignment":
        req = await db.get(EmergencyRequest, args["request_id"])
        volunteer = await db.get(Volunteer, args["volunteer_id"])
        shelter = await db.get(Shelter, args["shelter_id"])
        if not req or not volunteer or not shelter:
            raise DeferredActionError("Referenced request, volunteer, or shelter no longer exists")
        if volunteer.availability_status != AvailabilityStatus.available:
            raise DeferredActionError(f"Volunteer {volunteer.id} is not available")
        if shelter.current_occupancy >= shelter.capacity:
            raise DeferredActionError(f"Shelter {shelter.id} is at capacity")
        assignment = RescueAssignment(
            request_id=req.id, volunteer_id=volunteer.id, shelter_id=shelter.id
        )
        db.add(assignment)
        await db.flush()
        return {"assignment_id": str(assignment.id)}

    if action_name == "reserve_relief_resources":
        shelter = await db.get(Shelter, args["shelter_id"])
        if not shelter:
            raise DeferredActionError("Referenced shelter no longer exists")
        resource = await db.scalar(select(Resource).where(
            Resource.shelter_id == shelter.id,
            Resource.resource_type == args["resource_type"],
        ))
        quantity = int(args["quantity"])
        if not resource or resource.quantity < quantity:
            raise DeferredActionError("Insufficient resource inventory at approval time")
        resource.quantity -= quantity
        return {"resource_id": str(resource.id), "remaining": resource.quantity}

    if action_name == "send_emergency_notification":
        notification = Notification(
            recipient_id=args["recipient_id"],
            recipient_type=args["recipient_type"],
            channel=args["channel"],
            message=args["message"],
        )
        db.add(notification)
        await db.flush()
        return {"notification_id": str(notification.id)}

    raise DeferredActionError(f"Action '{action_name}' is not an approvable high-risk action")
