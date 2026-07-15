import { Router, Request, Response } from "express";
import { asyncHandler, NotFoundError } from "../middleware/error-handler";
import { EventBus } from "../../events/event-bus";

const router = Router();

export function eventRoutes(eventBus: EventBus): Router {
  // Get event history
  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const { event, limit = "50" } = req.query;
      const history = eventBus.getHistory(
        event as string | undefined,
        parseInt(limit as string, 10)
      );
      res.json({ success: true, data: history });
    })
  );

  // Get event listener counts
  router.get(
    "/listeners",
    asyncHandler(async (_req: Request, res: Response) => {
      const events = [
        "workflow:started",
        "workflow:completed",
        "workflow:failed",
        "workflow:cancelled",
        "workflow:ended",
        "node:started",
        "node:completed",
        "node:failed",
        "schedule:created",
        "schedule:removed",
        "schedule:enabled",
        "schedule:disabled",
        "schedule:executing",
        "schedule:failed",
      ];

      const data = events.map((e) => ({
        event: e,
        listeners: eventBus.listenerCount(e),
      }));

      res.json({ success: true, data });
    })
  );

  // Clear event history
  router.delete(
    "/history",
    asyncHandler(async (_req: Request, res: Response) => {
      eventBus.clearHistory();
      res.json({ success: true, message: "Event history cleared" });
    })
  );

  return router;
}
