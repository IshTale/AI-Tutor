import { useCallback, useEffect, useRef, useState } from "react";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const queue = useRef<string[]>([]);
  const active = useRef(false);

  const playNext = useCallback(() => {
    const text = queue.current.shift();
    if (!text || !window.speechSynthesis) {
      active.current = false;
      setIsPlaying(false);
      return;
    }

    active.current = true;
    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => playNext();
    utterance.onerror = () => playNext();
    window.speechSynthesis.speak(utterance);
  }, []);

  const enqueue = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      queue.current.push(text);
      if (!active.current) {
        playNext();
      }
    },
    [playNext],
  );

  const cancel = useCallback(() => {
    queue.current = [];
    active.current = false;
    setIsPlaying(false);
    window.speechSynthesis?.cancel();
  }, []);

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
      queue.current = [];
    },
    [],
  );

  return { enqueue, isPlaying, cancel };
}
