from typing import Any


class DockerSandbox:
    async def run(self, script: str, inputs: dict[str, Any]) -> dict[str, Any]:
        return {
            "asset_uri": None,
            "stdout": "Script execution is stubbed until Docker policy is configured.",
            "inputs": inputs,
            "script_preview": script[:240],
        }
