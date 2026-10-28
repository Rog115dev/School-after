import { useState, type ChangeEvent } from "react";
import { uploadVideo } from "../api";

type Mode = "link" | "upload";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

/** Paste a Vimeo/URL link, or upload a video file to the API. */
export function VideoSourceField({
  value,
  onChange,
  label = "Video",
}: Props) {
  const [mode, setMode] = useState<Mode>(
    value.startsWith("/uploads/") ? "upload" : "link"
  );
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const result = await uploadVideo(file);
      onChange(result.url);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="video-source">
      <div className="video-source-label">{label}</div>
      <div className="video-source-tabs">
        <button
          type="button"
          className={mode === "link" ? "active" : ""}
          onClick={() => setMode("link")}
        >
          Video link
        </button>
        <button
          type="button"
          className={mode === "upload" ? "active" : ""}
          onClick={() => setMode("upload")}
        >
          Upload file
        </button>
      </div>

      {mode === "link" ? (
        <input
          value={value.startsWith("/uploads/") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://vimeo.com/… or any video URL"
          required={!value.startsWith("/uploads/")}
        />
      ) : (
        <div className="video-source-upload">
          <input
            type="file"
            accept="video/*,.mp4,.mov,.webm,.m4v"
            onChange={onFile}
            disabled={busy}
          />
          {busy ? <span className="muted">Uploading…</span> : null}
          {!busy && (fileName || value.startsWith("/uploads/")) ? (
            <span className="muted">
              {fileName || "Uploaded file ready"}
              {value ? ` · ${value}` : ""}
            </span>
          ) : null}
        </div>
      )}
      {error ? <div className="error" style={{ marginTop: 8 }}>{error}</div> : null}
    </div>
  );
}
