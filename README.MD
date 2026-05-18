# AI Tutor Architecture Summary

## Agent Roles

The architecture is Open Claw-centric; Open Claw serves as the primary orchestrator and execution engine. In this model, other subsystems operate as callable tools within Open Claw's ReAct loop:

- **Core LLM:** Provides reasoning and generates explanation text.
- **Visualization Agent (Gemini 3 Flash Image):** Functions as the "marker," generating and editing whiteboard images when called by Open Claw.
- **Presenter Agent (Spatial Director):** Calculates mathematical trajectories for the laser pointer and camera moves, delivering animation JSON.

## Roadmap & Context Management

To guide decision-making, the system uses a **Roadmap**, a directed graph of concepts. Each node contains a **Topic Store** with isolated assets, scripts, and student history. This allows Open Claw to perform targeted dispatch, inject misconception context from "CORRUPTS" edges, and update student mastery scores after the session.

## Backend Execution: TaskPlan & Merger

Open Claw generates a **TaskPlan**—a dependency graph of tool calls—to execute tasks in parallel, reducing latency to the duration of the slowest branch. The **Merger** then deterministically assembles these outputs, ensuring assets are delivered to the frontend in the correct order based on the plan's dependencies.

## Open Claw's Tool Registry

Every capability in the system is explicitly exposed to Open Claw as a named, typed tool. Open Claw is designed to never directly manipulate subsystems; instead, it strictly calls these tools and observes their return values to assemble the final response.

| **Tool** | **Subsystem Called** | **Returns** |
| --- | --- | --- |
| reason(prompt) | Core LLM | Explanation text |
| --- | --- | --- |
| generate(instruction) | Gemini Flash Image | Whiteboard image URI |
| --- | --- | --- |
| speak(text) | TTS Engine | Audio stream URL |
| --- | --- | --- |
| animate(instruction) | Presenter Agent | Bézier + camera JSON |
| --- | --- | --- |
| fetch_file(path) | Local upload cache | Parsed file content |
| --- | --- | --- |
| run_script(code) | Docker sandbox | Output asset URI (PNG, JSON) |
| --- | --- | --- |
| browse(query) | Web retrieval | Text/image content |
| --- | --- | --- |

## Frontend & High-Speed Rendering

The UI utilizes a **Layering System** (Wrapper, Image, Ink, and Pointer layers) to decouple static images from 60fps animations. Communication is handled via a persistent **WebSocket** bridge, allowing the Python backend to fire JSON packets that trigger real-time audio, camera moves, and pointer sync on the client side.