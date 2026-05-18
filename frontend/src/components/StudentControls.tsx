import { Mic, Pause, Send, Square } from "lucide-react";
import { FormEvent, useState } from "react";

type StudentControlsProps = {
  onSendText: (text: string) => void;
  onPushToTalk: (active: boolean) => void;
  onInterrupt: () => void;
};

export function StudentControls({ onSendText, onPushToTalk, onInterrupt }: StudentControlsProps) {
  const [text, setText] = useState("");
  const [isTalking, setIsTalking] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    onSendText(trimmed);
    setText("");
  };

  const toggleTalk = () => {
    const next = !isTalking;
    setIsTalking(next);
    onPushToTalk(next);
  };

  return (
    <div className="student-controls" aria-label="Student controls">
      <button className={`icon-button talk ${isTalking ? "active" : ""}`} type="button" onClick={toggleTalk} title="Push to talk">
        {isTalking ? <Square size={20} /> : <Mic size={20} />}
      </button>
      <button className="icon-button interrupt" type="button" onClick={onInterrupt} title="Interrupt">
        <Pause size={20} />
      </button>
      <form className="prompt-form" onSubmit={submit}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Ask a follow-up..."
          aria-label="Ask the tutor"
        />
        <button className="send-button" type="submit" title="Send">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
