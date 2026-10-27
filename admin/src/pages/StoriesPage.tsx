import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";

type Story = {
  id: string;
  title: string;
  description: string;
  vimeoUrl: string;
  sortOrder: number;
  published: boolean;
};

export function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vimeoUrl, setVimeoUrl] = useState("https://vimeo.com/76979871");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

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
          <p>
            Short story-style sample videos for the main Stories section of the
            parent app.
          </p>
        </div>
        <div className="stat-card mini-stat">
          <span className="muted">Published</span>
          <strong>
            {published}/{stories.length}
          </strong>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {success ? <div className="alert success">{success}</div> : null}

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
            <label>
              Vimeo URL
              <input
                value={vimeoUrl}
                onChange={(e) => setVimeoUrl(e.target.value)}
                required
              />
            </label>
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
            <button className="btn" type="submit" disabled={busy || !title.trim()}>
              {busy ? "Saving…" : "Publish story"}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <h2 className="section-title">Library</h2>
        <div className="list">
          {stories.map((story) => (
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
                <div className="muted" style={{ marginTop: 6 }}>
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
              Add a Vimeo link above to populate the Stories screen.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
