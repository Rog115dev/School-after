import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";

type Tip = {
  id: string;
  title: string;
  vimeoUrl: string;
  sortOrder: number;
  published: boolean;
};

export function TopTipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [title, setTitle] = useState("");
  const [vimeoUrl, setVimeoUrl] = useState("https://vimeo.com/76979871");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setTips(await api<Tip[]>("/api/content/top-tips"));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api("/api/content/top-tips", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          vimeoUrl: vimeoUrl.trim(),
          sortOrder: tips.length + 1,
          published: true,
        }),
      });
      setTitle("");
      setSuccess("Tip published to the mobile Top Tips list.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add tip");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(tip: Tip) {
    await api(`/api/content/top-tips/${tip.id}`, {
      method: "PUT",
      body: JSON.stringify({ published: !tip.published }),
    });
    setSuccess(
      !tip.published
        ? `“${tip.title}” is visible on mobile.`
        : `“${tip.title}” is hidden.`
    );
    await load();
  }

  async function remove(tip: Tip) {
    if (!confirm(`Delete “${tip.title}”?`)) return;
    await api(`/api/content/top-tips/${tip.id}`, { method: "DELETE" });
    setSuccess("Tip deleted.");
    await load();
  }

  const published = tips.filter((t) => t.published).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Top Tips</h1>
          <p>Short tip videos shown in the parent app Top Tips section.</p>
        </div>
        <div className="stat-card mini-stat">
          <span className="muted">Published</span>
          <strong>
            {published}/{tips.length}
          </strong>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {success ? <div className="alert success">{success}</div> : null}

      <div className="panel">
        <h2 className="section-title">Add tip</h2>
        <form className="form-grid" onSubmit={onCreate}>
          <label>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Get face-to-face"
            />
          </label>
          <label>
            Vimeo URL
            <input
              value={vimeoUrl}
              onChange={(e) => setVimeoUrl(e.target.value)}
              required
            />
          </label>
          <button className="btn" type="submit" disabled={busy || !title.trim()}>
            {busy ? "Saving…" : "Publish tip"}
          </button>
        </form>
      </div>

      <div className="panel">
        <h2 className="section-title">Library</h2>
        <div className="list">
          {tips.map((tip) => (
            <div className="list-item" key={tip.id}>
              <div>
                <strong>
                  {tip.sortOrder}. {tip.title}
                </strong>
                <div className="muted" style={{ marginTop: 6 }}>
                  {tip.vimeoUrl}
                </div>
              </div>
              <div className="row-actions">
                <span className={`badge ${tip.published ? "" : "draft"}`}>
                  {tip.published ? "Published" : "Draft"}
                </span>
                <button className="btn secondary small" onClick={() => toggle(tip)}>
                  {tip.published ? "Unpublish" : "Publish"}
                </button>
                <button className="btn danger small" onClick={() => remove(tip)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!tips.length ? (
            <div className="empty-state">
              <strong>No tips yet</strong>
              Add a short Vimeo tip above to fill the Top Tips screen.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
