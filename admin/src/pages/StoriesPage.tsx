import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import { ListToolbar } from "../components/ListToolbar";
import { VideoSourceField } from "../components/VideoSourceField";
import { useListControls } from "../hooks/useListControls";

type Story = {
  id: string;
  title: string;
  description: string;
  vimeoUrl: string;
  sortOrder: number;
  published: boolean;
};

function storySearch(s: Story) {
  return `${s.title} ${s.description} ${s.vimeoUrl}`;
}

function storyStatus(s: Story) {
  return s.published ? ("published" as const) : ("draft" as const);
}

export function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vimeoUrl, setVimeoUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const list = useListControls(stories, storySearch, storyStatus, 8);

  async function load() {
    setStories(await api<Story[]>("/api/content/stories"));
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
      await api("/api/content/stories", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          vimeoUrl: vimeoUrl.trim(),
          sortOrder: stories.length + 1,
          published: true,
        }),
      });
      setTitle("");
      setDescription("");
      setVimeoUrl("");
      setAddOpen(false);
      setSuccess("Story published to the mobile Stories list.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add story");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(story: Story) {
    await api(`/api/content/stories/${story.id}`, {
      method: "PUT",
      body: JSON.stringify({ published: !story.published }),
    });
    setSuccess(
      !story.published
        ? `“${story.title}” is visible on mobile.`
        : `“${story.title}” is hidden.`
    );
    await load();
  }

  async function remove(story: Story) {
    if (!confirm(`Delete “${story.title}”?`)) return;
    await api(`/api/content/stories/${story.id}`, { method: "DELETE" });
    setSuccess("Story deleted.");
    await load();
  }

  const published = stories.filter((s) => s.published).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Stories</h1>
          <p>Story videos for the parent Stories library.</p>
        </div>
        <div className="row-actions">
          <div className="stat-card mini-stat">
            <span className="muted">Published</span>
            <strong>
              {published}/{stories.length}
            </strong>
          </div>
          <button className="btn" type="button" onClick={() => setAddOpen((v) => !v)}>
            {addOpen ? "Close form" : "Add story"}
          </button>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {success ? <div className="alert success">{success}</div> : null}

      {addOpen ? (
        <div className="panel">
          <h2 className="section-title">Add story video</h2>
          <form className="stack" onSubmit={onCreate}>
            <div className="form-grid">
              <label>
                Title
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Sam waits for a turn"
                />
              </label>
              <VideoSourceField value={vimeoUrl} onChange={setVimeoUrl} />
            </div>
            <label>
              Description (optional)
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What parents will learn from this story…"
              />
            </label>
            <div>
              <button
                className="btn"
                type="submit"
                disabled={busy || !title.trim() || !vimeoUrl.trim()}
              >
                {busy ? "Saving…" : "Publish story"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="panel">
        <ListToolbar
          search={list.search}
          onSearch={list.setSearch}
          searchPlaceholder="Search stories…"
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
          {list.pageItems.map((story) => (
            <div className="list-item" key={story.id}>
              <div>
                <strong>
                  {story.sortOrder}. {story.title}
                </strong>
                {story.description ? (
                  <div className="muted" style={{ marginTop: 4 }}>
                    {story.description}
                  </div>
                ) : null}
                <div className="muted" style={{ marginTop: 4 }}>
                  {story.vimeoUrl}
                </div>
              </div>
              <div className="row-actions">
                <span className={`badge ${story.published ? "" : "draft"}`}>
                  {story.published ? "Published" : "Draft"}
                </span>
                <button className="btn secondary small" onClick={() => toggle(story)}>
                  {story.published ? "Unpublish" : "Publish"}
                </button>
                <button className="btn danger small" onClick={() => remove(story)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!stories.length ? (
            <div className="empty-state">
              <strong>No stories yet</strong>
              Add a story above.
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
