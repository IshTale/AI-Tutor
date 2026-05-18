export type TranscriptLine = {
  id: string;
  speaker: "tutor" | "student";
  text: string;
};

type TranscriptProps = {
  lines: TranscriptLine[];
};

export function Transcript({ lines }: TranscriptProps) {
  return (
    <div className="transcript" aria-label="Live transcript">
      {lines.length === 0 ? (
        <p className="muted">Transcript will appear as the session starts.</p>
      ) : (
        lines.map((line) => (
          <p key={line.id} className={`transcript-line ${line.speaker}`}>
            <span>{line.speaker === "tutor" ? "Tutor" : "You"}</span>
            {line.text}
          </p>
        ))
      )}
    </div>
  );
}
