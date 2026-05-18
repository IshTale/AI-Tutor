import { Activity, Radio, Wifi, WifiOff } from "lucide-react";
import type { AgentStatusEvent } from "../ws/types";
import { Transcript, type TranscriptLine } from "./Transcript";

type StatusPanelProps = {
  status: AgentStatusEvent | null;
  transcript: TranscriptLine[];
  isAudioPlaying: boolean;
  connectionStatus: "connecting" | "open" | "closed";
};

export function StatusPanel({ status, transcript, isAudioPlaying, connectionStatus }: StatusPanelProps) {
  const isConnected = connectionStatus === "open";

  return (
    <aside className="status-panel" aria-label="AI tutor status">
      <div className="status-header">
        <div className="agent-mark">
          <Activity size={18} />
        </div>
        <div>
          <h1>GuardRail</h1>
          <p>{status?.phase ?? "IDLE"} {status?.tool ? `- ${status.tool}` : ""}</p>
        </div>
        <div className={`connection ${isConnected ? "open" : "closed"}`} title={connectionStatus}>
          {isConnected ? <Wifi size={17} /> : <WifiOff size={17} />}
        </div>
      </div>

      <div className="activity-row">
        <div className={`visualizer ${isAudioPlaying ? "playing" : ""}`} aria-label="Audio activity">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div>
          <p className="activity-label">
            <Radio size={14} />
            Agent Activity
          </p>
          <p className="activity-message">{status?.message ?? "Waiting for a student prompt."}</p>
        </div>
      </div>

      <Transcript lines={transcript} />
    </aside>
  );
}
