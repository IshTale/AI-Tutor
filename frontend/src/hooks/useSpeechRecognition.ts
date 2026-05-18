import { useCallback, useRef, useState } from "react";

const apiBaseUrl = import.meta.env.VITE_AI_TUTOR_API_URL ?? "http://localhost:8000";

function getSupportedMimeType(): string {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const supported = typeof MediaRecorder !== "undefined";
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const startListening = useCallback(async () => {
    if (isListening || !supported) return;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return;
    }

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      setIsListening(false);

      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      if (blob.size < 1000) return;

      try {
        const res = await fetch(`${apiBaseUrl}/transcribe`, {
          method: "POST",
          headers: { "content-type": blob.type },
          body: blob,
        });
        const { transcript } = await res.json();
        if (transcript?.trim()) onTranscriptRef.current(transcript.trim());
      } catch {
        // silently drop failed transcriptions
      }
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsListening(true);
  }, [isListening, supported]);

  const stopListening = useCallback(() => {
    if (!mediaRecorderRef.current || !isListening) return;
    mediaRecorderRef.current.stop();
  }, [isListening]);

  return { isListening, supported, startListening, stopListening };
}
