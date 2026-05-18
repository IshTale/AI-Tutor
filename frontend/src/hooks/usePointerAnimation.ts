import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerAnimationPayload, Point } from "../ws/types";

type PointerFrame = {
  position: Point | null;
  trail: Point[];
  active: boolean;
};

const emptyFrame: PointerFrame = {
  position: null,
  trail: [],
  active: false,
};

const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

const quadraticBezier = (
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  t: number,
): Point => {
  const oneMinusT = 1 - t;
  return {
    x: oneMinusT * oneMinusT * p0[0] + 2 * oneMinusT * t * p1[0] + t * t * p2[0],
    y: oneMinusT * oneMinusT * p0[1] + 2 * oneMinusT * t * p1[1] + t * t * p2[1],
  };
};

const cubicBezier = (
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  t: number,
): Point => {
  const oneMinusT = 1 - t;
  return {
    x:
      oneMinusT ** 3 * p0[0] +
      3 * oneMinusT * oneMinusT * t * p1[0] +
      3 * oneMinusT * t * t * p2[0] +
      t ** 3 * p3[0],
    y:
      oneMinusT ** 3 * p0[1] +
      3 * oneMinusT * oneMinusT * t * p1[1] +
      3 * oneMinusT * t * t * p2[1] +
      t ** 3 * p3[1],
  };
};

export function usePointerAnimation() {
  const [frame, setFrame] = useState<PointerFrame>(emptyFrame);
  const rafId = useRef<number | null>(null);

  const stopAnimation = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    setFrame((current) => ({ ...current, active: false }));
  }, []);

  const startAnimation = useCallback(
    (payload: PointerAnimationPayload) => {
      stopAnimation();
      const start = performance.now();
      const trail: Point[] = [];

      const tick = (now: number) => {
        const progress = Math.min((now - start) / payload.duration_ms, 1);
        const eased = easeInOut(progress);
        const position = payload.P3
          ? cubicBezier(payload.P0, payload.P1, payload.P2, payload.P3, eased)
          : quadraticBezier(payload.P0, payload.P1, payload.P2, eased);

        trail.push(position);
        if (trail.length > 24) {
          trail.shift();
        }

        setFrame({ position, trail: [...trail], active: progress < 1 });

        if (progress < 1) {
          rafId.current = requestAnimationFrame(tick);
        } else {
          rafId.current = window.setTimeout(() => setFrame(emptyFrame), 280) as unknown as number;
        }
      };

      rafId.current = requestAnimationFrame(tick);
    },
    [stopAnimation],
  );

  useEffect(() => stopAnimation, [stopAnimation]);

  return { frame, startAnimation, stopAnimation };
}
