import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import { ListToolbar } from "../components/ListToolbar";
import { VideoSourceField } from "../components/VideoSourceField";
import { useListControls } from "../hooks/useListControls";

type Tip = {
  id: string;
  title: string;
  vimeoUrl: string;
  sortOrder: number;
  published: boolean;
};

function tipSearch(t: Tip) {
  return `${t.title} ${t.vimeoUrl}`;
}

function tipStatus(t: Tip) {
  return t.published ? ("published" as const) : ("draft" as const);
}

export function TopTipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [title, setTitle] = useState("");
  const [vimeoUrl, setVimeoUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const list = useListControls(tips, tipSearch, tipStatus, 8);

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
      if (!vimeoUrl.trim()) throw new Error("Add a video link or upload a file");
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
      setVimeoUrl("");
      setAddOpen(false);
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
          <p>Short tip videos for the parent Top Tips tab.</p>
        </div>
        <div className="row-actions">
          <div className="stat-card mini-stat">
            <span className="muted">Published</span>
            <strong>
              {published}/{tips.length}
            </strong>
          </div>
          <button className="btn" type="button" onClick={() => setAddOpen((v) => !v)}>
            {addOpen ? "Close form" : "Add tip"}
          </button>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {success ? <div className="alert success">{success}</div> : null}

      {addOpen ? (
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
            <VideoSourceField value={vimeoUrl} onChange={setVimeoUrl} />
            <button
              className="btn"
              type="submit"
              disabled={busy || !title.trim() || !vimeoUrl.trim()}
            >
              {busy ? "Saving…" : "Publish tip"}
            </button>
          </form>
        </div>
      ) : null}

      <div className="panel">
        <ListToolbar
          search={list.search}
          onSearch={list.setSearch}
          searchPlaceholder="Search tips…"
          status={list.status}
          onStatus={list.setStatus}
          page={list.page}
          pageCount={list.pageCount}
          onPage={list.setPage}
          pageSize={list.pageSize}
          onPageSize={list.setPageSize}
          start={list.start}
          end={list.end}
          filteredCount={list.filteredCount}
          totalCount={list.totalCount}
        />
        <div className="list list-scroll">
          {list.pageItems.map((tip) => (
            <div className="list-item" key={tip.id}>
              <div>
                <strong>
                  {tip.sortOrder}. {tip.title}
                </strong>
                <div className="muted" style={{ marginTop: 4 }}>
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
              Add a tip above.
            </div>
          ) : !list.pageItems.length ? (
            <div className="empty-state">
              <strong>No matches</strong>
              Try another search or filter.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
