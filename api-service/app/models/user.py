import uuid

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import UserRole


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), nullable=False, default=UserRole.citizen
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    volunteer = relationship(
        "Volunteer", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    emergency_requests = relationship("EmergencyRequest", back_populates="requester")
    approved_actions = relationship(
        "AgentActionLog",
        back_populates="approver",
        foreign_keys="AgentActionLog.approved_by",
    )