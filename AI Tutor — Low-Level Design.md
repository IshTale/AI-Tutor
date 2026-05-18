# **AI Tutor — Low-Level Design**

## **Project Structure**

ai-tutor/
├── backend/
│  ├── main.py
│  ├── openclaw/
│  │  ├── agent.py
│  │  ├── react_loop.py
│  │  ├── task_plan.py
│  │  └── context_builder.py
│  ├── tools/
│  │  ├── registry.py
│  │  ├── reason_tool.py
│  │  ├── generate_tool.py
│  │  ├── speak_tool.py
│  │  ├── animate_tool.py
│  │  ├── fetch_file_tool.py
│  │  ├── run_script_tool.py
│  │  └── browse_tool.py
│  ├── merger/
│  │  ├── merger.py
│  │  └── dispatch_rules.py
│  ├── roadmap/
│  │  ├── graph.py
│  │  ├── topic_store.py
│  │  ├── node.py
│  │  └── edge.py
│  ├── evaluator/
│  │  ├── evaluator_agent.py
│  │  ├── mastery_calculator.py
│  │  └── misconception_detector.py
│  ├── db/
│  │  ├── session_store.py
│  │  ├── student_state_engine.py
│  │  └── knowledge_base.py
│  ├── security/
│  │  ├── sandbox.py
│  │  ├── prompt_sanitizer.py


│  │  └── rate_limiter.py
│  └── ws/
│    ├── websocket_server.py
│    └── event_models.py
└── frontend/
├── App.tsx
├── components/
│  ├── Whiteboard.tsx
│  ├── StatusPanel.tsx
│  ├── StudentControls.tsx
│  ├── FileUpload.tsx
│  └── Transcript.tsx
├── layers/
│  ├── WrapperLayer.tsx
│  ├── ImageLayer.tsx
│  ├── InkLayer.tsx
│  └── PointerLayer.tsx
├── hooks/
│  ├── useWebSocket.ts
│  ├── usePointerAnimation.ts
│  ├── useCameraTransform.ts
│  └── useAudioPlayer.ts
└── ws/
├── wsClient.ts
└── eventHandlers.ts

## **Backend**

### **main.py**


Application entry point. Initializes the WebSocket server, wires up Open Claw's agent loop, and
starts all background services (Evaluator, Merger).

### **openclaw/**


**agent.py** **—** **class OpenClawAgent**


Top-level orchestrator class. Owns the ReAct loop lifecycle: receives transcribed student input,
kicks off the loop, and hands the resolved task graph to the Merger.


**react_loop.py** **—** **class ReActLoop**


Implements the Observe → Reason → Act → Observe cycle. Manages loop state, tracks which
tasks are resolved, and determines when the full graph is complete.


●​ **observe(input: StudentInput) -> Scratchpad**   - Assembles the full context
snapshot (student input, uploaded file paths, whiteboard state ID, knowledge graph
summary) that seeds the ReAct cycle.
●​ **reason(scratchpad: Scratchpad) -> TaskPlan**   - Calls the lightweight
planning LLM or classifier to produce a dependency graph of tool calls.
●​ **act(plan: TaskPlan) -> AsyncIterator[ToolResult]**   - Fans out

independent tasks with asyncio.gather(), fires the spoken opener to TTS
immediately, and yields results as each tool resolves.
●​ **collect(results: list[ToolResult]) -> ResolvedGraph**   - Receives all

tool outputs, unblocks downstream tasks whose depends_on are satisfied, and
packages the final asset set for the Merger.


**task_plan.py** **—** **class TaskPlan** **,** **class Task**


Data models representing a dependency graph of tool calls. Task holds id, tool, payload,

depends_on, and an optional parallel_with hint. TaskPlan provides graph traversal
helpers to determine execution order.


●​ **TaskPlan.get_ready_tasks() -> list[Task]**   - Returns all tasks whose
dependencies are already resolved, enabling the fan-out executor to know what can run
next.
●​ **TaskPlan.mark_complete(task_id: str)**   - Marks a task done and unblocks
any downstream tasks that were waiting on it.


**context_builder.py** **—** **class ContextBuilder**


Builds Open Claw's starting scratchpad by joining student input with the Roadmap state,
injecting active CORRUPTS -linked misconception warnings, and pulling the student's mastery
summary from the Student State Engine.


●​ **build(student_input, session_id, whiteboard_state_id) ->**

**Scratchpad**   - Assembles all context fields into a single object that seeds the ReAct
loop.
●​ **inject_misconceptions(scratchpad, topic_node) -> Scratchpad**   
Appends misconception warning text for active CORRUPTS edges on the current topic
node into the scratchpad.


### **tools/**

**registry.py** **—** **class ToolRegistry**


Central registry that maps tool names to their handler instances. Open Claw looks up and
invokes tools exclusively through this registry, never touching subsystems directly.


