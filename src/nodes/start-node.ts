import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "../types";

export class StartNodeExecutor implements NodeExecutor {
  type = "start" as const;

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    return {
      output: {
        ...context.input,
        _startedAt: new Date().toISOString(),
        _workflowId: context.workflowId,
        _runId: context.runId,
      },
    };
  }
}
