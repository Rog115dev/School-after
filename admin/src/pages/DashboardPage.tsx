import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";

type UsageResponse = {
  schools: Array<{
    id: string;
    name: string;
    code: string;
    uniqueParents: number;
    unlocks: number;
    videoPlays: number;
    mythCompletes: number;
    active: boolean;
  }>;
  recent: Array<{
    id: string;
    eventType: string;
    schoolName: string;
    createdAt: string;
  }>;
};

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<UsageResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<UsageResponse>("/api/analytics/usage")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const totals = data?.schools.reduce(
    (acc, s) => {
      acc.parents += s.uniqueParents;
      acc.unlocks += s.unlocks;
      acc.videos += s.videoPlays;
      acc.myths += s.mythCompletes;
      return acc;
    },
    { parents: 0, unlocks: 0, videos: 0, myths: 0 }
  );

  return (
    <div>
      <section className="welcome">
        <div>
          <p className="welcome-kicker">Welcome back</p>
          <h1>{user?.name || "Admin"}</h1>
          <p>See how schools are using the parent app — unlocks, videos and games.</p>
          <div className="row-actions" style={{ marginTop: 16 }}>
            <Link className="btn" to="/content">
              Manage questions
            </Link>
            <Link className="btn secondary" to="/schools">
              Manage schools
            </Link>
          </div>
        </div>
        <div className="welcome-side">
          <span>Schools</span>
          <strong>{data?.schools.length ?? "—"}</strong>
          <em>with a code in the system</em>
        </div>
      </section>

      {error ? <div className="error">{error}</div> : null}

      <div className="card-grid">
        <Stat tone="primary" label="Unique parents" value={totals?.parents} />
        <Stat tone="info" label="Unlocks" value={totals?.unlocks} />
        <Stat tone="success" label="Video plays" value={totals?.videos} />
        <Stat tone="warning" label="Myth games" value={totals?.myths} />
      </div>

      <div className="dash-grid">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h2 className="section-title">Schools</h2>
            <p>Usage by school code</p>
          </div>
        </div>
        {!data?.schools.length ? (
          <div className="empty-state">
            <strong>No schools yet</strong>
            Add a school code so parents can unlock the app.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>School</th>
                  <th>Code</th>
                  <th>Parents</th>
                  <th>Unlocks</th>
                  <th>Videos</th>
                  <th>Myth games</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.schools.map((s) => (
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
            <h2 className="section-title">Recent activity</h2>
            <p>Latest events from the parent app</p>
          </div>
        </div>
        <div className="timeline">
          {data?.recent.map((e) => (
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
                <strong>{e.eventType.replaceAll("_", " ")}</strong>
                <div className="muted">{e.schoolName}</div>
              </div>
            </div>
          ))}
          {!data?.recent.length ? (
            <div className="empty-state">
              <strong>No activity yet</strong>
              Unlock the app with a school code to generate usage events.
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
