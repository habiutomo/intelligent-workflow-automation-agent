import cron from "node-cron";
import { WorkflowEngine } from "../engine/workflow-engine";
import { Workflow } from "../types";
import { EventBus } from "../events/event-bus";

export interface ScheduleEntry {
  id: string;
  workflowId: string;
  cron: string;
  timezone: string;
  enabled: boolean;
  task?: cron.ScheduledTask;
  lastRun?: Date;
  nextRun?: Date;
}

export class Scheduler {
  private schedules = new Map<string, ScheduleEntry>();
  private engine: WorkflowEngine;
  private eventBus: EventBus;
  private workflowProvider: (id: string) => Promise<Workflow | null>;

  constructor(
    engine: WorkflowEngine,
    eventBus: EventBus,
    workflowProvider: (id: string) => Promise<Workflow | null>
  ) {
    this.engine = engine;
    this.eventBus = eventBus;
    this.workflowProvider = workflowProvider;
  }

  async addSchedule(
    id: string,
    workflowId: string,
    cronExpression: string,
    timezone: string = "UTC",
    enabled: boolean = true
  ): Promise<ScheduleEntry> {
    if (!cron.validate(cronExpression)) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }

    const entry: ScheduleEntry = {
      id,
      workflowId,
      cron: cronExpression,
      timezone,
      enabled,
    };

    if (enabled) {
      entry.task = cron.schedule(cronExpression, async () => {
        await this.executeScheduledWorkflow(entry);
      }, { timezone });
    }

    this.schedules.set(id, entry);
    this.eventBus.emit("schedule:created", { scheduleId: id, workflowId });
    
    return entry;
  }

  async removeSchedule(id: string): Promise<boolean> {
    const entry = this.schedules.get(id);
    if (entry) {
      if (entry.task) {
        entry.task.stop();
      }
      this.schedules.delete(id);
      this.eventBus.emit("schedule:removed", { scheduleId: id });
      return true;
    }
    return false;
  }

  enableSchedule(id: string): boolean {
    const entry = this.schedules.get(id);
    if (entry && !entry.enabled) {
      entry.task = cron.schedule(entry.cron, async () => {
        await this.executeScheduledWorkflow(entry);
      }, { timezone: entry.timezone });
      entry.enabled = true;
      this.eventBus.emit("schedule:enabled", { scheduleId: id });
      return true;
    }
    return false;
  }

  disableSchedule(id: string): boolean {
    const entry = this.schedules.get(id);
    if (entry && entry.enabled) {
      if (entry.task) {
        entry.task.stop();
        entry.task = undefined;
      }
      entry.enabled = false;
      this.eventBus.emit("schedule:disabled", { scheduleId: id });
      return true;
    }
    return false;
  }

  private async executeScheduledWorkflow(entry: ScheduleEntry): Promise<void> {
    try {
      const workflow = await this.workflowProvider(entry.workflowId);
      if (!workflow) {
        console.error(`Workflow ${entry.workflowId} not found for schedule ${entry.id}`);
        return;
      }

      entry.lastRun = new Date();
      this.eventBus.emit("schedule:executing", {
        scheduleId: entry.id,
        workflowId: entry.workflowId,
      });

      await this.engine.executeWorkflow(workflow, { _triggered: "schedule", _scheduleId: entry.id });
    } catch (error) {
      console.error(`Scheduled workflow execution failed: ${error}`);
      this.eventBus.emit("schedule:failed", {
        scheduleId: entry.id,
        workflowId: entry.workflowId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  getSchedules(): ScheduleEntry[] {
    return Array.from(this.schedules.values());
  }

  getSchedule(id: string): ScheduleEntry | undefined {
    return this.schedules.get(id);
  }

  getSchedulesForWorkflow(workflowId: string): ScheduleEntry[] {
    return Array.from(this.schedules.values()).filter((s) => s.workflowId === workflowId);
  }
}
