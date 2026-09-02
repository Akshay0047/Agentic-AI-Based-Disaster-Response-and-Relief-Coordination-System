import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    volunteer = "volunteer"
    citizen = "citizen"


class RequestStatus(str, enum.Enum):
    new = "new"
    triaged = "triaged"
    assigned = "assigned"
    in_progress = "in_progress"
    resolved = "resolved"
    cancelled = "cancelled"


class EmergencyType(str, enum.Enum):
    flood = "flood"
    earthquake = "earthquake"
    cyclone = "cyclone"
    fire = "fire"
    landslide = "landslide"
    medical = "medical"
    other = "other"


class Severity(str, enum.Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class Priority(str, enum.Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class AvailabilityStatus(str, enum.Enum):
    available = "available"
    busy = "busy"
    unavailable = "unavailable"


class AssignmentStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class ResourceType(str, enum.Enum):
    food = "food"
    water = "water"
    medicine = "medicine"
    blankets = "blankets"
    rescue_equipment = "rescue_equipment"
    medical_team = "medical_team"
    transportation = "transportation"
    other = "other"


class PlanStatus(str, enum.Enum):
    active = "active"
    superseded = "superseded"
    completed = "completed"
    cancelled = "cancelled"


class ActionStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    executed = "executed"
    failed = "failed"


class ActionRisk(str, enum.Enum):
    low = "low"
    high = "high"


class NotificationChannel(str, enum.Enum):
    sns = "sns"
    email = "email"
    in_app = "in_app"


class NotificationStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    failed = "failed"


class WeatherSeverity(str, enum.Enum):
    minor = "minor"
    moderate = "moderate"
    severe = "severe"
    extreme = "extreme"