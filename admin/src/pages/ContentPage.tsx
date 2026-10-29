import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Collapse } from "../components/Collapse";
import { ListToolbar } from "../components/ListToolbar";
import { useListControls } from "../hooks/useListControls";

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

function questionSearch(q: Question) {
  return `${q.title} ${q.description} ${q.subtopics.map((s) => s.title).join(" ")}`;
}

function questionStatus(q: Question) {
  return q.published ? ("published" as const) : ("draft" as const);
}

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
  const [addOpen, setAddOpen] = useState(false);

  const list = useListControls(questions, questionSearch, questionStatus, 6);

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
      setAddOpen(false);
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
            Home-screen cards for parents. Search, filter, and open a card to manage
            subtopics.
          </p>
        </div>
        <div className="row-actions">
          <div className="stat-card mini-stat">
            <span className="muted">On mobile</span>
            <strong>
              {publishedCount}/{questions.length}
            </strong>
          </div>
          <button className="btn" type="button" onClick={() => setAddOpen((v) => !v)}>
            {addOpen ? "Close form" : "Add question"}
          </button>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {success ? <div className="alert success">{success}</div> : null}

      {addOpen ? (
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
            <label className="field-block">
              Short description (optional)
              <textarea
                className="text-area-prose"
                rows={3}
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
                {busy ? "Saving…" : "Save question"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="panel">
        <ListToolbar
          search={list.search}
          onSearch={list.setSearch}
          searchPlaceholder="Search questions or subtopics…"
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

        {!questions.length ? (
          <div className="empty-state">
            <strong>No questions yet</strong>
            Add your first parent question above.
          </div>
        ) : !list.pageItems.length ? (
          <div className="empty-state">
            <strong>No matches</strong>
            Try another search or filter.
          </div>
        ) : (
          <div className="list-scroll">
            {list.pageItems.map((q) => (
              <Collapse
                key={q.id}
                title={q.title}
                subtitle={`${q.published ? "Published" : "Draft"} · ${q.subtopics.length} subtopic${q.subtopics.length === 1 ? "" : "s"}`}
                actions={
                  <>
                    <span className={`badge ${q.published ? "" : "draft"}`}>
                      {q.published ? "Published" : "Draft"}
                    </span>
                    <button
                      className="btn secondary small"
                      type="button"
                      onClick={() => {
                        setEditingId(q.id);
                        setEditTitle(q.title);
                        setEditDescription(q.description || "");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn secondary small"
                      type="button"
                      onClick={() => toggleQuestion(q)}
                    >
                      {q.published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      className="btn danger small"
                      type="button"
                      onClick={() => removeQuestion(q)}
                    >
                      Delete
                    </button>
                  </>
                }
              >
                {editingId === q.id ? (
                  <div className="stack" style={{ marginBottom: 8 }}>
                    <label>
                      Title
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </label>
                    <label className="field-block">
                      Description
                      <textarea
                        className="text-area-prose"
                        rows={3}
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
                ) : q.description ? (
                  <p style={{ marginBottom: 8 }}>{q.description}</p>
                ) : null}

                <div className="list">
                  {q.subtopics.map((s) => (
                    <div className="list-item" key={s.id}>
                      <div>
                        <strong>{s.title}</strong>
                        <div className="muted" style={{ marginTop: 4 }}>
                          <span className={`badge ${s.published ? "" : "draft"}`}>
                            {s.published ? "Published" : "Draft"}
                          </span>
                          {" · "}
                          {s.mythFactSets?.some((set) => set.items.length)
                            ? `${s.mythFactSets.reduce((count, set) => count + set.items.length, 0)} statements`
                            : "No statements"}
                        </div>
                      </div>
                      <div className="row-actions">
                        <button
                          className="btn secondary small"
                          type="button"
                          onClick={() => toggleSubtopic(s)}
                        >
                          {s.published ? "Unpublish" : "Publish"}
                        </button>
                        <Link className="btn small" to={`/content/subtopics/${s.id}`}>
                          Resources
                        </Link>
                        <button
                          className="btn danger small"
                          type="button"
                          onClick={() => removeSubtopic(s)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {!q.subtopics.length ? (
                    <div className="empty-state" style={{ padding: "10px" }}>
                      <strong>No subtopics</strong>
                      Add one below.
                    </div>
                  ) : null}
                </div>

                <div className="form-grid" style={{ marginTop: 8 }}>
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
                  <label className="check" style={{ alignSelf: "end", paddingBottom: 8 }}>
                    <input
                      type="checkbox"
                      checked={publishSubtopic}
                      onChange={(e) => setPublishSubtopic(e.target.checked)}
                    />
                    Publish
                  </label>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => addSubtopic(q.id)}
                  >
                    Add subtopic
                  </button>
                </div>
              </Collapse>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
