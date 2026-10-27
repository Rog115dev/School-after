import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

type Subtopic = {
  id: string;
  title: string;
  published: boolean;
  mythFactSets: Array<{ id: string; items: Array<{ id: string }> }>;
};

type Question = {
  id: string;
  title: string;
  description: string;
  published: boolean;
  sortOrder: number;
  subtopics: Subtopic[];
};

export function ContentPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [subtopicTitle, setSubtopicTitle] = useState<Record<string, string>>({});
  const [publishSubtopic, setPublishSubtopic] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setQuestions(await api<Question[]>("/api/content/questions"));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function createQuestion(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api("/api/content/questions", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          published: publishNow,
          sortOrder: questions.length + 1,
        }),
      });
      setTitle("");
      setDescription("");
      setSuccess(
        publishNow
          ? "Question added and published — it shows on the mobile home screen."
          : "Question saved as draft. Publish it to show on mobile."
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add question");
    } finally {
      setBusy(false);
    }
  }

  async function toggleQuestion(q: Question) {
    await api(`/api/content/questions/${q.id}`, {
      method: "PUT",
      body: JSON.stringify({ published: !q.published }),
    });
    setSuccess(
      !q.published
        ? `“${q.title}” is now visible on mobile.`
        : `“${q.title}” is hidden from mobile.`
    );
    await load();
  }

  async function saveEdit(id: string) {
    await api(`/api/content/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDescription.trim(),
      }),
    });
    setEditingId(null);
    setSuccess("Question updated.");
    await load();
  }

  async function removeQuestion(q: Question) {
    if (!confirm(`Delete “${q.title}” and all its subtopics/resources?`)) return;
    await api(`/api/content/questions/${q.id}`, { method: "DELETE" });
    setSuccess("Question deleted.");
    await load();
  }

  async function addSubtopic(questionId: string) {
    const value = subtopicTitle[questionId]?.trim();
    if (!value) return;
    await api("/api/content/subtopics", {
      method: "POST",
      body: JSON.stringify({
        questionId,
        title: value,
        published: publishSubtopic,
      }),
    });
    setSubtopicTitle((prev) => ({ ...prev, [questionId]: "" }));
    setSuccess(publishSubtopic ? "Subtopic published." : "Subtopic saved as draft.");
    await load();
  }

  async function toggleSubtopic(s: Subtopic) {
    await api(`/api/content/subtopics/${s.id}`, {
      method: "PUT",
      body: JSON.stringify({ published: !s.published }),
    });
    await load();
  }

  async function removeSubtopic(s: Subtopic) {
    if (!confirm(`Delete subtopic “${s.title}”?`)) return;
    await api(`/api/content/subtopics/${s.id}`, { method: "DELETE" });
    await load();
  }

  const publishedCount = questions.filter((q) => q.published).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Questions</h1>
          <p>
            These are the main cards on the parent home screen. Add a question,
            publish it, then add subtopics and resources.
          </p>
        </div>
        <div className="stat-card mini-stat">
          <span className="muted">On mobile</span>
          <strong>
            {publishedCount}/{questions.length}
          </strong>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {success ? <div className="alert success">{success}</div> : null}

      <div className="panel">
        <h2 className="section-title">Add a question</h2>
        <form className="stack" onSubmit={createQuestion}>
          <label>
            Question title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="When should I be worried about my child's communication?"
            />
          </label>
          <label>
            Short description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Helps your team remember what this covers"
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={publishNow}
              onChange={(e) => setPublishNow(e.target.checked)}
            />
            Publish to mobile app now
          </label>
          <div>
            <button className="btn" type="submit" disabled={busy || !title.trim()}>
              {busy ? "Saving…" : "Add question"}
            </button>
          </div>
        </form>
      </div>

      {!questions.length ? (
        <div className="panel">
          <div className="empty-state">
            <strong>No questions yet</strong>
            Add your first parent question above. It will appear as a home-screen card.
          </div>
        </div>
      ) : null}

      {questions.map((q, index) => (
        <div className="panel" key={q.id}>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              {editingId === q.id ? (
                <div className="stack">
                  <label>
                    Title
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </label>
                  <div className="row-actions">
                    <button className="btn small" type="button" onClick={() => saveEdit(q.id)}>
                      Save changes
                    </button>
                    <button
                      className="btn secondary small"
                      type="button"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="muted" style={{ fontWeight: 800, marginBottom: 4 }}>
                    Card {index + 1}
                  </div>
                  <h2>{q.title}</h2>
                  <p>{q.description || "No description"}</p>
                  <p className="muted" style={{ marginTop: 8 }}>
                    {q.published ? "Visible on mobile home" : "Hidden from mobile (draft)"}
                    {" · "}
                    {q.subtopics.length} subtopic{q.subtopics.length === 1 ? "" : "s"}
                  </p>
                </>
              )}
            </div>
            {editingId !== q.id ? (
              <div className="row-actions">
                <span className={`badge ${q.published ? "" : "draft"}`}>
                  {q.published ? "Published" : "Draft"}
                </span>
                <button
                  className="btn secondary small"
                  onClick={() => {
                    setEditingId(q.id);
                    setEditTitle(q.title);
                    setEditDescription(q.description || "");
                  }}
                >
                  Edit
                </button>
                <button className="btn secondary small" onClick={() => toggleQuestion(q)}>
                  {q.published ? "Unpublish" : "Publish"}
                </button>
                <button className="btn danger small" onClick={() => removeQuestion(q)}>
                  Delete
                </button>
              </div>
            ) : null}
          </div>

          <div className="list">
            {q.subtopics.map((s) => (
              <div className="list-item" key={s.id}>
                <div>
                  <strong>{s.title}</strong>
                  <div className="muted" style={{ marginTop: 6 }}>
                    <span className={`badge ${s.published ? "" : "draft"}`}>
                      {s.published ? "Published" : "Draft"}
                    </span>
                    {" · "}
                    {s.mythFactSets?.some((set) => set.items.length)
                      ? `${s.mythFactSets.reduce((count, set) => count + set.items.length, 0)} statements registered`
                      : "No statements registered"}
                  </div>
                </div>
                <div className="row-actions">
                  <button className="btn secondary small" onClick={() => toggleSubtopic(s)}>
                    {s.published ? "Unpublish" : "Publish"}
                  </button>
                  <Link className="btn small" to={`/content/subtopics/${s.id}`}>
                    Resources
                  </Link>
                  <button className="btn danger small" onClick={() => removeSubtopic(s)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!q.subtopics.length ? (
              <div className="empty-state" style={{ padding: "18px 10px" }}>
                <strong>No subtopics</strong>
                Add age groups or topics parents should choose next.
              </div>
            ) : null}
          </div>

          <div className="form-grid" style={{ marginTop: 16 }}>
            <label>
              New subtopic
              <input
                value={subtopicTitle[q.id] || ""}
                onChange={(e) =>
                  setSubtopicTitle((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                placeholder="My child is under 5 years"
              />
            </label>
            <label className="check" style={{ alignSelf: "end", paddingBottom: 12 }}>
              <input
                type="checkbox"
                checked={publishSubtopic}
                onChange={(e) => setPublishSubtopic(e.target.checked)}
              />
              Publish
            </label>
            <button className="btn secondary" type="button" onClick={() => addSubtopic(q.id)}>
              Add subtopic
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
