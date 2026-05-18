class MasteryCalculator:
    def calculate(self, topic_id: str, session_log: list[dict]) -> float:
        touched = any(topic_id in str(item) for item in session_log)
        return 0.65 if touched else 0.5
