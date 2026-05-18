class StudentStateEngine:
    def __init__(self) -> None:
        self._summaries: dict[str, dict] = {}

    def get_summary(self, student_id: str) -> dict:
        return self._summaries.get(student_id, {"student_id": student_id, "mastery": {}})

    def apply_evaluator_updates(self, updates: dict) -> None:
        student_id = updates.get("student_id", "local")
        self._summaries[student_id] = updates
