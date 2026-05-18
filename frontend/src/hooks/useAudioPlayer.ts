import { useCallback, useEffect, useRef, useState } from "react";

const apiBaseUrl = import.meta.env.VITE_AI_TUTOR_API_URL ?? "http://localhost:8000";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const queue = useRef<string[]>([]);
  const active = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNext = useCallback(() => {
    const audioUrl = queue.current.shift();
    if (!audioUrl) {
      active.current = false;
      setIsPlaying(false);
      return;
    }

    active.current = true;
    setIsPlaying(true);

    const url = audioUrl.startsWith("/") ? `${apiBaseUrl}${audioUrl}` : audioUrl;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => playNext();
    audio.onerror = () => playNext();
    audio.play().catch(() => playNext());
  }, []);

  const enqueue = useCallback(
    (audioUrl: string) => {
      queue.current.push(audioUrl);
      if (!active.current) playNext();
    },
    [playNext],
  );

  const unlock = useCallback(() => {
    const audio = new Audio();
    audio.play().catch(() => {});
  }, []);

  const cancel = useCallback(() => {
    queue.current = [];
    active.current = false;
    setIsPlaying(false);
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      queue.current = [];
    },
    [],
  );

  return { enqueue, unlock, isPlaying, cancel };
}
