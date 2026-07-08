"""
Simple in-memory TTL cache for public coding profile APIs.
It exists to reduce free-tier rate-limit pressure during demos.
"""
import time
from typing import Any

_cache: dict[str, tuple[float, Any]] = {}


# Reads a cache value and returns None when the key is missing or expired.
def get_cache(key: str) -> Any | None:
    item = _cache.get(key)
    if not item:
        return None
    expires_at, value = item
    if expires_at < time.time():
        _cache.pop(key, None)
        return None
    return value


# Writes a cache value and returns the stored value for chaining.
def set_cache(key: str, value: Any, ttl_seconds: int = 900) -> Any:
    _cache[key] = (time.time() + ttl_seconds, value)
    return value
