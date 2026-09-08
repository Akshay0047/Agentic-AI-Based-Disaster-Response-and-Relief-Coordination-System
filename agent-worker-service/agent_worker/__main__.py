"""Runnable local agent worker: ``python -m agent_worker``."""

import asyncio
import logging
import signal

from agent_worker.allocator import allocation_loop, replanning_loop


async def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    stop_event = asyncio.Event()
    loop = asyncio.get_running_loop()

    def request_stop() -> None:
        logging.getLogger("agent_worker").info("Shutdown requested; stopping worker loops.")
        stop_event.set()

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, request_stop)
        except NotImplementedError:  # Windows event loops handle KeyboardInterrupt below.
            pass

    logging.getLogger("agent_worker").info("Agent worker started: allocation and replanning loops are running.")
    tasks = [asyncio.create_task(allocation_loop(stop_event)), asyncio.create_task(replanning_loop(stop_event))]
    try:
        await asyncio.gather(*tasks)
    except KeyboardInterrupt:
        request_stop()
        await asyncio.gather(*tasks, return_exceptions=True)


if __name__ == "__main__":
    asyncio.run(main())
