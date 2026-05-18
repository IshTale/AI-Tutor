class ContextBuilder:
    def build(self, student_input: str, session_id: str, whiteboard_state_id: str | None = None) -> dict:
        return {
            "student_input": student_input,
            "session_id": session_id,
            "whiteboard_state_id": whiteboard_state_id,
            "mastery_summary": "local-dev",
        }

    def inject_misconceptions(self, scratchpad: dict, topic_node: dict) -> dict:
        scratchpad["misconceptions"] = topic_node.get("misconceptions", [])
        return scratchpad
