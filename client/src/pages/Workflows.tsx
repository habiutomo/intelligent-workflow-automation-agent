import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  triggerType: string;
  nodes: unknown[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function fetchWorkflows() {
    try {
      const res = await fetch("/api/workflows");
      const data = await res.json();
      setWorkflows(data.data || []);
    } catch (err) {
      console.error("Failed to fetch workflows:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createWorkflow() {
    if (!newName.trim()) return;
    try {
      await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          nodes: [
            { id: "start", type: "start", label: "Start", position: { x: 50, y: 200 }, config: {} },
            { id: "end", type: "end", label: "End", position: { x: 350, y: 200 }, config: {} },
          ],
          edges: [{ id: "e1", source: "start", target: "end" }],
        }),
      });
      setShowCreate(false);
      setNewName("");
      setNewDesc("");
      fetchWorkflows();
    } catch (err) {
      console.error("Failed to create workflow:", err);
    }
  }

  async function executeWorkflow(id: string) {
    try {
      await fetch(`/api/workflows/${id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: { triggeredFrom: "dashboard" } }),
      });
      alert("Workflow execution started!");
    } catch (err) {
      console.error("Failed to execute workflow:", err);
    }
  }

  async function deleteWorkflow(id: string) {
    if (!confirm("Delete this workflow?")) return;
    try {
      await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      fetchWorkflows();
    } catch (err) {
      console.error("Failed to delete workflow:", err);
    }
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Workflows</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + New Workflow
        </button>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Workflow</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>\u00D7</button>
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="My Workflow"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What does this workflow do?"
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={createWorkflow}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {workflows.length === 0 ? (
        <div className="empty-state">
          <h3>No workflows yet</h3>
          <p>Create your first workflow to get started.</p>
        </div>
      ) : (
        <div className="workflow-grid">
          {workflows.map((wf) => (
            <div key={wf.id} className="workflow-card">
              <div className="workflow-card-header">
                <h3>{wf.name}</h3>
                <span className={`badge badge-${wf.status === "active" ? "success" : wf.status === "draft" ? "muted" : "warning"}`}>
                  {wf.status}
                </span>
              </div>
              <p>{wf.description || "No description"}</p>
              <div className="workflow-card-meta">
                <span>{wf.nodes?.length || 0} nodes</span>
                <span>v{wf.version}</span>
                <span>{wf.triggerType}</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Link to={`/workflows/${wf.id}`} className="btn-secondary btn-sm">
                  View
                </Link>
                <Link to={`/workflows/${wf.id}/edit`} className="btn-primary btn-sm">
                  Edit
                </Link>
                <button className="btn-secondary btn-sm" onClick={() => executeWorkflow(wf.id)}>
                  Run
                </button>
                <button className="btn-danger btn-sm" onClick={() => deleteWorkflow(wf.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
