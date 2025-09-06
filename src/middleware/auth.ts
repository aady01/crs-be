// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "access_token";

export function auth(requiredRole?: "ADMIN" | "USER") {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      let token: string | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if (req.cookies && req.cookies[COOKIE_NAME]) {
        token = req.cookies[COOKIE_NAME];
      }

      if (!token) return res.status(401).json({ error: "No token" });

      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        role: string;
      };
      req.user = { id: decoded.id, role: decoded.role };

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (err) {
      console.error("auth middleware error:", err);
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}
