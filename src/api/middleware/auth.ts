import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getConfig } from "../../config";
import { UnauthorizedError } from "./error-handler";

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Allow public routes
    if (isPublicRoute(req.path)) {
      return next();
    }
    throw new UnauthorizedError("No token provided");
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const config = getConfig();
    const decoded = jwt.verify(token, config.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    throw new UnauthorizedError("Invalid token");
  }
}

export function generateToken(payload: AuthPayload): string {
  const config = getConfig();
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

function isPublicRoute(path: string): boolean {
  const publicPaths = ["/api/health", "/api/auth/login", "/api/auth/register"];
  return publicPaths.some((p) => path.startsWith(p));
}
