import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { ListToolbar } from "../components/ListToolbar";
import { useListControls } from "../hooks/useListControls";

type SchoolUsage = {
  id: string;
  name: string;
  code: string;
  uniqueParents: number;
  unlocks: number;
  videoPlays: number;
  mythCompletes: number;
  active: boolean;
};

type RecentEvent = {
  id: string;
  eventType: string;
  schoolName: string;
  schoolCode?: string | null;
  createdAt: string;
};

type UsageResponse = {
  schools: SchoolUsage[];
  recent: RecentEvent[];
};

function schoolSearch(s: SchoolUsage) {
  return `${s.name} ${s.code}`;
}

function schoolStatus(s: SchoolUsage) {
  return s.active ? ("active" as const) : ("disabled" as const);
}

function eventSearch(e: RecentEvent) {
  return `${e.eventType} ${e.schoolName} ${e.schoolCode || ""}`;
}

function eventLabel(type: string) {
  switch (type) {
    case "unlock":
      return "Unlock";
    case "video_play":
      return "Video play";
    case "myth_complete":
      return "Myth game";
    default:
      return type.replaceAll("_", " ");
  }
}

function eventTone(type: string) {
  if (type === "unlock") return "info";
  if (type === "video_play") return "success";
  if (type === "myth_complete") return "warning";
  return "draft";
}

