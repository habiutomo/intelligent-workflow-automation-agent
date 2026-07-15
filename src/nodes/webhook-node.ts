import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "../types";

export class WebhookNodeExecutor implements NodeExecutor {
  type = "webhook" as const;

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const url = (context.input._url as string) || "";
    const method = (context.input._method as string) || "POST";
    const headers = (context.input._headers as Record<string, string>) || {};
    const body = context.input._body || context.input;

    if (!url) {
      throw new Error("Webhook node requires a URL");
    }

    try {
      const response = await fetch(url, {
        method: method.toUpperCase(),
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: method.toUpperCase() !== "GET" ? JSON.stringify(body) : undefined,
      });

      let responseData: unknown;
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      return {
        output: {
          ...context.input,
          _webhookResponse: responseData,
          _webhookStatus: response.status,
          _webhookOk: response.ok,
        },
      };
    } catch (error) {
      throw new Error(`Webhook call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
