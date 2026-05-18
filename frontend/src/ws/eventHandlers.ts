import type {
  AgentStatusEvent,
  CameraMoveEvent,
  ImageStateEvent,
  InjectAssetEvent,
  TutorSpeakEvent,
} from "./types";

export type TutorEventHandlers = {
  onAgentStatus: (event: AgentStatusEvent) => void;
  onInjectAsset: (event: InjectAssetEvent) => void;
  onImageState: (event: ImageStateEvent) => void;
  onTutorSpeak: (event: TutorSpeakEvent) => void;
  onCameraMove: (event: CameraMoveEvent) => void;
};

export const eventHandlers = {
  agent_status: "onAgentStatus",
  inject_asset: "onInjectAsset",
  image_state: "onImageState",
  tutor_speak: "onTutorSpeak",
  camera_move: "onCameraMove",
} as const satisfies Record<string, keyof TutorEventHandlers>;
