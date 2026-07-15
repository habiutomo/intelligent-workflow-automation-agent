import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "../types";

export class EndNodeExecutor implements NodeExecutor {
  type = "end" as const;

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    return {
      output: {
        ...context.input,
        _completedAt: new Date().toISOString(),
        _status: "completed",
      },
    };
  }
}
