import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  console.log(req.headers);
  
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    console.log((req as any).user);
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
};

