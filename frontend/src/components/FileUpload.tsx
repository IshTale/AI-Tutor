import { FileText, Upload } from "lucide-react";
import { ChangeEvent, useRef } from "react";

export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
};

type FileUploadProps = {
  files: UploadedFile[];
  selectedFileId: string | null;
  onUpload: (file: File) => void;
  onSelect: (fileId: string | null) => void;
};

const formatBytes = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export function FileUpload({ files, selectedFileId, onUpload, onSelect }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    onUpload(file);
    event.target.value = "";
  };

  return (
    <section className="file-upload" aria-label="Session files">
      <div className="file-upload-header">
        <div>
          <h2>Session Files</h2>
          <p>{files.length ? `${files.length} uploaded` : "No uploaded files"}</p>
        </div>
        <button className="icon-button" type="button" onClick={() => inputRef.current?.click()} title="Upload file">
          <Upload size={18} />
        </button>
        <input ref={inputRef} className="visually-hidden" type="file" onChange={upload} />
      </div>

      <div className="file-list">
        {files.map((file) => (
          <button
            className={`file-row ${selectedFileId === file.id ? "selected" : ""}`}
            type="button"
            key={file.id}
            onClick={() => onSelect(selectedFileId === file.id ? null : file.id)}
          >
            <FileText size={17} />
            <span>{file.name}</span>
            <small>{formatBytes(file.size)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
