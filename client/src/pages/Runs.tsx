import { useEffect, useState } from "react";

interface Run {
  id: string;
  workflowId: string;
  status: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

export default function Runs() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchRuns();
  }, [filter]);

  async function fetchRuns() {
    try {
      const url = filter ? `/api/runs/active` : `/api/runs/active`;
      const res = await fetch(url);
      const data = await res.json();
      setRuns(data.data || []);
    } catch (err) {
      console.error("Failed to fetch runs:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Workflow Runs</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text-primary)",
            }}
          >
            <option value="">All</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button className="btn-secondary" onClick={fetchRuns}>
            Refresh
          </button>
        </div>
      </div>

      {runs.length === 0 ? (
        <div className="empty-state">
          <h3>No runs yet</h3>
          <p>Execute a workflow to see runs here.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Workflow</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Duration</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td><code style={{ fontSize: 11 }}>{run.id.slice(0, 16)}</code></td>
                    <td>{run.workflowId}</td>
                    <td>
                      <span className={`badge badge-${
                        run.status === "completed" ? "success" :
                        run.status === "failed" ? "danger" :
                        run.status === "running" ? "info" : "muted"
                      }`}>
                        {run.status}
                      </span>
                    </td>
                    <td>{new Date(run.startedAt).toLocaleString()}</td>
                    <td>{run.duration ? `${run.duration}ms` : "-"}</td>
                    <td style={{ color: "var(--danger)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {run.error || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
