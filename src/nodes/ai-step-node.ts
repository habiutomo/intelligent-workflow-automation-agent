import { NodeExecutor, NodeExecutionContext, NodeExecutionResult, AiStepConfig } from "../types";

export class AiStepNodeExecutor implements NodeExecutor {
  type = "aiStep" as const;

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const config = context.input._config as AiStepConfig || context.input as unknown as AiStepConfig;
    
    if (!config || !config.prompt) {
      throw new Error("AI Step node requires a prompt configuration");
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required for AI steps");
    }

    const model = config.model || process.env.OPENAI_MODEL || "gpt-4o";
    const temperature = config.temperature ?? 0.7;
    const maxTokens = config.maxTokens ?? 2000;

    // Build the prompt with context data
    const promptWithData = this.interpolatePrompt(config.prompt, context.input, context.variables);
    const systemPrompt = config.systemPrompt
      ? this.interpolatePrompt(config.systemPrompt, context.input, context.variables)
      : "You are a helpful AI assistant in a workflow automation system.";

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: promptWithData },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
      }

      const data = await response.json() as {
        choices: Array<{ message: { content: string } }>;
        usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      };

      const aiResponse = data.choices[0]?.message?.content || "";
      const outputVariable = config.outputVariable || "aiResult";

      context.logger.info(`AI step completed. Tokens used: ${data.usage?.total_tokens || "unknown"}`);

      return {
        output: {
          ...context.input,
          [outputVariable]: aiResponse,
          _aiUsage: data.usage,
          _aiModel: model,
          _completedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(`AI step failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private interpolatePrompt(
    template: string,
    data: Record<string, unknown>,
    variables: Record<string, unknown>
  ): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const parts = path.split(".");
      let value: unknown = { ...data, ...variables };
      for (const part of parts) {
        if (value && typeof value === "object") {
          value = (value as Record<string, unknown>)[part];
        } else {
          return match;
        }
      }
      return typeof value === "string" ? value : JSON.stringify(value);
    });
  }
}
