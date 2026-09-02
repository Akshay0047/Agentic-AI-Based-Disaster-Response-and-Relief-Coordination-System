"""Declarative base and model import registry.

Import all models here so that Alembic autogenerate can discover them.
"""

from app.db.base_class import Base  # noqa: F401

from app.models.user import User  # noqa: F401
from app.models.volunteer import Volunteer  # noqa: F401
from app.models.shelter import Shelter  # noqa: F401
from app.models.emergency_request import EmergencyRequest  # noqa: F401
from app.models.resource import Resource  # noqa: F401
from app.models.rescue_assignment import RescueAssignment  # noqa: F401
from app.models.agent_plan import AgentPlan  # noqa: F401
from app.models.agent_action_log import AgentActionLog  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.weather_event import WeatherEvent  # noqa: F401