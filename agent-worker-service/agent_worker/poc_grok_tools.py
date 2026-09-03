"""Phase 3 proof-of-concept: a single Grok call with tool calling.

Verifies the wiring ONLY: that we can reach the xAI API with the OpenAI SDK,
send OpenAI-style tool definitions, and parse a structured `tool_calls`
response back. No orchestration loop, no real tool execution — that's
Phases 4-6.

Run from agent-worker-service/:
    python -m agent_worker.poc_grok_tools

Requires XAI_API_KEY in env or a .env file next to this service. Exits
cleanly with SKIP when the key is absent so CI/dev machines without a key
don't fail.
"""

import json
import os
import sys

from agent_worker.config import settings

# A deliberately tiny, realistic tool from the Phase 4 tool list, so the POC
# proves the exact response shape the Tool Executor will parse later.
POC_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_nearby_volunteers",
            "description": "Find volunteers near a lat/lon with a given availability status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "latitude": {"type": "number"},
                    "longitude": {"type": "number"},
                    "availability_status": {
                        "type": "string",
                        "enum": ["available", "busy", "unavailable"],
                    },
                },
                "required": ["latitude", "longitude"],
            },
        },
    }
]

SYSTEM_PROMPT = (
    "You are the planning module of a disaster-response coordination agent. "
    "You do NOT act directly; you propose tool calls for a Tool Executor to "
    "validate and run. Respond only via tool calls."
)


def main() -> int:
    if not settings.xai_api_key:
        print("SKIP: XAI_API_KEY is not set — set it (env or .env) to run the live POC.")
        print("      Never hardcode the key; .env.example has the placeholder.")
        return 0

    try:
        from openai import OpenAI
    except ImportError:
        print("FAIL: the 'openai' package is not installed in this venv.")
        print("      pip install openai")
        return 1

    client = OpenAI(api_key=settings.xai_api_key, base_url=settings.xai_base_url)

    print(f"Model:        {settings.grok_model}")
    print(f"Base URL:     {settings.xai_base_url}")
    print(f"Max tokens:   {settings.grok_max_tokens}")
    print()

    resp = client.chat.completions.create(
        model=settings.grok_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    "A flood emergency was reported at latitude 17.3850, "
                    "longitude 78.4867. Find available volunteers nearby."
                ),
            },
        ],
        tools=POC_TOOLS,
        tool_choice="auto",
        max_tokens=settings.grok_max_tokens,
        temperature=settings.grok_temperature,
    )

    choice = resp.choices[0]
    print(f"finish_reason: {choice.finish_reason}")
    if resp.usage:
        print(f"tokens used:   prompt={resp.usage.prompt_tokens} "
              f"completion={resp.usage.completion_tokens}")

    tool_calls = choice.message.tool_calls or []
    if not tool_calls:
        print("FAIL: model did not propose any tool call.")
        print(f"Raw content: {choice.message.content!r}")
        return 1

    ok = True
    for tc in tool_calls:
        # Parse with the exact OpenAI-function-calling shape the Tool
        # Executor will consume in Phase 4.
        try:
            args = json.loads(tc.function.arguments)
        except json.JSONDecodeError as e:
            print(f"FAIL: tool args not valid JSON for {tc.function.name}: {e}")
            ok = False
            continue
        print(f"TOOL CALL: {tc.function.name}({json.dumps(args)})")
        if tc.function.name != "get_nearby_volunteers":
            print("  (note: unexpected tool name — parsing still worked)")
    print()
    print("PASS" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
