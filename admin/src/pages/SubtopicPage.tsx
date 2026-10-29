import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { Collapse } from "../components/Collapse";
import { VideoSourceField } from "../components/VideoSourceField";

type MythItem = {
  id: string;
  statement: string;
  isMyth: boolean;
  explanation: string;
};

type Subtopic = {
  id: string;
  title: string;
  question: { id: string; title: string };
  explanationVideos: Array<{ id: string; title: string; vimeoUrl: string }>;
  scenarioVideos: Array<{ id: string; title: string; vimeoUrl: string }>;
  parentChallenges: Array<{ id: string; title: string; vimeoUrl: string }>;
  links: Array<{ id: string; title: string; url: string }>;
  pdfs: Array<{ id: string; title: string; url: string }>;
  mythFactSets: Array<{
    id: string;
    title: string;
    items: MythItem[];
  }>;
};

export function SubtopicPage() {
  const { id } = useParams();
  const [subtopic, setSubtopic] = useState<Subtopic | null>(null);
  const [error, setError] = useState("");

  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [scenarioTitle, setScenarioTitle] = useState("");
  const [scenarioUrl, setScenarioUrl] = useState("");
  const [challengeUrl, setChallengeUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  async function load() {
    if (!id) return;
    setSubtopic(await api<Subtopic>(`/api/content/subtopics/${id}`));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [id]);

  async function addExplanation(e: FormEvent) {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setError("Add a video link or upload a file");
      return;
    }
    setError("");
    await api("/api/content/explanation-videos", {
      method: "POST",
      body: JSON.stringify({
        subtopicId: id,
        title: videoTitle,
        vimeoUrl: videoUrl.trim(),
      }),
    });
    setVideoTitle("");
    setVideoUrl("");
    await load();
  }

  async function addScenario(e: FormEvent) {
    e.preventDefault();
    if (!scenarioUrl.trim()) {
      setError("Add a video link or upload a file");
      return;
    }
    setError("");
    await api("/api/content/scenario-videos", {
      method: "POST",
      body: JSON.stringify({
        subtopicId: id,
        title: scenarioTitle,
        vimeoUrl: scenarioUrl.trim(),
      }),
    });
    setScenarioTitle("");
    setScenarioUrl("");
    await load();
  }

  async function addChallenge(e: FormEvent) {
    e.preventDefault();
    if (!challengeUrl.trim()) {
      setError("Add a video link or upload a file");
      return;
    }
    setError("");
    await api("/api/content/parent-challenges", {
      method: "POST",
      body: JSON.stringify({
        subtopicId: id,
        vimeoUrl: challengeUrl.trim(),
      }),
    });
    setChallengeUrl("");
    await load();
  }

  async function addLink(e: FormEvent) {
    e.preventDefault();
    await api("/api/content/links", {
      method: "POST",
      body: JSON.stringify({ subtopicId: id, title: linkTitle, url: linkUrl }),
    });
    setLinkTitle("");
    setLinkUrl("");
    await load();
  }

  async function addPdf(e: FormEvent) {
    e.preventDefault();
    await api("/api/content/pdfs", {
      method: "POST",
      body: JSON.stringify({ subtopicId: id, title: pdfTitle, url: pdfUrl }),
    });
    setPdfTitle("");
    setPdfUrl("");
    await load();
  }

  async function remove(path: string) {
    await api(path, { method: "DELETE" });
    await load();
  }

  if (!subtopic) {
    return (
      <div>
        {error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="center-screen">Loading resources…</div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="muted page-crumb">
            <Link to="/content" style={{ fontWeight: 800, color: "var(--brand)" }}>
              ← Questions
            </Link>
            {" · "}
            {subtopic.question.title}
          </p>
          <h1>{subtopic.title}</h1>
          <p className="page-lede">
            Videos, myth game, links and PDFs for this tile.
          </p>
        </div>
      </div>

      <ResourcePanel
        defaultOpen
        title="Explanation videos"
        items={subtopic.explanationVideos.map((v) => ({
          id: v.id,
          label: v.title,
          meta: v.vimeoUrl,
          path: `/api/content/explanation-videos/${v.id}`,
        }))}
        onRemove={remove}
      >
        <form className="form-grid" onSubmit={addExplanation}>
          <label>
            Title
            <input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required />
          </label>
          <VideoSourceField value={videoUrl} onChange={setVideoUrl} />
          <button className="btn" type="submit" disabled={!videoUrl.trim()}>
            Add video
          </button>
        </form>
      </ResourcePanel>

      <ResourcePanel
        title="Story videos (for this topic)"
        items={subtopic.scenarioVideos.map((v) => ({
          id: v.id,
          label: v.title,
          meta: v.vimeoUrl,
          path: `/api/content/scenario-videos/${v.id}`,
        }))}
        onRemove={remove}
      >
        <p className="muted field-hint">
          Story clips for this subtopic. Main library: Stories in the sidebar.
        </p>
        <form className="form-grid" onSubmit={addScenario}>
          <label>
            Title
            <input
              value={scenarioTitle}
              onChange={(e) => setScenarioTitle(e.target.value)}
              required
              placeholder="Waiting for a turn"
            />
          </label>
          <VideoSourceField value={scenarioUrl} onChange={setScenarioUrl} />
          <button className="btn" type="submit" disabled={!scenarioUrl.trim()}>
            Add story video
          </button>
        </form>
      </ResourcePanel>

      <ResourcePanel
        title="Parent challenge (Try this at home)"
        items={subtopic.parentChallenges.map((v) => ({
          id: v.id,
          label: v.title,
          meta: v.vimeoUrl,
          path: `/api/content/parent-challenges/${v.id}`,
        }))}
        onRemove={remove}
      >
        <form className="form-grid" onSubmit={addChallenge}>
          <VideoSourceField value={challengeUrl} onChange={setChallengeUrl} />
          <button className="btn" type="submit" disabled={!challengeUrl.trim()}>
            Add challenge video
          </button>
        </form>
      </ResourcePanel>

      {error ? <div className="error">{error}</div> : null}

      <MythSets
        subtopicId={subtopic.id}
        sets={subtopic.mythFactSets}
        onChange={load}
        onError={setError}
      />

      <ResourcePanel
        title="Links"
        items={subtopic.links.map((v) => ({
          id: v.id,
          label: v.title,
          meta: v.url,
          path: `/api/content/links/${v.id}`,
        }))}
        onRemove={remove}
      >
        <form className="form-grid" onSubmit={addLink}>
          <label>
            Title
            <input value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} required />
          </label>
          <label>
            URL
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} required />
          </label>
          <button className="btn" type="submit">
            Add link
          </button>
        </form>
      </ResourcePanel>

      <ResourcePanel
        title="PDFs"
        items={subtopic.pdfs.map((v) => ({
          id: v.id,
          label: v.title,
          meta: v.url,
          path: `/api/content/pdfs/${v.id}`,
        }))}
        onRemove={remove}
      >
        <form className="form-grid" onSubmit={addPdf}>
          <label>
            Title
            <input value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} required />
          </label>
          <label>
            PDF URL
            <input value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} required />
          </label>
          <button className="btn" type="submit">
            Add PDF
          </button>
        </form>
      </ResourcePanel>
    </div>
  );
}

