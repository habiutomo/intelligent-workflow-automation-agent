import { Router, Request, Response } from "express";
import { asyncHandler, NotFoundError, ValidationError } from "../middleware/error-handler";
import { WorkflowEngine } from "../../engine/workflow-engine";
import { Workflow } from "../../types";

const router = Router();

// In-memory store
const workflows = new Map<string, any>();
const runs = new Map<string, any>();

// We'll inject the engine and stores via middleware
export function executionRoutes(engine: WorkflowEngine): Router {
  // Execute workflow
  router.post(
    "/workflows/:id/execute",
    asyncHandler(async (req: Request, res: Response) => {
      const workflow = workflows.get(req.params.id);
      if (!workflow) {
        throw new NotFoundError("Workflow");
      }

      if (workflow.status === "archived") {
        throw new ValidationError("Cannot execute archived workflow");
      }

      const input = req.body.input || {};
      const run = await engine.executeWorkflow(workflow, input);
      
      runs.set(run.id, run);

      res.status(202).json({
        success: true,
        data: run,
        message: "Workflow execution started",
      });
    })
  );

  // Get run status
  router.get(
    "/runs/:runId",
    asyncHandler(async (req: Request, res: Response) => {
      const run = runs.get(req.params.runId);
      if (!run) {
        throw new NotFoundError("Run");
      }
      res.json({ success: true, data: run });
    })
  );

  // List runs for a workflow
  router.get(
    "/workflows/:id/runs",
    asyncHandler(async (req: Request, res: Response) => {
      const workflowRuns = Array.from(runs.values()).filter(
        (r: any) => r.workflowId === req.params.id
      );

      const { status, page = "1", limit = "20" } = req.query;
      let items = workflowRuns;

      if (status) {
        items = items.filter((r: any) => r.status === status);
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const start = (pageNum - 1) * limitNum;
      const paginated = items.slice(start, start + limitNum);

      res.json({
        success: true,
        data: paginated,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: items.length,
          totalPages: Math.ceil(items.length / limitNum),
        },
      });
    })
  );

  // Cancel run
  router.post(
    "/runs/:runId/cancel",
    asyncHandler(async (req: Request, res: Response) => {
      const cancelled = await engine.cancelRun(req.params.runId);
      if (!cancelled) {
        throw new NotFoundError("Run or already completed");
      }
      res.json({ success: true, message: "Run cancelled" });
    })
  );

  // List running workflows
  router.get(
    "/runs/active",
    asyncHandler(async (_req: Request, res: Response) => {
      const running = engine.getRunning();
      res.json({ success: true, data: running });
    })
  );

  return router;
}

// Export stores for external use
export function setWorkflowStore(store: Map<string, any>) {
  workflows.clear();
  store.forEach((v, k) => workflows.set(k, v));
}

export function setRunsStore(store: Map<string, any>) {
  runs.clear();
  store.forEach((v, k) => runs.set(k, v));
}
