from backend.roadmap.node import MisconceptionNode, TopicNode


class PedagogicalRoadmap:
    def __init__(self) -> None:
        self.nodes: dict[str, TopicNode] = {}
        self.misconceptions: dict[str, MisconceptionNode] = {}

    def get_node(self, topic_id: str) -> TopicNode:
        return self.nodes.setdefault(topic_id, TopicNode(topic_id=topic_id, label=topic_id.replace("-", " ").title()))

    def categorize_query(self, query: str) -> TopicNode:
        slug = "-".join(query.lower().split()[:4]) or "general"
        return self.get_node(slug)

    def update_mastery(self, topic_id: str, new_score: float) -> None:
        node = self.get_node(topic_id)
        node.mastery_score = max(0.0, min(1.0, new_score))

    def add_misconception(self, topic_id: str, description: str) -> MisconceptionNode:
        misconception_id = f"{topic_id}-misconception-{len(self.misconceptions) + 1}"
        node = MisconceptionNode(
            misconception_id=misconception_id,
            parent_topic_id=topic_id,
            description=description,
        )
        self.misconceptions[misconception_id] = node
        return node

    def set_misconception_cleared(self, misconception_id: str) -> None:
        if misconception_id in self.misconceptions:
            self.misconceptions[misconception_id].cleared_in_session = True
