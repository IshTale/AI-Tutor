import { useCallback, useEffect, useMemo, useState } from "react";
import { FileUpload, type UploadedFile } from "./components/FileUpload";
import { StatusPanel } from "./components/StatusPanel";
import { StudentControls } from "./components/StudentControls";
import { SystemDiagram } from "./components/SystemDiagram";
import type { TranscriptLine } from "./components/Transcript";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useWebSocket } from "./hooks/useWebSocket";
import type { AgentStatusEvent, TutorSpeakEvent } from "./ws/types";

const apiBaseUrl = import.meta.env.VITE_AI_TUTOR_API_URL ?? "http://localhost:8000";

function App() {
  const { connectionStatus, sendMessage, onEvent } = useWebSocket();
  const { enqueue, isPlaying, cancel } = useAudioPlayer();

  const [agentStatus, setAgentStatus] = useState<AgentStatusEvent | null>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedFileId) ?? null,
    [files, selectedFileId],
  );

  const addTranscript = useCallback((speaker: "tutor" | "student", text: string) => {
    setTranscript((lines) => [...lines, { id: crypto.randomUUID(), speaker, text }].slice(-40));
  }, []);

  useEffect(() => onEvent("agent_status", setAgentStatus), [onEvent]);
  useEffect(
    () =>
      onEvent("tutor_speak", (event: TutorSpeakEvent) => {
        if (event.transcript) {
          enqueue(event.transcript);
          addTranscript(event.speaker ?? "tutor", event.transcript);
        }
      }),
    [addTranscript, enqueue, onEvent],
  );

  const handleSendText = (text: string) => {
    addTranscript("student", text);
    sendMessage({ type: "student_text", text, selectedFileId: selectedFile?.id });
    setAgentStatus({
      event: "agent_status",
      seq: Date.now(),
      phase: "REASON",
      message: selectedFile ? `Thinking with ${selectedFile.name} in context.` : "Thinking...",
    });
  };

  const handleUpload = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${apiBaseUrl}/upload`, { method: "POST", body: form });
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
      <div className="main-content">
        <SystemDiagram />
      </div>
      <div className="right-panel">
        <StatusPanel
          status={agentStatus}
          transcript={transcript}
          isAudioPlaying={isPlaying}
          connectionStatus={connectionStatus}
          onClearTranscript={() => setTranscript([])}
        />
        <FileUpload files={files} selectedFileId={selectedFileId} onUpload={handleUpload} onSelect={handleSelectFile} />
        <StudentControls
          onSendText={handleSendText}
          onPushToTalk={(active) => sendMessage({ type: "push_to_talk", active, selectedFileId: selectedFile?.id })}
          onInterrupt={() => { cancel(); sendMessage({ type: "interrupt" }); }}
        />
      </div>
    </div>
  );
}

export default App;