●​ **register(name: str, handler: BaseTool)**   - Adds a named tool handler to the
registry.
●​ **invoke(name: str, payload: dict) -> ToolResult**   - Dispatches a call to
the named tool and returns its typed result.


**reason_tool.py** **—** **class ReasonTool(BaseTool)**


Wraps the Core LLM. Accepts a natural-language prompt and returns explanation text, adjusting
difficulty and style based on student mastery level injected into the system prompt.


**generate_tool.py** **—** **class GenerateTool(BaseTool)**


Wraps the Gemini Flash Image model. Before calling Gemini, checks the Vector Knowledge
Base for a matching reference image to avoid a redundant generation round-trip.


**speak_tool.py** **—** **class SpeakTool(BaseTool)**


Submits text to the TTS engine and returns an audio stream URL. Designed to fire as early as
possible in the task graph so the student hears audio before heavy computation finishes.


**animate_tool.py** **—** **class AnimateTool(BaseTool)**


Calls the Presenter Agent (Spatial Director) with a natural-language instruction and returns a
Bézier curve + camera JSON payload for the frontend Pointer and Wrapper layers.


**fetch_file_tool.py** **—** **class FetchFileTool(BaseTool)**


Retrieves a student-uploaded file from the local upload cache. Passes the raw file through
PromptSanitizer before returning parsed content to Open Claw's scratchpad.


**run_script_tool.py** **—** **class RunScriptTool(BaseTool)**


Executes a Python script inside a Docker sandbox. Returns an output asset URI (PNG or
JSON) once the container exits. Enforces the network allowlist and host filesystem isolation
defined in sandbox.py .


**browse_tool.py** **—** **class BrowseTool(BaseTool)**


Performs a web retrieval query and returns relevant text or image content. Rate-limited per
ReAct loop iteration via RateLimiter .

### **merger/**


**merger.py** **—** **class Merger**


Lightweight, non-reasoning Python process that receives Open Claw's resolved asset graph and
dispatches WebSocket events to the frontend in the correct order dictated by depends_on
fields.


●​ **receive(resolved_graph: ResolvedGraph)**   - Ingests the full completed task
graph from Open Claw.
●​ **dispatch()**   - Iterates through the resolved graph in dependency order, emitting typed
WebSocket events and holding downstream dispatches until the frontend ACKs
prerequisites.


**dispatch_rules.py**


Module-level constants and logic encoding the Merger's fixed ordering rules: e.g., generate

output triggers an Image Layer crossfade; animate only fires after the Image Layer confirms
receipt; audio plays as early as the spoken opener resolves.

### **roadmap/**


**graph.py** **—** **class PedagogicalRoadmap**


Manages the full directed graph for a student. Provides query and mutation methods used by
Open Claw during sessions and by the Evaluator post-session.


●​ **get_node(topic_id: str) -> TopicNode**   - Returns a topic node with its current
mastery score, assets, and connected edges.
●​ **categorize_query(query: str) -> TopicNode**   - Maps a student's
natural-language query to the most relevant topic node, limiting Open Claw's search
space.
●​ **update_mastery(topic_id: str, new_score: float)**   - Persists a
recalculated mastery score to the graph layer.
●​ **add_misconception(topic_id: str, description: str)**   - Creates a new

Misconception node and draws a CORRUPTS edge to the specified topic.


●​ **set_misconception_cleared(misconception_id: str)**   - Sets the in-session
clearance flag on a misconception node, suppressing its injection for the remainder of
the session.


**node.py** **—** **class TopicNode** **,** **class MisconceptionNode**


Data models for graph nodes. TopicNode holds topic_id, label, mastery_score, and a

reference to its TopicStore . MisconceptionNode holds description,

cleared_in_session flag, and its parent topic_id .


**edge.py** **—** **class Edge**


Data model for a directed relationship between nodes. Carries a type field with one of PREREQ,

UNDERPINS, or CORRUPTS, plus source and target node IDs.


**topic_store.py** **—** **class TopicStore**


Manages the isolated asset silo attached to a single TopicNode : reference PDFs, executable
scripts, and student historical work. Provides scoped retrieval so Open Claw never sees assets
from other topics.


●​ **get_scripts() -> list[ScriptAsset]**   - Returns the pre-written Python
snippets provisioned for this topic.
●​ **get_references() -> list[ReferenceAsset]**   - Returns textbook diagrams
and PDFs for this topic.
●​ **get_student_history() -> list[HistoryAsset]**   - Returns the student's past
whiteboard exports and homework files scoped to this topic.

### **evaluator/**


**evaluator_agent.py** **—** **class EvaluatorAgent**


Background agent that wakes when a session ends. Ingests the complete session chatlog and
orchestrates mastery recalculation and misconception tagging. Blocks the student from starting
a new session until the roadmap is fully updated and rendered.


