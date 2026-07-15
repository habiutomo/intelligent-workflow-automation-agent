import { NodeExecutor, NodeExecutionContext, NodeExecutionResult, HttpRequestConfig } from "../types";

export class HttpRequestNodeExecutor implements NodeExecutor {
  type = "httpRequest" as const;

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const config = context.input._config as HttpRequestConfig || context.input as unknown as HttpRequestConfig;
    
    if (!config || !config.url) {
      throw new Error("HTTP Request node requires a URL configuration");
    }

    const { url, method = "GET", headers = {}, body, timeout = 30000, retries = 0 } = config;
    
    let lastError: Error | null = null;
    let attempt = 0;
    const maxAttempts = retries + 1;

    while (attempt < maxAttempts) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const fetchOptions: RequestInit = {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          signal: controller.signal,
        };

        if (body && method !== "GET") {
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        let responseData: unknown;
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        return {
          output: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            data: responseData,
            ok: response.ok,
          },
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;
        if (attempt < maxAttempts) {
          context.logger.warn(`HTTP request failed (attempt ${attempt}/${maxAttempts}), retrying...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error("HTTP request failed after all retries");
  }
}
