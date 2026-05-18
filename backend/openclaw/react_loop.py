import asyncio
from uuid import uuid4

from backend.openclaw.task_plan import Task, TaskPlan
from backend.security.rate_limiter import RateLimiter
from backend.tools.base import ToolResult
from backend.tools.registry import ToolRegistry


class ReActLoop:
    def __init__(self, tools: ToolRegistry, rate_limiter: RateLimiter) -> None:
        self.tools = tools
        self.rate_limiter = rate_limiter

    def reason(self, student_input: str, selected_file_id: str | None = None) -> TaskPlan:
        tasks = [
            Task(id="reason", tool="reason", payload={"prompt": student_input}),
            Task(id="generate", tool="generate", payload={"instruction": student_input}, depends_on=["reason"]),
            Task(id="animate", tool="animate", payload={}, depends_on=["generate"]),
        ]
        if selected_file_id:
            tasks.insert(0, Task(id="fetch_file", tool="fetch_file", payload={"path": selected_file_id}))
            tasks[1].depends_on.append("fetch_file")

        return TaskPlan(spoken_opener="Let me sketch that out and talk through it.", tasks=tasks)

    async def act(self, plan: TaskPlan) -> list[ToolResult]:
        loop_id = str(uuid4())
        results: list[ToolResult] = []

        while not plan.is_complete:
            ready = plan.get_ready_tasks()
            if not ready:
                raise RuntimeError("TaskPlan is blocked by unresolved dependencies")

            batch = []
            for task in ready:
                self.rate_limiter.check(task.tool, loop_id)
                batch.append(self.tools.invoke(task.tool, task.payload))

            batch_results = await asyncio.gather(*batch)
            for task, result in zip(ready, batch_results, strict=True):
                plan.mark_complete(task.id)
                results.append(result)

        return results
