from pydantic import BaseModel, Field


class TopicStore(BaseModel):
    topic_id: str
    scripts: list[str] = Field(default_factory=list)
    references: list[str] = Field(default_factory=list)
    student_history: list[str] = Field(default_factory=list)

    def get_scripts(self) -> list[str]:
        return self.scripts

    def get_references(self) -> list[str]:
        return self.references

    def get_student_history(self) -> list[str]:
        return self.student_history
