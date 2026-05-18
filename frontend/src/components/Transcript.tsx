import ReactMarkdown from "react-markdown";

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
        <p className="muted">Your conversation with GuardRail will appear here.</p>
      ) : (
        lines.map((line) => (
          <div key={line.id} className={`transcript-line ${line.speaker}`}>
            <span>{line.speaker === "tutor" ? "GuardRail" : "You"}</span>
            {line.speaker === "tutor" ? (
              <ReactMarkdown>{line.text}</ReactMarkdown>
            ) : (
              <p>{line.text}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
