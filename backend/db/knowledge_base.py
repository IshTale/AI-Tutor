class KnowledgeBase:
    def __init__(self) -> None:
        self.assets: list[dict] = []

    def semantic_search(self, query: str, topic_id: str | None = None) -> list[dict]:
        return [
            asset
            for asset in self.assets
            if (topic_id is None or asset.get("topic_id") == topic_id)
            and query.lower() in str(asset.get("metadata", "")).lower()
        ]

    def index_asset(self, asset_uri: str, embedding: list[float], metadata: dict) -> None:
        self.assets.append({"asset_uri": asset_uri, "embedding": embedding, "metadata": metadata})
