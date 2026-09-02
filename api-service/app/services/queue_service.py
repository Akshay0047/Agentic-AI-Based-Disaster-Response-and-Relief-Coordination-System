import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class QueueService:
    """SQS-shaped message publishing interface.

    In Phase 1 this is a no-op/logging stub. It defines the contract the Agent
    Worker will rely on, so wiring in real AWS SQS later only requires
    implementing these methods (and flippa ``SQS_ENABLED``).
    """

    def __init__(self) -> None:
        self.enabled = settings.sqs_enabled

    def publish_emergency_request(self, request_id: str) -> None:
        if not self.enabled:
            logger.info(
                "SQS disabled — emergency request %s NOT published to '%s'",
                request_id,
                settings.sqs_emergency_queue,
            )
            return
        # Placeholder for real boto3 SQS publish.
        logger.info(
            "Publishing emergency request %s to queue '%s'",
            request_id,
            settings.sqs_emergency_queue,
        )

    def publish_replan_event(self, request_id: str, reason: str) -> None:
        if not self.enabled:
            logger.info(
                "SQS disabled — replan event for %s NOT published to '%s'",
                request_id,
                settings.sqs_replan_queue,
            )
            return
        logger.info(
            "Publishing replan event for %s (reason=%s) to queue '%s'",
            request_id,
            reason,
            settings.sqs_replan_queue,
        )


queue_service = QueueService()