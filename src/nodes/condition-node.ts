import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "../types";

export class ConditionNodeExecutor implements NodeExecutor {
  type = "condition" as const;

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const expression = (context.input._expression as string) || 
      (context.input.config as Record<string, unknown>)?.expression as string;

    if (!expression) {
      throw new Error("Condition node requires an expression");
    }

    let result = false;
    try {
      const data = { ...context.input, ...context.variables };
      const fn = new Function(...Object.keys(data), `return !!(${expression})`);
      result = fn(...Object.values(data));
    } catch (error) {
      context.logger.warn(`Condition evaluation failed: ${error}`);
      result = false;
    }

    context.logger.info(`Condition "${expression}" evaluated to: ${result}`);

    return {
      output: {
        ...context.input,
        _conditionResult: result,
        _branch: result ? "true" : "false",
      },
      nextEdges: result ? [context.input._trueEdge as string].filter(Boolean) : 
                         [context.input._falseEdge as string].filter(Boolean),
    };
  }
}
