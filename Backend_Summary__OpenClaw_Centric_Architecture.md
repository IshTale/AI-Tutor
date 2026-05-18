# **The Backend: Open Claw–Centric Architecture**

A revised backend design where Open Claw acts as the primary agentic execution engine,
with all other subsystems — including the Core LLM and Gemini — operating as callable
tools within its loop.

## **1. The Core Inversion: Open Claw as the Orchestrator**


The foundational shift in this architecture is a role inversion. In a conventional multi-agent pipeline,
a Core Orchestrator LLM acts as the brain and dispatches Open Claw as a side utility when file or
OS operations are needed. Here, that relationship is reversed.


Open Claw is always running. It owns the execution graph. Every other subsystem — the Core LLM,

the Gemini image model, TTS, and the Presenter Agent — is a tool that Open Claw decides to call.
Other agents may exist in the broader pipeline, but they are limited in the information they can access
and update, primarily using data provided by Open Claw's execution loop.






|The pipeline comparison:|Col2|
|---|---|
|**Old Architecture**|**New Architecture**|
|Core LLM→ occasionally dispatches<br>→ Open Claw|Open Claw (ReAct loop)→ calls LLMs,<br>Gemini, scripts as tools|
|N sequential hops before student<br>hears a response|1 planning step + max(parallel tasks)|
|Open Claw is summoned; blocked<br>behind routing logic|Open Claw is always the entry point; never gated|


## **2. The Open Claw Agentic Loop (ReAct Pattern)**

Open Claw operates on a continuous Reason → Act → Observe cycle. Upon receiving a student's
transcribed input from STT, it enters the loop and does not exit until a complete, coherent response
has been assembled and dispatched to the frontend.


**2.1 Observe**


Open Claw receives the raw student input (transcribed by STT) along with any uploaded file paths, the

current whiteboard state identifier, and the student's knowledge graph summary. This full context
snapshot is its starting scratchpad.


**2.2 Reason**
Open Claw performs a planning step — either via an embedded lightweight LLM call or a small


classifier — to produce a structured TaskPlan: a dependency graph of which tools are needed, which
are sequential, and which can fan out in parallel.


Example TaskPlan for 'Analyze my CSV and explain the trend':

```
  {
  "spoken_opener": "Let me pull that up and run the numbers.",
  "tasks": [
  { "id": "t1", "tool": "fetch_file", "payload": "student_data.csv" },
  { "id": "t2", "tool": "run_script", "payload": "plot revenue over
  time", "depends_on": ["t1"] },
  { "id": "t3", "tool": "reason", "payload": "explain upward revenue
  trend", "depends_on": ["t1"], "parallel_with": ["t2"] },
  { "id": "t4", "tool": "generate", "payload": "whiteboard with embedded
  plot", "depends_on": ["t2"] },
  { "id": "t5", "tool": "animate", "payload": "point to peak of trend
  line", "depends_on": ["t4"] }
  ]
  }

```

**2.3 Act (Fan-Out Execution)**


Open Claw executes the TaskPlan using asyncio.gather() for tasks with no mutual dependency. The

spoken_opener is fired to TTS immediately — giving the student audio feedback before any heavy
computation completes. Sequential tasks wait only for their specific dependency, not for the entire plan
to finish.


The effective latency ceiling becomes:


   - **Not:** sum of all task durations (the old sequential model)


   - **But:** the duration of the single slowest parallel branch


**2.4 Observe (Result Collection) & Handoff**


As each tool resolves, Open Claw receives its output and checks whether dependent downstream

tasks can now be unblocked. Once the full graph is resolved, it passes all asset URIs and animation
payloads to the Merger for final dispatch.

## **3. Open Claw's Tool Registry**


Every capability in the system is exposed to Open Claw as a named, typed tool. Open Claw
never directly manipulates subsystems; it only calls tools and observes return values.


|Tool|Subsystem Called|Returns|
|---|---|---|
|reason(prompt)|Core LLM|Explanation text|


|generate(instruction)|Gemini Flash Image|Whiteboard image URI|
|---|---|---|
|speak(text)|TTS Engine|Audio stream URL|
|animate(instruction)|Presenter Agent|Bézier + camera JSON|
|fetch_file(path)|Local upload cache|Parsed file content|
|run_script(code)|Docker sandbox|Output asset URI (PNG, JSON)|
|browse(query)|Web retrieval|Text/image content|

## **4. The Merger (Deterministic Assembler)**

