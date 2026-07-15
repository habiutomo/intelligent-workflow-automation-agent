export type WorkflowStatus = "draft" | "active" | "paused" | "archived";
export type RunStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type TriggerType = "manual" | "schedule" | "webhook" | "event";
export type NodeType =
  | "start"
  | "end"
  | "action"
  | "condition"
  | "delay"
  | "parallel"
  | "merge"
  | "httpRequest"
  | "transform"
  | "aiStep"
  | "code"
  | "webhook"
  | "email"
  | "notification";

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
  inputs?: string[];  // Edge IDs coming in
  outputs?: string[]; // Edge IDs going out
}

export interface WorkflowEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  sourceHandle?: string;
  targetHandle?: string;
  condition?: string; // Condition expression
  label?: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, unknown>;
}

export interface NodeExecutionContext {
  workflowId: string;
  runId: string;
  currentNodeId: string;
  input: Record<string, unknown>;
  variables: Record<string, unknown>;
  nodeStates: Record<string, NodeExecutionState>;
  logger: Logger;
}

export interface NodeExecutionState {
  nodeId: string;
  status: RunStatus;
  input?: unknown;
  output?: unknown;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
}

export interface NodeExecutor {
  type: NodeType;
  execute(context: NodeExecutionContext): Promise<NodeExecutionResult>;
  validate?(config: Record<string, unknown>): boolean;
}

export interface NodeExecutionResult {
  output: Record<string, unknown>;
  nextEdges?: string[]; // Which edges to follow (for branching)
  error?: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: RunStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  nodeStates: Record<string, NodeExecutionState>;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  triggerType: TriggerType;
  triggerConfig?: Record<string, unknown>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, unknown>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Logger {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}

export interface ScheduleConfig {
  cron: string;
  timezone?: string;
  enabled: boolean;
}

export interface WebhookConfig {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  secret?: string;
  headers?: Record<string, string>;
}

export interface EventTriggerConfig {
  eventType: string;
  filter?: Record<string, unknown>;
}

export interface HttpRequestConfig {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
}

export interface AiStepConfig {
  provider: "openai" | "anthropic" | "local";
  model?: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  outputVariable?: string;
}

export interface ConditionConfig {
  expression: string;
  trueEdge?: string;
  falseEdge?: string;
}

export interface TransformConfig {
  expression: string;
  inputVariable?: string;
  outputVariable?: string;
}

export interface CodeConfig {
  language: "javascript" | "python";
  code: string;
  timeout?: number;
}

export interface EmailConfig {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
}

export interface NotificationConfig {
  channel: string;
  message: string;
  level: "info" | "warning" | "error" | "success";
}
