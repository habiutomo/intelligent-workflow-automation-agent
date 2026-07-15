import { Router, Request, Response } from "express";
import { asyncHandler, NotFoundError, ValidationError } from "../middleware/error-handler";
import { WorkflowEngine } from "../../engine/workflow-engine";
import crypto from "crypto";

const router = Router();

// Webhook store
const webhookConfigs = new Map<string, {
  workflowId: string;
  secret?: string;
  method: string;
  headers?: Record<string, string>;
}>();

export function webhookRoutes(engine: WorkflowEngine, workflows: Map<string, any>): Router {
  // Invoke workflow via webhook
  router.post(
    "/invoke/:workflowId",
    asyncHandler(async (req: Request, res: Response) => {
      const workflow = workflows.get(req.params.workflowId);
      if (!workflow) {
        throw new NotFoundError("Workflow");
      }

      if (workflow.status !== "active") {
        throw new ValidationError("Workflow is not active");
      }

      const config = webhookConfigs.get(req.params.workflowId);
      
      // Verify webhook signature if secret is configured
      if (config?.secret) {
        const signature = req.headers["x-webhook-signature"] as string;
        if (!signature) {
          throw new ValidationError("Missing webhook signature");
        }

        const expectedSignature = crypto
          .createHmac("sha256", config.secret)
          .update(JSON.stringify(req.body))
          .digest("hex");

        if (signature !== expectedSignature) {
          throw new ValidationError("Invalid webhook signature");
        }
      }

      const input = {
        ...req.body,
        _webhook: {
          path: req.path,
          method: req.method,
          headers: req.headers,
          query: req.query,
          timestamp: new Date().toISOString(),
        },
      };

      const run = await engine.executeWorkflow(workflow, input);

      res.status(202).json({
        success: true,
        data: { runId: run.id, status: run.status },
      });
    })
  );

  // GET webhook trigger
  router.get(
    "/invoke/:workflowId",
    asyncHandler(async (req: Request, res: Response) => {
      const workflow = workflows.get(req.params.workflowId);
      if (!workflow) {
        throw new NotFoundError("Workflow");
      }

      if (workflow.status !== "active") {
        throw new ValidationError("Workflow is not active");
      }

      const input = {
        ...req.query,
        _webhook: {
          path: req.path,
          method: req.method,
          headers: req.headers,
          query: req.query,
          timestamp: new Date().toISOString(),
        },
      };

      const run = await engine.executeWorkflow(workflow, input);

      res.status(202).json({
        success: true,
        data: { runId: run.id, status: run.status },
      });
    })
  );

  // Register webhook config
  router.post(
    "/:workflowId/config",
    asyncHandler(async (req: Request, res: Response) => {
      if (!workflows.has(req.params.workflowId)) {
        throw new NotFoundError("Workflow");
      }

      const { secret, method = "POST", headers } = req.body;
      webhookConfigs.set(req.params.workflowId, {
        workflowId: req.params.workflowId,
        secret,
        method,
        headers,
      });

      const webhookUrl = `${process.env.WEBHOOK_BASE_URL || "http://localhost:3000/api/webhooks/invoke"}/${req.params.workflowId}`;

      res.json({
        success: true,
        data: {
          workflowId: req.params.workflowId,
          url: webhookUrl,
          method,
        },
      });
    })
  );

  return router;
}
