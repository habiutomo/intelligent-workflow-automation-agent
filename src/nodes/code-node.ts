import { NodeExecutor, NodeExecutionContext, NodeExecutionResult, CodeConfig } from "../types";
import { runInNewContext } from "vm";

export class CodeNodeExecutor implements NodeExecutor {
  type = "code" as const;

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const config = context.input._config as CodeConfig || context.input as unknown as CodeConfig;
    
    if (!config || !config.code) {
      throw new Error("Code node requires code to execute");
    }

    if (config.language === "python") {
      throw new Error("Python execution is not yet supported. Use JavaScript instead.");
    }

    const timeout = config.timeout || 10000;

    try {
      const sandbox = {
        input: context.input,
        vars: context.variables,
        data: context.input,
        console: {
          log: (...args: unknown[]) => context.logger.info(args.map(String).join(" ")),
          warn: (...args: unknown[]) => context.logger.warn(args.map(String).join(" ")),
          error: (...args: unknown[]) => context.logger.error(args.map(String).join(" ")),
        },
        JSON,
        Math,
        Date,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
      };

      const wrappedCode = `
        (async function() {
          ${config.code}
        })()
      `;

      const result = await Promise.race([
        runInNewContext(wrappedCode, sandbox, { timeout }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Code execution timed out after ${timeout}ms`)), timeout)
        ),
      ]);

      return {
        output: {
          ...context.input,
          _codeResult: result,
          _executedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(`Code execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
