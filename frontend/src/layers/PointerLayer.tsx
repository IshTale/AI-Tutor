import { useEffect, useRef } from "react";
import type { Point } from "../ws/types";

type PointerLayerProps = {
  position: Point | null;
  trail: Point[];
};

export function PointerLayer({ position, trail }: PointerLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    trail.forEach((point, index) => {
      const alpha = (index + 1) / trail.length;
      context.beginPath();
      context.fillStyle = `rgba(255, 61, 89, ${alpha * 0.26})`;
      context.arc(point.x, point.y, 18 * alpha, 0, Math.PI * 2);
      context.fill();
    });

    if (position) {
      const gradient = context.createRadialGradient(position.x, position.y, 2, position.x, position.y, 26);
      gradient.addColorStop(0, "rgba(255,255,255,0.98)");
      gradient.addColorStop(0.22, "rgba(255,61,89,0.92)");
      gradient.addColorStop(1, "rgba(255,61,89,0)");
      context.beginPath();
      context.fillStyle = gradient;
      context.arc(position.x, position.y, 26, 0, Math.PI * 2);
      context.fill();
    }
  }, [position, trail]);

  return <canvas ref={canvasRef} className="pointer-layer" width={1920} height={1080} aria-label="Laser pointer" />;
}
