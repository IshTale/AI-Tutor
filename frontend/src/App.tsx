import { useCallback, useEffect, useMemo, useState } from "react";
import { FileUpload, type UploadedFile } from "./components/FileUpload";
import { StatusPanel } from "./components/StatusPanel";
import { StudentControls } from "./components/StudentControls";
import type { TranscriptLine } from "./components/Transcript";
import { Whiteboard } from "./components/Whiteboard";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useCameraTransform } from "./hooks/useCameraTransform";
import { usePointerAnimation } from "./hooks/usePointerAnimation";
import { useWebSocket } from "./hooks/useWebSocket";
import type {
  AgentStatusEvent,
  CameraMoveEvent,
  ImageStateEvent,
  InjectAssetEvent,
  TutorSpeakEvent,
} from "./ws/types";

const demoImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'%3E%3Crect width='1920' height='1080' fill='%23fbfbf8'/%3E%3Cg stroke='%23d8e2df' stroke-width='2' opacity='.65'%3E%3Cpath d='M0 170h1920M0 330h1920M0 490h1920M0 650h1920M0 810h1920M0 970h1920'/%3E%3Cpath d='M160 0v1080M320 0v1080M480 0v1080M640 0v1080M800 0v1080M960 0v1080M1120 0v1080M1280 0v1080M1440 0v1080M1600 0v1080M1760 0v1080'/%3E%3C/g%3E%3Ctext x='310' y='265' font-family='Inter, Arial' font-size='62' font-weight='700' fill='%23233836'%3EQuadratic functions%3C/text%3E%3Ctext x='315' y='365' font-family='Inter, Arial' font-size='42' fill='%23233836'%3Ef(x) = ax%5E2 + bx + c%3C/text%3E%3Cpath d='M430 780 Q 840 210 1320 760' fill='none' stroke='%231f7a6b' stroke-width='10' stroke-linecap='round'/%3E%3Ccircle cx='875' cy='478' r='14' fill='%23ff3d59'/%3E%3Ctext x='910' y='488' font-family='Inter, Arial' font-size='32' fill='%23233836'%3Evertex%3C/text%3E%3C/svg%3E";

const apiBaseUrl = import.meta.env.VITE_AI_TUTOR_API_URL ?? "http://localhost:8000";

function App() {
  const { connectionStatus, sendMessage, onEvent, receiveMockEvent } = useWebSocket();
  const { camera, wrapperStyle, applyMove } = useCameraTransform();
  const { frame, startAnimation } = usePointerAnimation();
  const { enqueue, isPlaying } = useAudioPlayer();

  const [agentStatus, setAgentStatus] = useState<AgentStatusEvent | null>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [inkAssets, setInkAssets] = useState<InjectAssetEvent[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedFileId) ?? null,
    [files, selectedFileId],
  );

  const addTranscript = useCallback((speaker: "tutor" | "student", text: string) => {
    setTranscript((lines) => [...lines, { id: crypto.randomUUID(), speaker, text }].slice(-24));
  }, []);

  useEffect(() => onEvent("agent_status", setAgentStatus), [onEvent]);
  useEffect(() => onEvent("inject_asset", (event) => setInkAssets((assets) => [...assets, event])), [onEvent]);
  useEffect(() => onEvent("image_state", (event: ImageStateEvent) => setImageUri(event.image_uri)), [onEvent]);
  useEffect(() => onEvent("camera_move", (event: CameraMoveEvent) => applyMove(event)), [applyMove, onEvent]);
  useEffect(
    () =>
      onEvent("tutor_speak", (event: TutorSpeakEvent) => {
        if (event.audio_url) {
          enqueue(event.audio_url);
        }
        if (event.transcript) {
          addTranscript(event.speaker ?? "tutor", event.transcript);
        }
        if (event.pointer_animation) {
          startAnimation(event.pointer_animation);
        }
      }),
    [addTranscript, enqueue, onEvent, startAnimation],
  );

  useEffect(() => {
    const timers = [
      window.setTimeout(
        () =>
          receiveMockEvent({
            event: "agent_status",
            seq: 1,
            phase: "OBSERVE",
            message: "Listening for the next question.",
          }),
        300,
      ),
      window.setTimeout(
        () =>
          receiveMockEvent({
            event: "image_state",
            seq: 2,
            image_uri: demoImage,
          }),
        600,
      ),
      window.setTimeout(
        () =>
          receiveMockEvent({
            event: "agent_status",
            seq: 3,
            phase: "ACT",
            tool: "animate",
            message: "OpenClaw is preparing a vertex walkthrough.",
          }),
        1000,
      ),
      window.setTimeout(
        () =>
          receiveMockEvent({
            event: "camera_move",
            seq: 4,
            scale: 1.28,
            center: { x: 885, y: 505 },
            duration_ms: 900,
          }),
        1300,
      ),
      window.setTimeout(
        () =>
          receiveMockEvent({
            event: "tutor_speak",
            seq: 5,
            transcript: "Notice how the curve changes direction at the vertex. That point tells us the minimum value here.",
            pointer_animation: {
              type: "bezier",
              P0: [445, 790],
              P1: [620, 520],
              P2: [875, 478],
              duration_ms: 1500,
            },
          }),
        1700,
      ),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [receiveMockEvent]);

  const handleSendText = (text: string) => {
    addTranscript("student", text);
    sendMessage({ type: "student_text", text, selectedFileId: selectedFile?.id });
    setAgentStatus({
      event: "agent_status",
      seq: Date.now(),
      phase: "REASON",
      message: selectedFile ? `Thinking with ${selectedFile.name} in context.` : "Thinking through your question.",
    });
  };

  const handleUpload = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${apiBaseUrl}/upload`, {
      method: "POST",
      body: form,
    });
    const uploaded = await response.json();
    const sessionFile: UploadedFile = {
      id: uploaded.file_id,
      name: uploaded.name,
      size: uploaded.size,
      mimeType: uploaded.mime_type,
    };
    setFiles((current) => [...current, sessionFile]);
    setSelectedFileId(sessionFile.id);
    sendMessage({
      type: "upload_file",
      fileId: sessionFile.id,
      name: sessionFile.name,
      size: sessionFile.size,
      mimeType: sessionFile.mimeType,
    });
  };

  const handleSelectFile = (fileId: string | null) => {
    setSelectedFileId(fileId);
    sendMessage({ type: "select_file", fileId });
  };

  return (
    <div className="app-shell">
      <Whiteboard
        wrapperStyle={wrapperStyle}
        camera={camera}
        imageUri={imageUri}
        inkAssets={inkAssets}
        pointer={{ position: frame.position, trail: frame.trail }}
      />
      <StatusPanel
        status={agentStatus}
        transcript={transcript}
        isAudioPlaying={isPlaying || frame.active}
        connectionStatus={connectionStatus}
      />
      <FileUpload files={files} selectedFileId={selectedFileId} onUpload={handleUpload} onSelect={handleSelectFile} />
      <StudentControls
        onSendText={handleSendText}
        onPushToTalk={(active) => sendMessage({ type: "push_to_talk", active, selectedFileId: selectedFile?.id })}
        onInterrupt={() => sendMessage({ type: "interrupt" })}
      />
    </div>
  );
}

export default App;
