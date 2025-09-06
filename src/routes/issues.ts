// src/routes/issues.ts
import { Router } from "express";
import { PrismaClient } from "../generated/prisma";
import { auth, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

// Public list
router.get("/", async (_, res) => {
  const issues = await prisma.issue.findMany({
    include: { reporter: true, department: true, comments: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(issues);
});

// Create issue (must be authenticated user)
router.post("/", auth("USER"), async (req: AuthRequest, res) => {
  const { title, description, latitude, longitude, address } = req.body;
  const reporterId = req.user!.id;
  const issue = await prisma.issue.create({
    data: { title, description, latitude, longitude, address, reporterId },
  });
  res.status(201).json(issue);
});

// Update issue (admin only)
router.patch("/:id", auth("ADMIN"), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = await prisma.issue.update({ where: { id }, data: updates });
  res.json(updated);
});

export default router;