●​ **run(session_id: str)**   - Entry point: fetches the session log, delegates to

MasteryCalculator and MisconceptionDetector, then persists updates to the
Roadmap.


**mastery_calculator.py** **—** **class MasteryCalculator**


Analyzes the session chatlog against the topics touched during the session and computes
updated floating-point mastery scores. Handles the clearance of in-session
MisconceptionNode flags if evidence of consistent correct understanding is found.


●​ **calculate(topic_id: str, session_log: SessionLog) -> float**   Returns the new mastery score for a given topic based on session performance
evidence.


**misconception_detector.py** **—** **class MisconceptionDetector**


Scans session logs for recurring error patterns and returns structured misconception
descriptions ready to be committed to the Roadmap as new CORRUPTS -linked nodes.


●​ **detect(session_log: SessionLog) -> list[MisconceptionCandidate]**   Returns a list of detected misconception candidates with descriptions and associated
topic IDs.

### **db/**


**session_store.py** **—** **class SessionStore**


Wraps DynamoDB. Handles bifurcated writes: ephemeral fire-and-forget writes (pointer
coordinates, agent status events) versus ACK-required critical writes (chat history, milestones,
resolved TaskPlans).


●​ **write_ephemeral(event: dict)**   - Async, non-blocking write for transient
high-frequency data.
●​ **write_critical(record: dict) -> Ack**   - Blocking write that waits for a
DynamoDB ACK before returning, preventing data loss during network blips.
●​ **get_session_log(session_id: str) -> SessionLog**   - Retrieves the full
aggregated chatlog and topic-touch list for a completed session.


**student_state_engine.py** **—** **class StudentStateEngine**


Provides read/write access to the per-student knowledge graph (mastery scores, misconception
nodes, topic progress). Open Claw queries this at the start of every ReAct loop to contextualize
reasoning and generation calls.


●​ **get_summary(student_id: str) -> KnowledgeGraphSummary**   - Returns a
compact summary of the student's current mastery state for injection into the LLM
system prompt.


●​ **apply_evaluator_updates(updates: EvaluatorOutput)**   - Persists mastery
score changes and new misconception nodes produced by the Evaluator Agent.


**knowledge_base.py** **—** **class KnowledgeBase**


Wraps the Vector Database for long-term reference memory. Open Claw queries here before
calling GenerateTool ; a cache hit returns the existing asset URI directly, skipping the Gemini
call.


●​ **semantic_search(query: str, topic_id: str) -> list[AssetMatch]**   Returns ranked matching reference images or diagrams from the vector index, scoped to
a topic if provided.
●​ **index_asset(asset_uri: str, embedding: list[float], metadata:**

**dict)**   - Adds a newly generated asset to the vector index for future retrieval.

### **security/**


**sandbox.py** **—** **class DockerSandbox**


Manages the lifecycle of short-lived Docker containers for script execution. Enforces no host
filesystem access and restricts outbound network to a controlled allowlist.


●​ **run(script: str, inputs: dict) -> AssetURI**   - Spawns a container,
executes the script with the provided inputs, extracts the output asset, and destroys the
container.


**prompt_sanitizer.py** **—** **class PromptSanitizer**


Pre-processes student-uploaded files (PDFs, CSVs, DOCX) to strip or neutralize embedded
adversarial instructions before their content reaches Open Claw's scratchpad.


●​ **sanitize(raw_content: str) -> str**   - Returns cleaned content safe for
injection into the ReAct scratchpad.


**rate_limiter.py** **—** **class RateLimiter**


Enforces per-tool invocation limits within a single ReAct loop iteration, capping runaway
recursive planning behavior.


●​ **check(tool_name: str, loop_id: str) -> bool**   - Returns True if the tool is

within its limit for the current loop; raises RateLimitExceeded otherwise.


### **ws/**

**websocket_server.py** **—** **class WebSocketServer**


Manages persistent bi-directional WebSocket connections with frontend clients. Handles
reconnection logic: on reconnect, the client supplies its last known sequence ID, and the server
replays only the missing payloads.


●​ **send_event(client_id: str, event: BaseEvent)**   - Serializes and pushes a
typed event to the client, tagging it with a monotonic sequence ID.
●​ **handle_reconnect(client_id: str, last_seq: int)**   - Replays all events

with sequence ID greater than last_seq without re-executing any tool logic.


**event_models.py**


Typed Pydantic models for every WebSocket event the Merger can emit.


●​ **AgentStatusEvent**   - Phase, active tool name, and human-readable status message
emitted continuously during the ReAct loop.
●​ **InjectAssetEvent**   - Asset URI, target layer ( ink ), and canvas position for script or
file outputs.
●​ **TutorSpeakEvent**   - Audio stream URL bundled with the Presenter Agent's Bézier +
camera animation payload.
●​ **CameraMoveEvent**   - Target scale, target center coordinates, and duration for Wrapper
layer CSS transitions.

