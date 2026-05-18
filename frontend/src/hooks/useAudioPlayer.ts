import { useCallback, useEffect, useRef, useState } from "react";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const queue = useRef<string[]>([]);
  const audio = useRef<HTMLAudioElement | null>(null);

  const playNext = useCallback(() => {
    const next = queue.current.shift();
    if (!next) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    audio.current = new Audio(next);
    audio.current.addEventListener("ended", playNext, { once: true });
    audio.current.addEventListener("error", playNext, { once: true });
    void audio.current.play().catch(playNext);
  }, []);

  const enqueue = useCallback(
    (audioUrl: string) => {
      queue.current.push(audioUrl);
      if (!isPlaying) {
        playNext();
      }
    },
    [isPlaying, playNext],
  );

  useEffect(
    () => () => {
      audio.current?.pause();
      queue.current = [];
    },
    [],
  );

  return { enqueue, isPlaying };
}
