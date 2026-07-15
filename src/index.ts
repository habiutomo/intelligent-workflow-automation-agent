import { loadConfig } from "./config";
import { getLogger } from "./logger";
import { createApp } from "./api/app";

async function main() {
  // Load configuration
  const config = loadConfig();
  const logger = getLogger();

  logger.info("Starting Intelligent Workflow Automation Agent...");
  logger.info(`Environment: ${config.NODE_ENV}`);
  logger.info(`Port: ${config.PORT}`);

  // Create application
  const { httpServer, engine, eventBus, scheduler, workflows } = createApp();

  // Register default event handlers
  eventBus.on("workflow:started", (data) => {
    logger.info(`Workflow started: ${data.workflowId}, Run: ${data.runId}`);
  });
  eventBus.on("workflow:completed", (data) => {
    logger.info(`Workflow completed: ${data.workflowId}, Run: ${data.runId}, Duration: ${data.duration}ms`);
  });
  eventBus.on("workflow:failed", (data) => {
    logger.error(`Workflow failed: ${data.workflowId}, Run: ${data.runId}, Error: ${data.error}`);
  });

  // Seed demo data
  seedDemoData(workflows);

  // Start server
  httpServer.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
    logger.info(`API available at http://localhost:${config.PORT}/api`);
    logger.info(`Health check at http://localhost:${config.PORT}/api/health`);
    logger.info(`WebSocket available at ws://localhost:${config.PORT}`);
    logger.info("");
    logger.info("Available endpoints:");
    logger.info("  GET    /api/health          - Health check");
    logger.info("  GET    /api/workflows        - List workflows");
    logger.info("  POST   /api/workflows        - Create workflow");
    logger.info("  GET    /api/workflows/:id    - Get workflow");
    logger.info("  PUT    /api/workflows/:id    - Update workflow");
    logger.info("  DELETE /api/workflows/:id    - Delete workflow");
    logger.info("  POST   /api/workflows/:id/publish - Publish workflow");
    logger.info("  POST   /api/workflows/:id/execute - Execute workflow");
    logger.info("  GET    /api/runs/:runId      - Get run status");
    logger.info("  POST   /api/runs/:runId/cancel - Cancel run");
    logger.info("  POST   /api/webhooks/invoke/:id - Trigger via webhook");
    logger.info("  GET    /api/schedules        - List schedules");
    logger.info("  POST   /api/schedules        - Create schedule");
    logger.info("  GET    /api/events           - Event history");
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    httpServer.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

function seedDemoData(workflows: Map<string, any>) {
  const now = new Date();

  // Demo workflow 1: Simple approval flow
  workflows.set("demo_approval", {
    id: "demo_approval",
    name: "Employee Onboarding Approval",
    description: "Automated employee onboarding with manager approval",
    status: "active",
    triggerType: "webhook",
    nodes: [
      { id: "start", type: "start", label: "New Request", position: { x: 50, y: 200 }, config: {} },
      { id: "validate", type: "condition", label: "Validate Data", position: { x: 250, y: 200 }, config: { expression: "data.name && data.email" } },
      { id: "send_email", type: "email", label: "Send Welcome Email", position: { x: 450, y: 100 }, config: { to: "{{data.email}}", subject: "Welcome!", body: "Welcome to the team!" } },
      { id: "notify", type: "notification", label: "Notify Manager", position: { x: 450, y: 300 }, config: { channel: "slack", message: "New employee: {{data.name}}", level: "info" } },
      { id: "end", type: "end", label: "Complete", position: { x: 650, y: 200 }, config: {} },
    ],
    edges: [
      { id: "e1", source: "start", target: "validate" },
      { id: "e2", source: "validate", target: "send_email", condition: "data._conditionResult === true" },
      { id: "e3", source: "validate", target: "end", condition: "data._conditionResult === false" },
      { id: "e4", source: "send_email", target: "notify" },
      { id: "e5", source: "notify", target: "end" },
    ],
    variables: { company: "Acme Corp" },
    version: 1,
    createdAt: now,
    updatedAt: now,
  });

  // Demo workflow 2: AI-powered data processing
  workflows.set("demo_ai_processing", {
    id: "demo_ai_processing",
    name: "AI Data Extraction Pipeline",
    description: "Extract and process data using AI",
    status: "active",
    triggerType: "manual",
    nodes: [
      { id: "start", type: "start", label: "Input Data", position: { x: 50, y: 200 }, config: {} },
      { id: "transform", type: "transform", label: "Pre-process", position: { x: 250, y: 200 }, config: { expression: "JSON.stringify(data)" } },
      { id: "ai_extract", type: "aiStep", label: "AI Extraction", position: { x: 450, y: 200 }, config: { prompt: "Extract key information from: {{data}}", model: "gpt-4o" } },
      { id: "validate", type: "code", label: "Validate Result", position: { x: 650, y: 200 }, config: { code: "return { valid: true, data: input.aiResult }" } },
      { id: "end", type: "end", label: "Done", position: { x: 850, y: 200 }, config: {} },
    ],
    edges: [
      { id: "e1", source: "start", target: "transform" },
      { id: "e2", source: "transform", target: "ai_extract" },
      { id: "e3", source: "ai_extract", target: "validate" },
      { id: "e4", source: "validate", target: "end" },
    ],
    variables: {},
    version: 1,
    createdAt: now,
    updatedAt: now,
  });

  // Demo workflow 3: Scheduled data sync
  workflows.set("demo_data_sync", {
    id: "demo_data_sync",
    name: "Daily Data Sync",
    description: "Sync data from external API daily",
    status: "active",
    triggerType: "schedule",
    triggerConfig: { cron: "0 2 * * *" },
    nodes: [
      { id: "start", type: "start", label: "Start Sync", position: { x: 50, y: 200 }, config: {} },
      { id: "fetch", type: "httpRequest", label: "Fetch Data", position: { x: 250, y: 200 }, config: { url: "https://api.example.com/data", method: "GET" } },
      { id: "check", type: "condition", label: "Has Data?", position: { x: 450, y: 200 }, config: { expression: "data.ok === true" } },
      { id: "process", type: "code", label: "Process Data", position: { x: 650, y: 100 }, config: { code: "return { records: (input.data || []).length }" } },
      { id: "notify_ok", type: "notification", label: "Success", position: { x: 850, y: 100 }, config: { message: "Sync complete", level: "success" } },
      { id: "notify_fail", type: "notification", label: "Failed", position: { x: 850, y: 300 }, config: { message: "Sync failed", level: "error" } },
      { id: "end", type: "end", label: "End", position: { x: 1050, y: 200 }, config: {} },
    ],
    edges: [
      { id: "e1", source: "start", target: "fetch" },
      { id: "e2", source: "fetch", target: "check" },
      { id: "e3", source: "check", target: "process", condition: "data._conditionResult === true" },
      { id: "e4", source: "check", target: "notify_fail", condition: "data._conditionResult === false" },
      { id: "e5", source: "process", target: "notify_ok" },
      { id: "e6", source: "notify_ok", target: "end" },
      { id: "e7", source: "notify_fail", target: "end" },
    ],
    variables: { syncUrl: "https://api.example.com/data" },
    version: 1,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`Seeded ${workflows.size} demo workflows`);
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
