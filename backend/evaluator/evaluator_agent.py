from backend.db.session_store import SessionStore
from backend.evaluator.mastery_calculator import MasteryCalculator
from backend.evaluator.misconception_detector import MisconceptionDetector


class EvaluatorAgent:
    def __init__(
        self,
        sessions: SessionStore,
        mastery_calculator: MasteryCalculator,
        misconception_detector: MisconceptionDetector,
    ) -> None:
        self.sessions = sessions
        self.mastery_calculator = mastery_calculator
        self.misconception_detector = misconception_detector

    async def run(self, session_id: str) -> dict:
        log = await self.sessions.get_session_log(session_id)
        return {
            "session_id": session_id,
            "mastery": self.mastery_calculator.calculate("general", log),
            "misconceptions": [candidate.model_dump() for candidate in self.misconception_detector.detect(log)],
        }
