import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  triggerType: string;
  nodes: Array<{ id: string; type: string; label: string; position: { x: number; y: number } }>;
  edges: Array<{ id: string; source: string; target: string; condition?: string }>;
  variables: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface Run {
  id: string;
  status: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/workflows/${id}`).then((r) => r.json()),
      fetch(`/api/workflows/${id}/runs`).then((r) => r.json()),
    ]).then(([wfRes, runsRes]) => {
      setWorkflow(wfRes.data);
      setRuns(runsRes.data || []);
    }).finally(() => setLoading(false));
  }, [id]);

  async function execute() {
    if (!id) return;
    setExecuting(true);
    try {
      const res = await fetch(`/api/workflows/${id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: { triggeredFrom: "detail" } }),
      });
      const data = await res.json();
      setRuns([data.data, ...runs]);
    } finally {
      setExecuting(false);
    }
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (!workflow) return <div className="empty-state">Workflow not found</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{workflow.name}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{workflow.description}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to={`/workflows/${id}/edit`} className="btn-primary">Edit Workflow</Link>
          <button className="btn-primary" onClick={execute} disabled={executing}>
            {executing ? "Running..." : "Execute"}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{workflow.nodes?.length || 0}</div>
          <div className="stat-label">Nodes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{workflow.edges?.length || 0}</div>
          <div className="stat-label">Edges</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">v{workflow.version}</div>
          <div className="stat-label">Version</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{runs.length}</div>
          <div className="stat-label">Total Runs</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Nodes</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Label</th>
                </tr>
              </thead>
              <tbody>
                {workflow.nodes?.map((node) => (
                  <tr key={node.id}>
                    <td><code>{node.id}</code></td>
                    <td>
                      <span className="badge badge-info">{node.type}</span>
                    </td>
                    <td>{node.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Runs</span>
          </div>
          <div className="table-container">
            {runs.length === 0 ? (
              <div className="empty-state"><p>No runs yet</p></div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.slice(0, 10).map((run) => (
                    <tr key={run.id}>
                      <td><code style={{ fontSize: 11 }}>{run.id.slice(0, 12)}...</code></td>
                      <td>
                        <span className={`badge badge-${run.status === "completed" ? "success" : run.status === "failed" ? "danger" : run.status === "running" ? "info" : "muted"}`}>
                          {run.status}
                        </span>
                      </td>
                      <td>{run.duration ? `${run.duration}ms` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
