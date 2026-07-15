import { NodeExecutor, NodeExecutionContext, NodeExecutionResult, EmailConfig } from "../types";

export class EmailNodeExecutor implements NodeExecutor {
  type = "email" as const;

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const config = context.input._config as EmailConfig || context.input as unknown as EmailConfig;
    
    if (!config || !config.to || !config.subject || !config.body) {
      throw new Error("Email node requires 'to', 'subject', and 'body' configuration");
    }

    // In production, integrate with an email service (SendGrid, SES, etc.)
    // For now, we log the email details
    const recipients = Array.isArray(config.to) ? config.to : [config.to];
    
    context.logger.info(`[Email] To: ${recipients.join(", ")}`);
    context.logger.info(`[Email] Subject: ${config.subject}`);
    context.logger.info(`[Email] Body: ${config.body.substring(0, 100)}...`);

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      output: {
        ...context.input,
        _emailSent: true,
        _emailRecipients: recipients,
        _emailSubject: config.subject,
        _sentAt: new Date().toISOString(),
      },
    };
  }
}
