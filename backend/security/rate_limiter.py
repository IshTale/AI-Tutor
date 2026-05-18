from collections import defaultdict


class RateLimitExceeded(RuntimeError):
    pass


class RateLimiter:
    def __init__(self, limit_per_loop: int = 4) -> None:
        self.limit_per_loop = limit_per_loop
        self._counts: dict[tuple[str, str], int] = defaultdict(int)

    def check(self, tool_name: str, loop_id: str) -> bool:
        key = (loop_id, tool_name)
        self._counts[key] += 1
        if self._counts[key] > self.limit_per_loop:
            raise RateLimitExceeded(f"Tool {tool_name} exceeded rate limit for loop {loop_id}")
        return True
