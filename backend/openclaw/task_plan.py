from pydantic import BaseModel, Field


class Task(BaseModel):
    id: str
    tool: str
    payload: dict = Field(default_factory=dict)
    depends_on: list[str] = Field(default_factory=list)
    parallel_with: list[str] = Field(default_factory=list)


class TaskPlan(BaseModel):
    spoken_opener: str
    tasks: list[Task]
    completed: set[str] = Field(default_factory=set)

    def get_ready_tasks(self) -> list[Task]:
        return [
            task
            for task in self.tasks
            if task.id not in self.completed and all(dep in self.completed for dep in task.depends_on)
        ]

    def mark_complete(self, task_id: str) -> None:
        self.completed.add(task_id)

    @property
    def is_complete(self) -> bool:
        return len(self.completed) == len(self.tasks)
