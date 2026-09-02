import uuid

from sqlalchemy import Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import ActionRisk, ActionStatus


class AgentActionLog(Base, TimestampMixin):
    __tablename__ = "agent_actions_log"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    plan_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("agent_plans.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action_name: Mapped[str] = mapped_column(Text, nullable=False)
    action_payload: Mapped[str] = mapped_column(Text, nullable=True)
    risk: Mapped[ActionRisk] = mapped_column(
        Enum(ActionRisk, name="action_risk"), nullable=False, default=ActionRisk.low
    )
    status: Mapped[ActionStatus] = mapped_column(
        Enum(ActionStatus, name="action_status"), nullable=False, default=ActionStatus.pending
    )
    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    approver = relationship("User", back_populates="approved_actions", foreign_keys=[approved_by])