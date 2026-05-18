from pathlib import Path

from backend.config import Settings
from backend.tools.base import BaseTool, ToolResult
from backend.tools.claude_client import ClaudeClient


def _load_knowledge_base(kb_dir: str) -> str:
    """Read all .md files in the knowledge base directory and return as one block."""
    path = Path(kb_dir)
    if not path.exists():
        return ""
    docs = []
    for md_file in sorted(path.glob("**/*.md")):
        content = md_file.read_text(encoding="utf-8").strip()
        if content:
            docs.append(f"### {md_file.stem}\n\n{content}")
    return "\n\n---\n\n".join(docs)


class ReasonTool(BaseTool):
    name = "reason"

    def __init__(self, claude: ClaudeClient, settings: Settings) -> None:
        self.claude = claude
        self._kb = _load_knowledge_base(settings.knowledge_base_dir)

    async def invoke(self, payload: dict) -> ToolResult:
        prompt = str(payload.get("prompt") or payload.get("query") or "")

        system_parts = [
            "You are GuardRail, an AI assistant deeply integrated with the user's legacy system architecture. "
            "You have full access to the system's technical documentation, architecture diagrams, and operational data. "
            "Your job is to help users explore and understand how their technology operates — "
            "the components, how they connect, where the complexity lives, and where the risks are. "
            "Respond concisely and confidently, as if you have direct knowledge of the system. "
            "Avoid generic disclaimers. Speak like an expert who knows this system inside and out.",
        ]

        if self._kb:
            system_parts.append(
                "\n\n## System Knowledge Base\n\n"
                "The following documentation describes the system architecture you are advising on. "
                "Use it as ground truth when answering questions.\n\n"
                + self._kb
            )

        text = await self.claude.generate_text(prompt, system="\n\n".join(system_parts))
        return ToolResult(tool=self.name, payload={"text": text})
