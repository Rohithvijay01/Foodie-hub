import contextlib
from typing import TypeVar

from pydantic import BaseModel
from redis.asyncio import Redis


T = TypeVar("T", bound=BaseModel)


class CacheService:
    def __init__(self, redis: Redis | None):
        self.redis: Redis | None = redis

    async def get_model(self, key: str, model: type[T]) -> T | None:
        if self.redis is None:
            return None
        raw = await self.redis.get(key)
        if not raw:
            return None

        try:
            return model.model_validate_json(raw)
        except Exception:
            # corrupted cache delete
            with contextlib.suppress(Exception):
                await self.redis.delete(key)
            return None

    async def set_model(self, key: str, value: BaseModel, ttl: int) -> None:
        if self.redis is None:
            return
        with contextlib.suppress(Exception):
            await self.redis.set(key, value.model_dump_json(), ex=ttl)

    async def delete(self, key: str) -> None:
        if self.redis is None:
            return
        with contextlib.suppress(Exception):
            await self.redis.delete(key)
