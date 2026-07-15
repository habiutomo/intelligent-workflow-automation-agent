import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error-handler";
import { v4 as uuidv4 } from "uuid";

// In-memory store (replace with database in production)
const workflows = new Map<string, any>();
const runs = new Map<string, any>();

export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: "1.0.0",
    },
  });
});

export const getMetrics = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalWorkflows: workflows.size,
      totalRuns: runs.size,
      activeRuns: Array.from(runs.values()).filter((r: any) => r.status === "running").length,
      completedRuns: Array.from(runs.values()).filter((r: any) => r.status === "completed").length,
      failedRuns: Array.from(runs.values()).filter((r: any) => r.status === "failed").length,
    },
  });
});
