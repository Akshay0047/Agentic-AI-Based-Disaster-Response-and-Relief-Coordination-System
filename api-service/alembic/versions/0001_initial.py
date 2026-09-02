"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-09-02 00:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def _uuid_pk():
    return postgresql.UUID(as_uuid=True)


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", _uuid_pk(), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("admin", "volunteer", "citizen", name="user_role"),
            nullable=False,
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "shelters",
        sa.Column("id", _uuid_pk(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("address", sa.String(500), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("current_occupancy", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("has_medical_facility", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "volunteers",
        sa.Column("id", _uuid_pk(), primary_key=True),
        sa.Column("user_id", _uuid_pk(), nullable=False),
        sa.Column("skills", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("equipment", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("availability", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_volunteers_user_id", "volunteers", ["user_id"], unique=True)

    op.create_table(
        "emergency_requests",
        sa.Column("id", _uuid_pk(), primary_key=True),
        sa.Column("requester_user_id", _uuid_pk(), nullable=True),
        sa.Column("requester_name", sa.String(255), nullable=False),
        sa.Column("requester_contact", sa.String(255), nullable=False),
        sa.Column(
            "emergency_type",
            sa.Enum("flood", "earthquake", "cyclone", "fire", "landslide", "medical", "other", name="emergency_type"),
            nullable=False,
        ),
        sa.Column("description", sa.String(2000), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("number_of_people", sa.Integer(), nullable=False, server_default="1"),
        sa.Column(
            "status",
            sa.Enum("new", "triaged", "assigned", "in_progress", "resolved", "cancelled", name="request_status"),
            nullable=False,
        ),
        sa.Column("severity", sa.Enum("critical", "high", "medium", "low", name="severity"), nullable=True),
        sa.Column("priority", sa.Enum("critical", "high", "medium", "low", name="priority"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["requester_user_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_emergency_requests_requester_user_id", "emergency_requests", ["requester_user_id"])

    op.create_table(
        "resources",
        sa.Column("id", _uuid_pk(), primary_key=True),
        sa.Column("shelter_id", _uuid_pk(), nullable=True),
        sa.Column(
            "resource_type",
            sa.Enum("food", "water", "medicine", "blankets", "rescue_equipment", "medical_team", "transportation", "other", name="resource_type"),
            nullable=False,
        ),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("unit", sa.String(50), nullable=False, server_default="units"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["shelter_id"], ["shelters.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_resources_shelter_id", "resources", ["shelter_id"])

    op.create_table(
        "rescue_assignments",
        sa.Column("id", _uuid_pk(), primary_key=True),
        sa.Column("request_id", _uuid_pk(), nullable=False),
        sa.Column("volunteer_id", _uuid_pk(), nullable=True),
        sa.Column("shelter_id", _uuid_pk(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("pending", "accepted", "declined", "in_progress", "completed", "cancelled", name="assignment_status"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["request_id"], ["emergency_requests.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["volunteer_id"], ["volunteers.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["shelter_id"], ["shelters.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_rescue_assignments_request_id", "rescue_assignments", ["request_id"])
    op.create_index("ix_rescue_assignments_volunteer_id", "rescue_assignments", ["volunteer_id"])

    op.create_table(
        "agent_plans",
        sa.Column("id", _uuid_pk(), primary_key=True),
        sa.Column("request_id", _uuid_pk(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("active", "superseded", "completed", "cancelled", name="plan_status"),
            nullable=False,
        ),
        sa.Column("plan_summary", sa.Text(), nullable=True),
        sa.Column("reasoning", sa.Text(), nullable=True),
        sa.Column("superseded_by", _uuid_pk(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["request_id"], ["emergency_requests.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["superseded_by"], ["agent_plans.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_agent_plans_request_id", "agent_plans", ["request_id"])

    op.create_table(
        "agent_actions_log",
        sa.Column("id", _uuid_pk(), primary_key=True),
        sa.Column("plan_id", _uuid_pk(), nullable=True),
        sa.Column("action_name", sa.Text(), nullable=False),
        sa.Column("action_payload", sa.Text(), nullable=True),
        sa.Column("risk", sa.Enum("low", "high", name="action_risk"), nullable=False),
        sa.Column(
            "status",
            sa.Enum("pending", "approved", "rejected", "executed", "failed", name="action_status"),
            nullable=False,
        ),
        sa.Column("approved_by", _uuid_pk(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["plan_id"], ["agent_plans.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["approved_by"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_agent_actions_log_plan_id", "agent_actions_log", ["plan_id"])

    op.create_table(
        "notifications",
        sa.Column("id", _uuid_pk(), primary_key=True),
        sa.Column("recipient_id", _uuid_pk(), nullable=True),
        sa.Column("recipient_type", sa.String(50), nullable=True),
        sa.Column(
            "channel",
            sa.Enum("sns", "email", "in_app", name="notification_channel"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum("pending", "sent", "failed", name="notification_status"),
            nullable=False,
        ),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "weather_events",
        sa.Column("id", _uuid_pk(), primary_key=True),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column(
            "severity",
            sa.Enum("minor", "moderate", "severe", "extreme", name="weather_severity"),
            nullable=False,
        ),
        sa.Column("region", sa.String(255), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_weather_events_region", "weather_events", ["region"])


def downgrade() -> None:
    op.drop_table("weather_events")
    op.drop_table("notifications")
    op.drop_index("ix_agent_actions_log_plan_id", table_name="agent_actions_log")
    op.drop_table("agent_actions_log")
    op.drop_index("ix_agent_plans_request_id", table_name="agent_plans")
    op.drop_table("agent_plans")
    op.drop_index("ix_rescue_assignments_volunteer_id", table_name="rescue_assignments")
    op.drop_index("ix_rescue_assignments_request_id", table_name="rescue_assignments")
    op.drop_table("rescue_assignments")
    op.drop_index("ix_resources_shelter_id", table_name="resources")
    op.drop_table("resources")
    op.drop_index("ix_emergency_requests_requester_user_id", table_name="emergency_requests")
    op.drop_table("emergency_requests")
    op.drop_index("ix_volunteers_user_id", table_name="volunteers")
    op.drop_table("volunteers")
    op.drop_table("shelters")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")