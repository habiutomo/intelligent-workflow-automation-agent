import { useEffect, useState } from "react";

interface Stats {
  totalWorkflows: number;
  totalRuns: number;
  activeRuns: number;
  completedRuns: number;
  failedRuns: number;
}

interface EventEntry {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/health").then((r) => r.json()),
      fetch("/api/events?limit=20").then((r) => r.json()),
    ]).then(([_healthRes, eventsRes]) => {
      setStats({
        totalWorkflows: 3,
        totalRuns: 0,
        activeRuns: 0,
        completedRuns: 0,
        failedRuns: 0,
      });
      setEvents(eventsRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalWorkflows || 0}</div>
          <div className="stat-label">Total Workflows</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalRuns || 0}</div>
          <div className="stat-label">Total Runs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--info)" }}>{stats?.activeRuns || 0}</div>
          <div className="stat-label">Active Runs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--success)" }}>{stats?.completedRuns || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--danger)" }}>{stats?.failedRuns || 0}</div>
          <div className="stat-label">Failed</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Events</span>
          </div>
          <div className="event-log">
            {events.length === 0 ? (
              <div className="empty-state">
                <p>No events recorded yet</p>
              </div>
            ) : (
              events.map((event, i) => (
                <div key={i} className="event-item">
                  <span className="event-time">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="event-name">{event.event}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Actions</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 0" }}>
            <a href="/workflows" className="nav-item" style={{ background: "var(--bg-tertiary)" }}>
              <span>\u25B6</span> View Workflows
            </a>
            <a href="/runs" className="nav-item" style={{ background: "var(--bg-tertiary)" }}>
              <span>\u21BB</span> View Runs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
