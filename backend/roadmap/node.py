from pydantic import BaseModel, Field


class TopicNode(BaseModel):
    topic_id: str
    label: str
    mastery_score: float = 0.0
    asset_ids: list[str] = Field(default_factory=list)


class MisconceptionNode(BaseModel):
    misconception_id: str
    parent_topic_id: str
    description: str
    cleared_in_session: bool = False
