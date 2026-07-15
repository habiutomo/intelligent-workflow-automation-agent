import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "../types";

export class DelayNodeExecutor implements NodeExecutor {
  type = "delay" as const;

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const duration = (context.input._duration as number) || 1000;
    const durationMs = Math.max(0, Math.min(duration, 3600000)); // Max 1 hour

    context.logger.info(`Delaying for ${durationMs}ms`);
    await new Promise((resolve) => setTimeout(resolve, durationMs));

    return {
      output: {
        ...context.input,
        _delayedAt: new Date().toISOString(),
        _delayDuration: durationMs,
      },
    };
  }
}
