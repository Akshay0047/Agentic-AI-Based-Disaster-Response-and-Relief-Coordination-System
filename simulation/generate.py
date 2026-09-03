"""Entry point for the simulation data generator.

Delegates to api-service/app/scripts/simulation_data.py so there's a single
implementation. Usage (from repo root):

    python simulation/generate.py --volunteers 30 --shelters 8 --requests 200 --wipe
"""

import subprocess
import sys
from pathlib import Path

API_SERVICE = Path(__file__).resolve().parent.parent / "api-service"


def main() -> int:
    return subprocess.call(
        [sys.executable, "-m", "app.scripts.simulation_data", *sys.argv[1:]],
        cwd=str(API_SERVICE),
    )


if __name__ == "__main__":
    raise SystemExit(main())
