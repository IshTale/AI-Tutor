import type { CSSProperties } from "react";
import { ImageLayer } from "../layers/ImageLayer";
import { InkLayer } from "../layers/InkLayer";
import { PointerLayer } from "../layers/PointerLayer";
import { WrapperLayer } from "../layers/WrapperLayer";
import type { CameraTransform } from "../hooks/useCameraTransform";
import type { InjectAssetEvent, Point } from "../ws/types";

type WhiteboardProps = {
  wrapperStyle: CSSProperties;
  camera: CameraTransform;
  imageUri: string | null;
  inkAssets: InjectAssetEvent[];
  pointer: {
    position: Point | null;
    trail: Point[];
  };
};

export function Whiteboard({ wrapperStyle, camera, imageUri, inkAssets, pointer }: WhiteboardProps) {
  return (
    <main className="stage" aria-label="AI tutor whiteboard">
      <WrapperLayer style={wrapperStyle}>
        <div className="board-surface">
          <ImageLayer imageUri={imageUri} />
          <InkLayer assets={inkAssets} />
          <PointerLayer position={pointer.position} trail={pointer.trail} />
        </div>
      </WrapperLayer>
      <div className="camera-readout" aria-label="Camera transform">
        <span>{camera.scale.toFixed(2)}x</span>
        <span>{Math.round(camera.center.x)}, {Math.round(camera.center.y)}</span>
      </div>
    </main>
  );
}
