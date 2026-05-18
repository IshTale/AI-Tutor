import { useCallback, useMemo, useState } from "react";
import type { CameraMoveEvent } from "../ws/types";

export type CameraTransform = {
  scale: number;
  center: {
    x: number;
    y: number;
  };
  durationMs: number;
};

const defaultCamera: CameraTransform = {
  scale: 1,
  center: { x: 960, y: 540 },
  durationMs: 0,
};

export function useCameraTransform() {
  const [camera, setCamera] = useState<CameraTransform>(defaultCamera);

  const applyMove = useCallback((event: CameraMoveEvent) => {
    setCamera({
      scale: event.scale,
      center: event.center,
      durationMs: event.duration_ms,
    });
  }, []);

  const wrapperStyle = useMemo(
    () => ({
      transform: `translate(-${camera.center.x}px, -${camera.center.y}px) scale(${camera.scale}) translate(50vw, 50vh)`,
      transition: `transform ${camera.durationMs}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
    }),
    [camera],
  );

  return { camera, wrapperStyle, applyMove };
}
