import { Mic, MicOff, Pause, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

type StudentControlsProps = {
  onSendText: (text: string) => void;
  onPushToTalk: (active: boolean) => void;
  onInterrupt: () => void;
};

export function StudentControls({ onSendText, onPushToTalk, onInterrupt }: StudentControlsProps) {
  const [text, setText] = useState("");

  const { isListening, supported, startListening, stopListening } = useSpeechRecognition(
    (transcript) => {
      onSendText(transcript);
      onPushToTalk(false);
    },
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setText("");
  };

  const toggleTalk = () => {
    if (isListening) {
      stopListening();
      onPushToTalk(false);
    } else {
      startListening();
      onPushToTalk(true);
    }
  };

  return (
    <div className="student-controls" aria-label="User controls">
      <button
        className={`icon-button talk ${isListening ? "active" : ""}`}
        type="button"
        onClick={toggleTalk}
        disabled={!supported}
        title={supported ? (isListening ? "Stop recording" : "Ask GuardRail by voice") : "Speech not supported in this browser"}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
      <button className="icon-button interrupt" type="button" onClick={onInterrupt} title="Interrupt">
        <Pause size={20} />
      </button>
      <form className="prompt-form" onSubmit={submit}>
        <input
          value={isListening ? "Listening..." : text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Ask about your systems..."
          aria-label="Ask GuardRail"
          readOnly={isListening}
        />
        <button className="send-button" type="submit" disabled={isListening} title="Send">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
