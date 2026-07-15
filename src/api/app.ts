import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { getConfig } from "../config";
import { getLogger } from "../logger";
import { WorkflowEngine } from "../engine/workflow-engine";
import { EventBus } from "../events/event-bus";
import { Scheduler } from "../scheduler/scheduler";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import {
  StartNodeExecutor,
  EndNodeExecutor,
  HttpRequestNodeExecutor,
  ConditionNodeExecutor,
  TransformNodeExecutor,
  DelayNodeExecutor,
  CodeNodeExecutor,
  AiStepNodeExecutor,
  ParallelNodeExecutor,
  MergeNodeExecutor,
  EmailNodeExecutor,
  NotificationNodeExecutor,
  WebhookNodeExecutor,
} from "../nodes";
import healthRoutes from "./routes/health";
import workflowRoutes from "./routes/workflows";
import { executionRoutes, setWorkflowStore } from "./routes/execution";
import { webhookRoutes } from "./routes/webhooks";
import { scheduleRoutes } from "./routes/schedules";
import { eventRoutes } from "./routes/events";

// In-memory stores
const workflows = new Map<string, any>();

export function createApp() {
  const config = getConfig();
  const logger = getLogger();
  const app = express();
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Initialize core services
  const eventBus = new EventBus();
  const engine = new WorkflowEngine(eventBus, logger);

  // Register all node executors
  engine.registerExecutor(new StartNodeExecutor());
  engine.registerExecutor(new EndNodeExecutor());
  engine.registerExecutor(new HttpRequestNodeExecutor());
  engine.registerExecutor(new ConditionNodeExecutor());
  engine.registerExecutor(new TransformNodeExecutor());
  engine.registerExecutor(new DelayNodeExecutor());
  engine.registerExecutor(new CodeNodeExecutor());
  engine.registerExecutor(new AiStepNodeExecutor());
  engine.registerExecutor(new ParallelNodeExecutor());
  engine.registerExecutor(new MergeNodeExecutor());
  engine.registerExecutor(new EmailNodeExecutor());
  engine.registerExecutor(new NotificationNodeExecutor());
  engine.registerExecutor(new WebhookNodeExecutor());

  // Initialize scheduler
  const scheduler = new Scheduler(
    engine,
    eventBus,
    async (id: string) => workflows.get(id) || null
  );

  // Set workflow store for execution routes
  setWorkflowStore(workflows);

  // Set up WebSocket event forwarding
  eventBus.on("workflow:started", (data) => io.emit("workflow:started", data));
  eventBus.on("workflow:completed", (data) => io.emit("workflow:completed", data));
  eventBus.on("workflow:failed", (data) => io.emit("workflow:failed", data));
  eventBus.on("node:started", (data) => io.emit("node:started", data));
  eventBus.on("node:completed", (data) => io.emit("node:completed", data));
  eventBus.on("node:failed", (data) => io.emit("node:failed", data));

  // Middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(authMiddleware);

  // Routes
  app.use("/api/health", healthRoutes);
  app.use("/api/workflows", workflowRoutes);
  app.use("/api", executionRoutes(engine));
  app.use("/api/webhooks", webhookRoutes(engine, workflows));
  app.use("/api/schedules", scheduleRoutes(scheduler, workflows));
  app.use("/api/events", eventRoutes(eventBus));

  // WebSocket connection
  io.on("connection", (socket) => {
    logger.info(`Client connected: ${socket.id}`);
    
    socket.on("subscribe:workflow", (workflowId: string) => {
      socket.join(`workflow:${workflowId}`);
      logger.debug(`Socket ${socket.id} subscribed to workflow ${workflowId}`);
    });

    socket.on("unsubscribe:workflow", (workflowId: string) => {
      socket.leave(`workflow:${workflowId}`);
    });

    socket.on("disconnect", () => {
      logger.debug(`Client disconnected: ${socket.id}`);
    });
  });

  // Error handler
  app.use(errorHandler);

  return {
    app,
    httpServer,
    io,
    engine,
    eventBus,
    scheduler,
    workflows,
  };
}
