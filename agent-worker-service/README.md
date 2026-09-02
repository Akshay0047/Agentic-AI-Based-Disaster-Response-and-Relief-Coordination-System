# Agent Worker Service

This directory is the **second** of the project's two independent services.

It is architecturally separated from `api-service/` so the two can later be
deployed to separate AWS EC2 Auto Scaling Groups.

## Status

**Not yet implemented** — this is a placeholder scaffold only.

The Agent Worker will be responsible for:

1. Consuming messages from the `emergency-requests` SQS queue.
2. Invoking the Claude Agent (OBSERVE → ANALYZE → PLAN → ACT).
3. Executing approved tool actions.
4. Monitoring outcomes.
5. Consuming `replan-events` from the second SQS queue to trigger replanning.

This service is built starting in **Phase 3** (Claude integration) and **Phase 4**
(tool calling). It is intentionally empty during Phase 1 and Phase 2.