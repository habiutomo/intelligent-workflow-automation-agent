import { NodeExecutor, NodeExecutionContext, NodeExecutionResult, NotificationConfig } from "../types";

export class NotificationNodeExecutor implements NodeExecutor {
  type = "notification" as const;

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const config = context.input._config as NotificationConfig || context.input as unknown as NotificationConfig;
    
    if (!config || !config.message) {
      throw new Error("Notification node requires a message");
    }

    const channel = config.channel || "default";
    const level = config.level || "info";

    // In production, integrate with notification services (Slack, Discord, Teams, etc.)
    context.logger.info(`[Notification][${level}][${channel}] ${config.message}`);

    return {
      output: {
        ...context.input,
        _notificationSent: true,
        _notificationChannel: channel,
        _notificationLevel: level,
        _sentAt: new Date().toISOString(),
      },
    };
  }
}
