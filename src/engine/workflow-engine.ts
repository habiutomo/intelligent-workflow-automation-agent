import { v4 as uuidv4 } from "uuid";
import {
  Workflow,
  WorkflowDefinition,
  WorkflowRun,
  WorkflowNode,
  WorkflowEdge,
  NodeExecutionContext,
  NodeExecutionState,
  NodeExecutor,
  NodeType,
  RunStatus,
  Logger,
} from "../types";
import { EventBus } from "../events/event-bus";

const defaultLogger: Logger = {
  info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
  debug: (msg, ...args) => console.debug(`[DEBUG] ${msg}`, ...args),
};

export class WorkflowEngine {
  private executors = new Map<NodeType, NodeExecutor>();
  private running = new Map<string, WorkflowRun>();
  private eventBus: EventBus;
  private logger: Logger;

  constructor(eventBus?: EventBus, logger?: Logger) {
    this.eventBus = eventBus || new EventBus();
    this.logger = logger || defaultLogger;
  }

  registerExecutor(executor: NodeExecutor): void {
    this.executors.set(executor.type, executor);
    this.logger.info(`Registered executor for node type: ${executor.type}`);
  }

  getExecutor(type: NodeType): NodeExecutor | undefined {
    return this.executors.get(type);
  }

  async executeWorkflow(
    workflow: Workflow,
    input: Record<string, unknown> = {}
  ): Promise<WorkflowRun> {
    const run: WorkflowRun = {
      id: uuidv4(),
      workflowId: workflow.id,
      status: "pending",
      input,
      nodeStates: {},
      startedAt: new Date(),
    };

    this.running.set(run.id, run);
    this.eventBus.emit("workflow:started", { workflowId: workflow.id, runId: run.id });

    try {
      run.status = "running";
      const definition: WorkflowDefinition = {
        nodes: workflow.nodes,
        edges: workflow.edges,
        variables: workflow.variables,
      };

      // Find start nodes
      const startNodes = definition.nodes.filter(
        (n) => n.type === "start" || this.isRootNode(n, definition.edges)
      );

      if (startNodes.length === 0) {
        throw new Error("No start node found in workflow");
      }

      // Execute from start nodes
      for (const startNode of startNodes) {
        await this.executeNode(startNode, definition, run, { ...input });
      }

      run.status = "completed";
      run.completedAt = new Date();
      run.duration = run.completedAt.getTime() - run.startedAt.getTime();

      this.eventBus.emit("workflow:completed", {
        workflowId: workflow.id,
        runId: run.id,
        duration: run.duration,
      });
    } catch (error) {
      run.status = "failed";
      run.error = error instanceof Error ? error.message : String(error);
      run.completedAt = new Date();
      run.duration = run.completedAt.getTime() - run.startedAt.getTime();

      this.eventBus.emit("workflow:failed", {
        workflowId: workflow.id,
        runId: run.id,
        error: run.error,
      });

      this.logger.error(`Workflow run ${run.id} failed: ${run.error}`);
    } finally {
      this.running.delete(run.id);
    }

    return run;
  }

  private async executeNode(
    node: WorkflowNode,
    definition: WorkflowDefinition,
    run: WorkflowRun,
    inputData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const executor = this.executors.get(node.type);
    if (!executor) {
      throw new Error(`No executor registered for node type: ${node.type}`);
    }

    const state: NodeExecutionState = {
      nodeId: node.id,
      status: "running",
      input: inputData,
      startedAt: new Date(),
    };
    run.nodeStates[node.id] = state;

    this.logger.info(`Executing node: ${node.label} (${node.type}) [${node.id}]`);
    this.eventBus.emit("node:started", { runId: run.id, nodeId: node.id, nodeType: node.type });

    try {
      const context: NodeExecutionContext = {
        workflowId: run.workflowId,
        runId: run.id,
        currentNodeId: node.id,
        input: inputData,
        variables: { ...definition.variables },
        nodeStates: run.nodeStates,
        logger: this.logger,
      };

      const result = await executor.execute(context);

      state.status = "completed";
      state.output = result.output;
      state.completedAt = new Date();
      state.duration = state.completedAt.getTime() - (state.startedAt?.getTime() || 0);

      this.eventBus.emit("node:completed", {
        runId: run.id,
        nodeId: node.id,
        duration: state.duration,
      });

      // Determine which edges to follow
      const outgoingEdges = definition.edges.filter((e) => e.source === node.id);
      let edgesToFollow: WorkflowEdge[];

      if (result.nextEdges && result.nextEdges.length > 0) {
        edgesToFollow = outgoingEdges.filter((e) => result.nextEdges!.includes(e.id));
      } else {
        // Follow edges that satisfy conditions
        edgesToFollow = outgoingEdges.filter((edge) => {
          if (edge.condition) {
            return this.evaluateCondition(edge.condition, result.output, definition.variables);
          }
          return true;
        });
      }

      // Execute downstream nodes
      for (const edge of edgesToFollow) {
        const nextNode = definition.nodes.find((n) => n.id === edge.target);
        if (nextNode) {
          if (nextNode.type === "end") {
            run.output = { ...run.output, ...result.output };
            this.eventBus.emit("workflow:ended", { runId: run.id, output: result.output });
          } else {
            await this.executeNode(nextNode, definition, run, {
              ...inputData,
              ...result.output,
            });
          }
        }
      }

      return result.output;
    } catch (error) {
      state.status = "failed";
      state.error = error instanceof Error ? error.message : String(error);
      state.completedAt = new Date();
      state.duration = state.completedAt.getTime() - (state.startedAt?.getTime() || 0);

      this.eventBus.emit("node:failed", {
        runId: run.id,
        nodeId: node.id,
        error: state.error,
      });

      throw error;
    }
  }

  private isRootNode(node: WorkflowNode, edges: WorkflowEdge[]): boolean {
    return !edges.some((e) => e.target === node.id);
  }

  private evaluateCondition(
    expression: string,
    data: Record<string, unknown>,
    variables: Record<string, unknown>
  ): boolean {
    try {
      const context = { ...data, ...variables, data, vars: variables };
      const fn = new Function(...Object.keys(context), `return ${expression}`);
      return !!fn(...Object.values(context));
    } catch {
      this.logger.warn(`Failed to evaluate condition: ${expression}`);
      return false;
    }
  }

  getRunning(): WorkflowRun[] {
    return Array.from(this.running.values());
  }

  getRun(runId: string): WorkflowRun | undefined {
    return this.running.get(runId);
  }

  async cancelRun(runId: string): Promise<boolean> {
    const run = this.running.get(runId);
    if (run) {
      run.status = "cancelled";
      run.completedAt = new Date();
      run.duration = run.completedAt.getTime() - run.startedAt.getTime();
      this.running.delete(runId);
      this.eventBus.emit("workflow:cancelled", { runId });
      return true;
    }
    return false;
  }
}