export function DashboardPage() {
  const [data, setData] = useState<UsageResponse | null>(null);
  const [error, setError] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  useEffect(() => {
    api<UsageResponse>("/api/analytics/usage")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const schools = data?.schools ?? [];
  const recent = data?.recent ?? [];

  const totals = useMemo(
    () =>
      schools.reduce(
        (acc, s) => {
          acc.parents += s.uniqueParents;
          acc.unlocks += s.unlocks;
          acc.videos += s.videoPlays;
          acc.myths += s.mythCompletes;
          return acc;
        },
        { parents: 0, unlocks: 0, videos: 0, myths: 0 }
      ),
    [schools]
  );

  const sortedSchools = useMemo(
    () =>
      [...schools].sort(
        (a, b) =>
          b.unlocks + b.videoPlays + b.mythCompletes -
          (a.unlocks + a.videoPlays + a.mythCompletes)
      ),
    [schools]
  );

  const schoolList = useListControls(
    sortedSchools,
    schoolSearch,
    schoolStatus,
    8
  );

  const filteredEvents = useMemo(() => {
    if (eventFilter === "all") return recent;
    return recent.filter((e) => e.eventType === eventFilter);
  }, [recent, eventFilter]);

  const eventList = useListControls(filteredEvents, eventSearch, undefined, 8);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Usage</h1>
          <p>Parent unlocks, video plays, and myth games by school.</p>
        </div>
        <div className="row-actions">
          <Link className="btn secondary small" to="/schools">
            Schools
          </Link>
          <Link className="btn small" to="/content">
            Questions
          </Link>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <div className="card-grid">
        <Stat tone="primary" label="Parents" value={data ? totals.parents : undefined} />
        <Stat tone="info" label="Unlocks" value={data ? totals.unlocks : undefined} />
        <Stat tone="success" label="Videos" value={data ? totals.videos : undefined} />
        <Stat tone="warning" label="Myth games" value={data ? totals.myths : undefined} />
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2 className="section-title">Schools</h2>
              <p>Sorted by recent activity</p>
            </div>
            <span className="muted">{schools.length} total</span>
          </div>

          <ListToolbar
            search={schoolList.search}
            onSearch={schoolList.setSearch}
            searchPlaceholder="Search school or code…"
            status={schoolList.status}
            onStatus={schoolList.setStatus}
            statusOptions={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "disabled", label: "Disabled" },
            ]}
            page={schoolList.page}
            pageCount={schoolList.pageCount}
            onPage={schoolList.setPage}
            pageSize={schoolList.pageSize}
            onPageSize={schoolList.setPageSize}
            start={schoolList.start}
            end={schoolList.end}
            filteredCount={schoolList.filteredCount}
            totalCount={schoolList.totalCount}
          />

          {!schools.length ? (
            <div className="empty-state">
              <strong>No schools yet</strong>
              <Link to="/schools">Add a school code</Link> so parents can unlock the app.
            </div>
          ) : !schoolList.pageItems.length ? (
            <div className="empty-state">
              <strong>No matches</strong>
              Try another search or filter.
            </div>
          ) : (
            <div className="table-wrap list-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>School</th>
                    <th>Code</th>
                    <th>Parents</th>
                    <th>Unlocks</th>
                    <th>Videos</th>
                    <th>Myths</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolList.pageItems.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.name}</strong>
                      </td>
                      <td>
                        <code>{s.code}</code>
                      </td>
                      <td>{s.uniqueParents}</td>
                      <td>{s.unlocks}</td>
                      <td>{s.videoPlays}</td>
                      <td>{s.mythCompletes}</td>
                      <td>
                        <span className={`badge ${s.active ? "" : "off"}`}>
                          {s.active ? "Active" : "Off"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2 className="section-title">Activity</h2>
              <p>Latest parent-app events</p>
            </div>
          </div>

          <div className="list-toolbar">
            <input
              className="list-search"
              value={eventList.search}
              onChange={(e) => eventList.setSearch(e.target.value)}
              placeholder="Search activity…"
            />
            <select
              className="list-filter"
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                eventList.setPage(1);
              }}
            >
              <option value="all">All events</option>
              <option value="unlock">Unlocks</option>
              <option value="video_play">Video plays</option>
              <option value="myth_complete">Myth games</option>
            </select>
            <label className="list-size">
              Show
              <input
                type="number"
                min={1}
                max={100}
                value={eventList.pageSize}
                onChange={(e) => eventList.setPageSize(Number(e.target.value))}
              />
            </label>
            <div className="list-pager">
              <span className="muted">
                {eventList.filteredCount
                  ? `${eventList.start}–${eventList.end} of ${eventList.filteredCount}`
                  : "0"}
              </span>
              <button
                type="button"
                className="btn secondary small"
                disabled={eventList.page <= 1}
                onClick={() => eventList.setPage(eventList.page - 1)}
              >
                Prev
              </button>
              <button
                type="button"
                className="btn secondary small"
                disabled={eventList.page >= eventList.pageCount}
                onClick={() => eventList.setPage(eventList.page + 1)}
              >
                Next
              </button>
            </div>
          </div>

          <div className="timeline list-scroll">
            {eventList.pageItems.map((e) => (
              <div className="timeline-item" key={e.id}>
                <div className="timeline-time">
                  {new Date(e.createdAt).toLocaleString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div>
                  <div className="row-actions" style={{ gap: 6 }}>
                    <span className={`badge ${eventTone(e.eventType)}`}>
                      {eventLabel(e.eventType)}
                    </span>
                  </div>
                  <div className="muted" style={{ marginTop: 4 }}>
                    {e.schoolName}
                    {e.schoolCode ? ` · ${e.schoolCode}` : ""}
                  </div>
                </div>
              </div>
            ))}
            {!recent.length ? (
              <div className="empty-state">
                <strong>No activity yet</strong>
                Events appear when parents unlock or use content.
              </div>
            ) : !eventList.pageItems.length ? (
              <div className="empty-state">
                <strong>No matches</strong>
                Try another search or event type.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  tone,
  label,
  value,
}: {
  tone: "primary" | "info" | "success" | "warning";
  label: string;
  value?: number;
}) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <span className="stat-ico" aria-hidden>
        {label.slice(0, 1)}
      </span>
      <div>
        <span className="muted">{label}</span>
        <strong>{value ?? "—"}</strong>
      </div>
    </div>
  );
}
