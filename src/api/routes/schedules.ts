import { Router, Request, Response } from "express";
import { asyncHandler, NotFoundError, ValidationError } from "../middleware/error-handler";
import { Scheduler } from "../../scheduler/scheduler";
import cron from "node-cron";

const router = Router();

export function scheduleRoutes(scheduler: Scheduler, workflows: Map<string, any>): Router {
  // List all schedules
  router.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) => {
      const schedules = scheduler.getSchedules();
      res.json({ success: true, data: schedules });
    })
  );

  // Create schedule
  router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const { workflowId, cron: cronExpression, timezone = "UTC", enabled = true } = req.body;

      if (!workflowId) {
        throw new ValidationError("workflowId is required");
      }

      if (!cronExpression) {
        throw new ValidationError("cron expression is required");
      }

      if (!cron.validate(cronExpression)) {
        throw new ValidationError("Invalid cron expression");
      }

      if (!workflows.has(workflowId)) {
        throw new NotFoundError("Workflow");
      }

      const id = `sch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const schedule = await scheduler.addSchedule(id, workflowId, cronExpression, timezone, enabled);

      res.status(201).json({ success: true, data: schedule });
    })
  );

  // Delete schedule
  router.delete(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const removed = await scheduler.removeSchedule(req.params.id);
      if (!removed) {
        throw new NotFoundError("Schedule");
      }
      res.json({ success: true, message: "Schedule removed" });
    })
  );

  // Enable schedule
  router.post(
    "/:id/enable",
    asyncHandler(async (req: Request, res: Response) => {
      const enabled = scheduler.enableSchedule(req.params.id);
      if (!enabled) {
        throw new NotFoundError("Schedule or already enabled");
      }
      res.json({ success: true, message: "Schedule enabled" });
    })
  );

  // Disable schedule
  router.post(
    "/:id/disable",
    asyncHandler(async (req: Request, res: Response) => {
      const disabled = scheduler.disableSchedule(req.params.id);
      if (!disabled) {
        throw new NotFoundError("Schedule or already disabled");
      }
      res.json({ success: true, message: "Schedule disabled" });
    })
  );

  // Get schedules for a workflow
  router.get(
    "/workflow/:workflowId",
    asyncHandler(async (req: Request, res: Response) => {
      const schedules = scheduler.getSchedulesForWorkflow(req.params.workflowId);
      res.json({ success: true, data: schedules });
    })
  );

  return router;
}
