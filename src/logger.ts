import pino from "pino";
import { getConfig } from "./config";

let _logger: pino.Logger | null = null;

export function getLogger(): pino.Logger {
  if (_logger) return _logger;

  const config = getConfig();
  
  _logger = pino({
    level: config.LOG_LEVEL,
    transport:
      config.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          }
        : undefined,
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
  });

  return _logger;
}

export function createChildLogger(name: string): pino.Logger {
  return getLogger().child({ module: name });
}
