import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const nodeTypes: Record<string, React.FC<{ data: Record<string, unknown> }>> = {};

const nodeColors: Record<string, string> = {
  start: "#22c55e",
  end: "#ef4444",
  action: "#3b82f6",
  condition: "#f59e0b",
  httpRequest: "#06b6d4",
  aiStep: "#8b5cf6",
  code: "#ec4899",
  delay: "#64748b",
  transform: "#14b8a6",
  email: "#f97316",
  notification: "#a855f7",
  parallel: "#0ea5e9",
  merge: "#10b981",
  webhook: "#6366f1",
};

function CustomNode({ data }: { data: Record<string, unknown> }) {
  const type = (data.nodeType as string) || "action";
  const color = nodeColors[type] || "#64748b";

  return (
    <div
      style={{
        padding: "10px 16px",
        borderRadius: 8,
        border: `2px solid ${color}`,
        background: "var(--bg-secondary)",
        minWidth: 120,
        textAlign: "center",
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color }} />
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{type}</div>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{(data.label as string) || "Node"}</div>
      <Handle type="source" position={Position.Right} style={{ background: color }} />
    </div>
  );
}

nodeTypes.custom = CustomNode;

const defaultNodeTypes = { custom: CustomNode };

export default function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nodeName, setNodeName] = useState("");
  const [nodeType, setNodeType] = useState("action");

  const initialNodes: Node[] = useMemo(() => workflow?.nodes?.map((n: any) => ({
    id: n.id,
    type: "custom",
    position: n.position,
    data: { label: n.label, nodeType: n.type, config: n.config },
  })) || [], [workflow]);

  const initialEdges: Edge[] = useMemo(() => workflow?.edges?.map((e: any) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.condition,
    animated: true,
  })) || [], [workflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/workflows/${id}`)
      .then((r) => r.json())
      .then((res) => {
        setWorkflow(res.data);
        setNodes(initialNodes);
        setEdges(initialEdges);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge({ ...connection, animated: true }, eds)
      );
    },
    [setEdges]
  );

  function addNode() {
    if (!nodeName.trim()) return;
    const nodeId = `node_${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: "custom",
      position: { x: 250, y: 150 },
      data: { label: nodeName, nodeType },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeName("");
  }

  async function save() {
    if (!id) return;
    setSaving(true);
    try {
      const nodesData = nodes.map((n) => ({
        id: n.id,
        type: n.data.nodeType,
        label: n.data.label,
        position: n.position,
        config: n.data.config || {},
      }));
      const edgesData = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        condition: e.label,
      }));

      await fetch(`/api/workflows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: nodesData, edges: edgesData }),
      });
      navigate(`/workflows/${id}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Edit: {workflow?.name}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, height: "calc(100vh - 160px)" }}>
        <div className="card" style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div className="card-title" style={{ marginBottom: 12 }}>Add Node</div>
          <div className="form-group">
            <label>Node Name</label>
            <input
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="Node name"
            />
          </div>
          <div className="form-group">
            <label>Node Type</label>
            <select value={nodeType} onChange={(e) => setNodeType(e.target.value)}>
              <option value="start">Start</option>
              <option value="end">End</option>
              <option value="action">Action</option>
              <option value="condition">Condition</option>
              <option value="httpRequest">HTTP Request</option>
              <option value="aiStep">AI Step</option>
              <option value="code">Code</option>
              <option value="delay">Delay</option>
              <option value="transform">Transform</option>
              <option value="email">Email</option>
              <option value="notification">Notification</option>
              <option value="parallel">Parallel</option>
              <option value="merge">Merge</option>
              <option value="webhook">Webhook</option>
            </select>
          </div>
          <button className="btn-primary" onClick={addNode}>Add Node</button>

          <div style={{ marginTop: 20, fontSize: 12, color: "var(--text-muted)" }}>
            <p>Drag between node handles to connect.</p>
            <p style={{ marginTop: 4 }}>Nodes: {nodes.length}</p>
            <p>Edges: {edges.length}</p>
          </div>
        </div>

        <div className="card" style={{ flex: 1, padding: 0, overflow: "hidden" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={defaultNodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
