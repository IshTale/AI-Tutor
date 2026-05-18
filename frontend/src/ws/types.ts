export type AgentPhase = "OBSERVE" | "REASON" | "ACT" | "MERGE" | "IDLE";

export type Point = {
  x: number;
  y: number;
};

export type AgentStatusEvent = {
  event: "agent_status";
  seq: number;
  phase: AgentPhase;
  tool?: string;
  message: string;
};

export type InjectAssetEvent = {
  event: "inject_asset";
  seq: number;
  asset_uri: string;
  layer: "ink";
  position: Point;
  size?: {
    width: number;
    height: number;
  };
};

export type ImageStateEvent = {
  event: "image_state";
  seq: number;
  image_uri: string;
};

export type PointerAnimationPayload = {
  type: "bezier";
  P0: [number, number];
  P1: [number, number];
  P2: [number, number];
  P3?: [number, number];
  duration_ms: number;
};

export type TutorSpeakEvent = {
  event: "tutor_speak";
  seq: number;
  audio_url?: string;
  transcript?: string;
  speaker?: "tutor" | "student";
  pointer_animation?: PointerAnimationPayload;
};

export type CameraMoveEvent = {
  event: "camera_move";
  seq: number;
  scale: number;
  center: Point;
  duration_ms: number;
};

export type ServerEvent =
  | AgentStatusEvent
  | InjectAssetEvent
  | ImageStateEvent
  | TutorSpeakEvent
  | CameraMoveEvent;

export type ClientMessage =
  | { type: "student_text"; text: string; selectedFileId?: string }
  | { type: "push_to_talk"; active: boolean; selectedFileId?: string }
  | { type: "interrupt" }
  | { type: "select_file"; fileId: string | null }
  | { type: "upload_file"; fileId: string; name: string; size: number; mimeType: string };
