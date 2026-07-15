import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "../types";
import { v4 as uuidv4 } from "uuid";

export class ParallelNodeExecutor implements NodeExecutor {
  type = "parallel" as const;

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const branches = (context.input._branches as number) || 2;
    
    const branchPromises: Promise<Record<string, unknown>>[] = [];
    for (let i = 0; i < branches; i++) {
      branchPromises.push(
        Promise.resolve({
          _branchId: uuidv4(),
          _branchIndex: i,
          _input: context.input,
        })
      );
    }

    const results = await Promise.all(branchPromises);

    return {
      output: {
        ...context.input,
        _parallelResults: results,
        _completedBranches: results.length,
      },
    };
  }
}