type ItemDraft = {
  statement: string;
  explanation: string;
  isMyth: boolean;
};

const emptyItem = (): ItemDraft => ({
  statement: "",
  explanation: "",
  isMyth: true,
});

function MythSets({
  subtopicId,
  sets,
  onChange,
  onError,
}: {
  subtopicId: string;
  sets: Subtopic["mythFactSets"];
  onChange: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [setTitle, setSetTitle] = useState("Myth vs Fact");
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, ItemDraft>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ItemDraft>(emptyItem());
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    onError("");
    try {
      await action();
      await onChange();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not save the myth set");
    } finally {
      setBusy(false);
    }
  }

  function draftFor(setId: string) {
    return drafts[setId] ?? emptyItem();
  }

  const statementCount = sets.reduce((count, set) => count + set.items.length, 0);

  return (
    <Collapse
      title="Myth vs Fact"
      subtitle={`${statementCount} statements · ${sets.length} set${sets.length === 1 ? "" : "s"}`}
      defaultOpen={sets.length > 0}
    >
      <p className="field-hint">
        Parents choose how many statements to see; the app picks that many at random.
      </p>

      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            await api("/api/content/myth-fact-sets", {
              method: "POST",
              body: JSON.stringify({ subtopicId, title: setTitle.trim() || "Myth vs Fact" }),
            });
            setSetTitle("Myth vs Fact");
          });
        }}
      >
        <label>
          Set title
          <input value={setTitle} onChange={(e) => setSetTitle(e.target.value)} required />
        </label>
        <button className="btn" type="submit" disabled={busy}>
          Add set
        </button>
      </form>

      {!sets.length ? (
        <div className="empty-state empty-state-sm">
          <strong>No myth set yet</strong>
          Add a set, then write the statements parents will answer.
        </div>
      ) : null}

      {sets.map((set) => {
        const draft = draftFor(set.id);
        return (
          <div key={set.id} className="myth-set">
            <form
              className="form-grid"
              onSubmit={(e) => {
                e.preventDefault();
                const title = (titles[set.id] ?? set.title).trim();
                void run(async () => {
                  await api(`/api/content/myth-fact-sets/${set.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ title }),
                  });
                });
              }}
            >
              <label>
                Set title
                <input
                  value={titles[set.id] ?? set.title}
                  onChange={(e) => setTitles((current) => ({ ...current, [set.id]: e.target.value }))}
                  required
                />
              </label>
              <div className="row-actions">
                <button className="btn secondary" type="submit" disabled={busy}>
                  Save title
                </button>
                <button
                  className="btn danger"
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await api(`/api/content/myth-fact-sets/${set.id}`, { method: "DELETE" });
                    })
                  }
                >
                  Delete set
                </button>
              </div>
            </form>

            <div className="list myth-items">
              {set.items.map((item, index) =>
                editingId === item.id ? (
                  <form
                    className="myth-editor"
                    key={item.id}
                    onSubmit={(e) => {
                      e.preventDefault();
                      void run(async () => {
                        await api(`/api/content/myth-fact-items/${item.id}`, {
                          method: "PATCH",
                          body: JSON.stringify(editDraft),
                        });
                        setEditingId(null);
                      });
                    }}
                  >
                    <ItemFields draft={editDraft} onChange={setEditDraft} />
                    <div className="row-actions">
                      <button className="btn small" type="submit" disabled={busy}>
                        Save statement
                      </button>
                      <button
                        className="btn secondary small"
                        type="button"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="list-item" key={item.id}>
                    <div className="myth-item-body">
                      <span className={`badge ${item.isMyth ? "off" : ""}`}>
                        {index + 1}. {item.isMyth ? "Myth" : "Fact"}
                      </span>
                      <strong className="myth-statement">{item.statement}</strong>
                      <div className="muted myth-explanation">{item.explanation}</div>
                    </div>
                    <div className="row-actions">
                      <button
                        className="btn secondary small"
                        type="button"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditDraft({
                            statement: item.statement,
                            explanation: item.explanation,
                            isMyth: item.isMyth,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn danger small"
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            await api(`/api/content/myth-fact-items/${item.id}`, { method: "DELETE" });
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
              {!set.items.length ? (
                <div className="empty-state empty-state-sm">
                  <strong>No statements yet</strong>
                  Add the first myth or fact below.
                </div>
              ) : null}
            </div>

            <form
              className="myth-editor"
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  await api("/api/content/myth-fact-items", {
                    method: "POST",
                    body: JSON.stringify({ setId: set.id, ...draft }),
                  });
                  setDrafts((current) => ({ ...current, [set.id]: emptyItem() }));
                });
              }}
            >
              <ItemFields
                draft={draft}
                onChange={(next) => setDrafts((current) => ({ ...current, [set.id]: next }))}
              />
              <div>
                <button className="btn" type="submit" disabled={busy}>
                  Add statement
                </button>
              </div>
            </form>
          </div>
        );
      })}
    </Collapse>
  );
}

function ItemFields({
  draft,
  onChange,
}: {
  draft: ItemDraft;
  onChange: (next: ItemDraft) => void;
}) {
  return (
    <div className="myth-fields">
      <label className="myth-type">
        Type
        <select
          value={draft.isMyth ? "myth" : "fact"}
          onChange={(e) => onChange({ ...draft, isMyth: e.target.value === "myth" })}
        >
          <option value="myth">Myth</option>
          <option value="fact">Fact</option>
        </select>
      </label>
      <label className="field-block">
        Statement
        <textarea
          className="text-area-prose"
          rows={3}
          value={draft.statement}
          onChange={(e) => onChange({ ...draft, statement: e.target.value })}
          required
          placeholder="The line the parent reads"
        />
      </label>
      <label className="field-block">
        Explanation
        <textarea
          className="text-area-prose"
          rows={4}
          value={draft.explanation}
          onChange={(e) => onChange({ ...draft, explanation: e.target.value })}
          required
          placeholder="Shown after they answer"
        />
      </label>
    </div>
  );
}

function ResourcePanel({
  title,
  items,
  onRemove,
  children,
  defaultOpen = false,
}: {
  title: string;
  items: Array<{ id: string; label: string; meta: string; path: string }>;
  onRemove: (path: string) => Promise<void>;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <Collapse
      title={title}
      subtitle={`${items.length} item${items.length === 1 ? "" : "s"}`}
      defaultOpen={defaultOpen || items.length > 0}
    >
      <div className={`list${items.length ? " list-scroll resource-list" : ""}`}>
        {items.map((item) => (
          <div className="list-item" key={item.id}>
            <div className="list-item-copy">
              <strong>{item.label}</strong>
              <div className="muted break-url">{item.meta}</div>
            </div>
            <button className="btn danger small" onClick={() => onRemove(item.path)}>
              Remove
            </button>
          </div>
        ))}
        {!items.length ? (
          <div className="empty-state empty-state-sm">
            <strong>None yet</strong>
            Use the form below to add the first item.
          </div>
        ) : null}
      </div>
      {children}
    </Collapse>
  );
}
