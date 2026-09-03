# Agent Worker Service

This directory is the **second** of the project's two independent services.

It is architecturally separated from `api-service/` so the two can later be
deployed to separate AWS EC2 Auto Scaling Groups.

## Status

**Phase 3 in progress** — Grok (xAI) wiring POC exists: `agent_worker/poc_grok_tools.py`.

The Agent Worker will be responsible for:

1. Consuming messages from the `emergency-requests` queue (SQS-compatible shape, local implementation for now).
2. Invoking the Grok Agent (OBSERVE → ANALYZE → PLAN → ACT) via the OpenAI-compatible xAI API.
3. Executing approved tool actions through the Tool Executor (risk-gated).
4. Monitoring outcomes.
5. Consuming `replan-events` from the second queue to trigger replanning.

## Phase 3 quickstart

```
# from agent-worker-service/
pip install openai pydantic-settings sqlalchemy[asyncio] asyncpg
# ensure XAI_API_KEY is set (see repo-root .env.example)
python -m agent_worker.poc_grok_tools
```

Without `XAI_API_KEY` the POC exits with `SKIP` (code 0) — it never hardcodes or invents a key.