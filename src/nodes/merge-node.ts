import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "../types";

export class MergeNodeExecutor implements NodeExecutor {
  type = "merge" as const;

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const mode = (context.input._mergeMode as string) || "concat"; // concat, combine, reduce
    const results = (context.input._parallelResults as Record<string, unknown>[]) || [];

    let merged: unknown;
    switch (mode) {
      case "concat":
        merged = results.map((r) => r._result || r);
        break;
      case "combine":
        merged = Object.assign({}, ...results.map((r) => r._result || r));
        break;
      case "reduce":
        merged = results.reduce((acc, r) => {
          const result = r._result || r;
          if (typeof acc === "object" && typeof result === "object") {
            return { ...acc, ...result };
          }
          return result;
        }, {});
        break;
      default:
        merged = results;
    }

    return {
      output: {
        ...context.input,
        _mergedResult: merged,
        _mergedAt: new Date().toISOString(),
      },
    };
  }
}
