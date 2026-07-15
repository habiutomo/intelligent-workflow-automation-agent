import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().default("dev-secret-change-in-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o"),
  WEBHOOK_BASE_URL: z.string().default("http://localhost:3000/api/webhooks/invoke"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  DATABASE_URL: z.string().default("file:./dev.db"),
});

export type EnvConfig = z.infer<typeof envSchema>;

let _config: EnvConfig | null = null;

export function loadConfig(): EnvConfig {
  if (_config) return _config;
  
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment configuration:");
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  _config = result.data;
  return _config;
}

export function getConfig(): EnvConfig {
  if (!_config) return loadConfig();
  return _config;
}
