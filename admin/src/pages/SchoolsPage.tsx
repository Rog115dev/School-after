import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import { ListToolbar } from "../components/ListToolbar";
import { useListControls } from "../hooks/useListControls";

type School = {
  id: string;
  name: string;
  code: string;
  expiresAt: string;
  active: boolean;
  _count?: { accessLogs: number; events: number };
};

function schoolSearch(s: School) {
  return `${s.name} ${s.code}`;
}

function schoolStatus(s: School) {
  return s.active ? ("active" as const) : ("disabled" as const);
}

export function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const list = useListControls(schools, schoolSearch, schoolStatus, 10);

  async function load() {
    setSchools(await api<School[]>("/api/schools"));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const created = await api<School>("/api/schools", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          expiresAt: new Date(expiresAt).toISOString(),
        }),
      });
      setName("");
      setExpiresAt("");
      setAddOpen(false);
      setSuccess(
        created?.code
          ? `School created. Share code ${created.code} with parents.`
          : "School created."
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create school");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(school: School) {
    await api(`/api/schools/${school.id}`, {
      method: "PUT",
      body: JSON.stringify({ active: !school.active }),
    });
    setSuccess(
      !school.active
        ? `${school.name} is active again.`
        : `${school.name} is disabled — parents can’t unlock with this code.`
    );
    await load();
  }

  async function remove(school: School) {
    if (!confirm(`Delete ${school.name}? This cannot be undone.`)) return;
    await api(`/api/schools/${school.id}`, { method: "DELETE" });
    setSuccess("School deleted.");
    await load();
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setSuccess(`Copied code ${code}`);
    } catch {
      setError("Could not copy — select the code manually.");
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Schools & codes</h1>
          <p>Search schools, filter by status, and page through the list.</p>
        </div>
        <div className="row-actions">
          <div className="stat-card mini-stat">
            <span className="muted">Schools</span>
            <strong>{schools.length}</strong>
          </div>
          <button className="btn" type="button" onClick={() => setAddOpen((v) => !v)}>
            {addOpen ? "Close form" : "Add school"}
          </button>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {success ? <div className="alert success">{success}</div> : null}

      {addOpen ? (
        <div className="panel">
          <h2 className="section-title">Add school</h2>
          <form className="form-grid" onSubmit={onCreate}>
            <label>
              School name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Greenfield Primary"
              />
            </label>
            <label>
              Access expires
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                required
              />
            </label>
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create + generate code"}
            </button>
          </form>
        </div>
      ) : null}

      <div className="panel">
        <ListToolbar
          search={list.search}
          onSearch={list.setSearch}
          searchPlaceholder="Search name or code…"
          status={list.status}
          onStatus={list.setStatus}
          statusOptions={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "disabled", label: "Disabled" },
          ]}
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

        {!schools.length ? (
          <div className="empty-state">
            <strong>No schools yet</strong>
            Add a school above.
          </div>
        ) : !list.pageItems.length ? (
          <div className="empty-state">
            <strong>No matches</strong>
            Try another search or filter.
          </div>
        ) : (
          <div className="table-wrap list-scroll">
            <table className="table table-cards">
              <thead>
                <tr>
                  <th>School</th>
                  <th>Code</th>
                  <th>Expires</th>
                  <th>Unlocks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.pageItems.map((s) => (
                  <tr key={s.id}>
                    <td data-label="School">
                      <strong>{s.name}</strong>
                    </td>
                    <td data-label="Code">
                      <div className="row-actions">
                        <code>{s.code}</code>
                        <button
                          type="button"
                          className="btn secondary small"
                          onClick={() => copyCode(s.code)}
                        >
                          Copy
                        </button>
                      </div>
                    </td>
                    <td data-label="Expires">{new Date(s.expiresAt).toLocaleDateString()}</td>
                    <td data-label="Unlocks">{s._count?.accessLogs ?? 0}</td>
                    <td data-label="Status">
                      <span className={`badge ${s.active ? "" : "off"}`}>
                        {s.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="row-actions">
                        <button
                          className="btn secondary small"
                          onClick={() => toggleActive(s)}
                        >
                          {s.active ? "Disable" : "Enable"}
                        </button>
                        <button className="btn danger small" onClick={() => remove(s)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
