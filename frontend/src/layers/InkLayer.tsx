import { useEffect, useRef } from "react";
import type { InjectAssetEvent } from "../ws/types";

type InkLayerProps = {
  assets: InjectAssetEvent[];
};

export function InkLayer({ assets }: InkLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    assets.forEach((asset) => {
      const image = new Image();
      image.onload = () => {
        const width = asset.size?.width ?? image.width;
        const height = asset.size?.height ?? image.height;
        context.drawImage(image, asset.position.x, asset.position.y, width, height);
      };
      image.src = asset.asset_uri;
    });
  }, [assets]);

  return <canvas ref={canvasRef} className="ink-layer" width={1920} height={1080} aria-label="Injected assets" />;
}