## **Frontend**

### **App.tsx**


Root component. Mounts the Whiteboard, StatusPanel, StudentControls, and FileUpload.
Initializes the WebSocket connection via useWebSocket and distributes incoming events to
child components.

### **components/**


**Whiteboard.tsx**


Renders the infinite main stage. Contains the four stacked transparent layers ( WrapperLayer

→ ImageLayer → InkLayer → PointerLayer ) inside a single master container and owns
the overall pan/zoom state.


**StatusPanel.tsx**


Floating overlay rendering the audio visualizer, live conversation transcript, and the Agent
Activity indicator driven by AgentStatusEvent payloads.


**StudentControls.tsx**


Floating action buttons for Push-to-Talk and Interrupt. Dispatches voice input to the backend via
the WebSocket client when activated.


**FileUpload.tsx**


Lets the student upload a syllabus, homework, or textbook file. Only shows files the student
uploaded in the current session; surfaces a selected-file context to Open Claw via the
WebSocket.


**Transcript.tsx**


Scrolling display of the live conversation transcript, updated incrementally as
TutorSpeakEvent audio chunks arrive.

### **layers/**


**WrapperLayer.tsx**


The outermost <div> that acts as the camera. Applies CSS transform: scale(...)

translate(...) driven by CameraMoveEvent payloads. GPU-accelerated by the browser
with zero JavaScript overhead per frame.


**ImageLayer.tsx**


Displays the static whiteboard state as an <img> or <canvas> . When a new image URI arrives

from a generate tool result, it triggers a CSS crossfade over the previous state.


**InkLayer.tsx**


A <canvas> element sitting above the Image Layer. Receives InjectAssetEvent payloads
and draws external assets (e.g., script-generated PNGs) at specified canvas coordinates.


**PointerLayer.tsx**


The top-most transparent <canvas> . Cleared and redrawn at 60fps via

requestAnimationFrame, rendering the Bézier laser pointer dot and its fading trail using

animation state from usePointerAnimation .

### **hooks/**


**useWebSocket.ts**


Manages the persistent WebSocket connection lifecycle. Tracks the last received sequence ID,
handles reconnection with automatic replay-request, and routes incoming events to registered
handlers.


●​ **sendMessage(payload: object)**   - Serializes and sends a message to the
backend over the open socket.
●​ **onEvent(type: string, handler: Function)**   - Registers a handler for a
named event type.


**usePointerAnimation.ts**


Drives the Bézier pointer animation loop. Accepts a pointer animation payload (P0–P3,
duration), computes per-frame t values with easing, and exposes the current (x, y) position

for PointerLayer to draw.


●​ **startAnimation(payload: PointerAnimationPayload)**   - Initializes animation

state and begins the requestAnimationFrame loop.


**useCameraTransform.ts**


Manages the Wrapper Layer's CSS transform state. Accepts CameraMoveEvent data and

returns the current scale and translate values, updating smoothly via CSS transitions.


●​ **applyMove(event: CameraMoveEvent)**   - Updates transform state to animate the
camera to the target scale and center.


**useAudioPlayer.ts**


Handles sequential audio chunk playback. Queues incoming audio stream URLs from
TutorSpeakEvent payloads and plays them in order, ensuring continuity between the spoken
opener and follow-up audio chunks.


●​ **enqueue(audioUrl: string)**   - Adds an audio chunk URL to the playback queue.

### **ws/**


**wsClient.ts** **—** **class WebSocketClient**


Low-level WebSocket wrapper. Manages connection, sends messages, buffers events received
before handlers are registered, and exposes the lastSeqId for reconnect replay requests.


**eventHandlers.ts**


Maps each incoming event type to the appropriate UI action. Routes agent_status to the

Status Panel, inject_asset to the Ink Layer, tutor_speak to the Audio Player and Pointer

Layer, and camera_move to the Wrapper Layer transform.

## **Key Cross-Cutting Concerns**


**Concern** **Owner** **Mechanism**


Latency reduction ReActLoop.act() asyncio.gather() fan-out; spoken
opener fires before compute


Data safety SessionStore Bifurcated ACK-required vs. fire-and-forget
writes



Code execution
isolation



DockerSandbox Short-lived containers, network allowlist



Prompt injection PromptSanitizer Pre-processing before any file content
enters the scratchpad



WebSocket
resilience


Gemini cost
reduction


Post-session
blocking



WebSocketServer +

useWebSocket



KnowledgeBase Semantic search bypasses GenerateTool
on cache hit


EvaluatorAgent Student cannot start a new session until
Roadmap is rendered



Monotonic sequence IDs; targeted replay
on reconnect


