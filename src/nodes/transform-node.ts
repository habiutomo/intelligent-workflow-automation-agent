import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "../types";

export class TransformNodeExecutor implements NodeExecutor {
  type = "transform" as const;

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const expression = (context.input._expression as string) || "";
    const inputVariable = (context.input._inputVariable as string) || "data";
    const outputVariable = (context.input._outputVariable as string) || "output";

    if (!expression) {
      throw new Error("Transform node requires an expression");
    }

    try {
      const inputData = context.input[inputVariable] || context.input;
      const contextData = {
        data: inputData,
        input: context.input,
        vars: context.variables,
        ...context.variables,
      };

      const fn = new Function(...Object.keys(contextData), `return ${expression}`);
      const result = fn(...Object.values(contextData));

      return {
        output: {
          ...context.input,
          [outputVariable]: result,
        },
      };
    } catch (error) {
      throw new Error(`Transform failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
