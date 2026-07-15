import { Router, Request, Response } from "express";
import { asyncHandler, NotFoundError, ValidationError } from "../middleware/error-handler";
import { z } from "zod";

const router = Router();

// In-memory store (replace with database in production)
const workflows = new Map<string, any>();

const workflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "archived"]).optional(),
  triggerType: z.enum(["manual", "schedule", "webhook", "event"]).optional(),
  triggerConfig: z.record(z.unknown()).optional(),
  nodes: z.array(z.record(z.unknown())).optional(),
  edges: z.array(z.record(z.unknown())).optional(),
  variables: z.record(z.unknown()).optional(),
});

// List workflows
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { status, page = "1", limit = "20" } = req.query;
    let items = Array.from(workflows.values());

    if (status) {
      items = items.filter((w) => w.status === status);
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

// Get workflow by ID
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const workflow = workflows.get(req.params.id);
    if (!workflow) {
      throw new NotFoundError("Workflow");
    }
    res.json({ success: true, data: workflow });
  })
);

// Create workflow
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = workflowSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map((e) => e.message).join(", "));
    }

    const now = new Date();
    const workflow = {
      id: req.body.id || `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...validation.data,
      status: validation.data.status || "draft",
      triggerType: validation.data.triggerType || "manual",
      nodes: validation.data.nodes || [],
      edges: validation.data.edges || [],
      variables: validation.data.variables || {},
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    workflows.set(workflow.id, workflow);
    res.status(201).json({ success: true, data: workflow });
  })
);

// Update workflow
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const existing = workflows.get(req.params.id);
    if (!existing) {
      throw new NotFoundError("Workflow");
    }

    const validation = workflowSchema.partial().safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map((e) => e.message).join(", "));
    }

    const updated = {
      ...existing,
      ...validation.data,
      version: existing.version + 1,
      updatedAt: new Date(),
    };

    workflows.set(req.params.id, updated);
    res.json({ success: true, data: updated });
  })
);

// Delete workflow
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const workflow = workflows.get(req.params.id);
    if (!workflow) {
      throw new NotFoundError("Workflow");
    }
    workflows.delete(req.params.id);
    res.json({ success: true, message: "Workflow deleted" });
  })
);

// Publish workflow (set to active)
router.post(
  "/:id/publish",
  asyncHandler(async (req: Request, res: Response) => {
    const workflow = workflows.get(req.params.id);
    if (!workflow) {
      throw new NotFoundError("Workflow");
    }

    workflow.status = "active";
    workflow.updatedAt = new Date();
    workflows.set(req.params.id, workflow);

    res.json({ success: true, data: workflow });
  })
);

export default router;
