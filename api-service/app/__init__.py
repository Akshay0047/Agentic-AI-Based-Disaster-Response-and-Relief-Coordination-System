import os


def _env(key: str, default: str | None = None) -> str:
    # Load .env lazily so settings can be constructed without a .env present.
    try:
        from dotenv import load_dotenv

        load_dotenv()
    except Exception:
        pass
    value = os.getenv(key, default)
    if value is None:
        return ""
    return value