The Merger is not an LLM and performs no reasoning. It is a lightweight Python process that receives
the completed outputs from Open Claw's tool graph and dispatches them to the frontend over the
WebSocket in the correct order, according to fixed rules:


   - **fetch_file / run_script output:** Inject asset URI onto the Ink Layer of the whiteboard canvas.


   - **generate output:** Trigger a crossfade on the Image Layer with the new whiteboard state.


   - **animate output:** Begin the Presenter Agent's Bézier pointer loop only after Image Layer
confirms receipt.


   - **speak output:** Audio plays as early as possible; a follow-up audio chunk is appended once the

Merger confirms asset delivery.


Ordering between agents is governed entirely by the dependency hints Open Claw embedded in

the TaskPlan. The Merger reads depends_on fields and holds downstream dispatches until their
prerequisites have been acknowledged by the frontend.

## **5. The Database & State Layer**


The data layer remains split by access pattern and criticality. Open Claw is the exclusive agent for
real-time reads and writes. Other, specialized agents (such as the Evaluator Agent) are authorized
for limited, non-real-time updates, which are primarily gated by data and logs provided by Open
Claw's execution loop.


**5.1 Session Store (DynamoDB) — Bifurcated Ingestion**


   - **Ephemeral writes (fire-and-forget):** 60fps pointer coordinates, transient agent_status events.

Written asynchronously with no blocking.


   - **Critical writes (ACK-required):** Chat history, lesson milestones, whiteboard generation state,


and Open Claw's resolved TaskPlan. The orchestrator waits for an explicit database ACK before
marking an action complete, preventing data loss during network blips.


**5.2 Student State Engine (Knowledge Graph)**
A dedicated graph layer tracking each student's mastery state against learning objectives. Open Claw
queries this at the start of every ReAct loop to contextualize its reason() and generate() tool calls —
adjusting difficulty and explanation style before invoking the Core LLM.


**5.3 Knowledge Base (Vector Database)**


Long-term reference memory for the tutor. Open Claw performs a semantic search here before calling

generate() — if a matching reference image or textbook diagram already exists, it renders directly to
the canvas, bypassing a Gemini call entirely and eliminating that latency hop.

## **6. Security: Open Claw's Guardrails**


Because Open Claw now owns the execution graph and directly invokes code execution and
file parsing, its security posture is more critical than in the original architecture.


   - **Docker sandboxing:** All run_script() executions occur in short-lived containers with no access

to host system files or the network beyond a controlled allowlist.


   - **Prompt injection filtering:** Uploaded files (PDFs, CSVs, DOCX) are pre-processed through a

sanitization layer before their content reaches Open Claw's scratchpad, preventing embedded
adversarial instructions from hijacking the ReAct loop.


   - **Idempotency via sequence IDs:** Every asset resolved by Open Claw is cached with a

monotonic sequence ID. If the WebSocket drops mid-session, the frontend passes its last
known ID on reconnect, triggering a targeted resend of only the missing payloads — no
re-execution required.


   - **Tool call rate limits:** Each tool in the registry has a configurable invocation limit per ReAct loop

iteration, capping runaway agentic behavior during unexpected recursive planning.

## **7. The WebSocket Event Stream**


The frontend remains a dumb, high-speed rendering engine driven entirely by JSON payloads from the

backend. The Merger dispatches three primary event types, all tagged with sequence IDs for resilient
reconnection.


**Event: agent_status**


Emitted continuously during Open Claw's ReAct loop. Drives the live AI Status Panel.

```
  {
  "event": "agent_status",
  "seq": 42,

```

```
  "phase": "ACT",
  "tool": "run_script",
  "message": "Open Claw is generating your scatter plot..."
  }

```

**Event: inject_asset**
Delivers a resolved file or script output to be drawn on the Ink Layer.

```
  {
  "event": "inject_asset",
  "seq": 47,
  "asset_uri": "/cache/plot_scatter_abc123.png",
  "layer": "ink",
  "position": { "x": 200, "y": 150 }
  }

```

**Event: tutor_speak (with pointer sync)**


Synchronizes audio playback with Presenter Agent animation on the Pointer Layer.

```
  {
  "event": "tutor_speak",
  "seq": 51,
  "audio_url": "/streams/chunk_003.wav",
  "pointer_animation": {
  "type": "bezier",
  "P0": [200, 150], "P1": [260, 80], "P2": [340, 200],
  "duration_ms": 1400
  }
  }

```

This document reflects the revised architecture discussed for the AI Tutor hackathon build. The

design prioritizes Open Claw as the primary agentic execution engine, reducing sequential LLM hops
through a fan-out/fan-in task graph and making Open Claw's decision-making the centerpiece of both
the system and the demo experience.


