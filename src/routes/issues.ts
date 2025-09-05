import { Router } from "express";
import { PrismaClient } from "../generated/prisma";
import { auth, AuthRequest } from "../middleware/auth";

const primsa = new PrismaClient();
const router = Router();

// list items
router.get("/", async (_, res) => {
  const issues = await primsa.issue.findMany({
    include: { reporter: true, department: true },
  });
  res.json(issues);
});

//create issue
router.post("/", auth("USER"), async (req: AuthRequest, res) => {
  const { title, description, latitude, longitude, address } = req.body;
  const issue = await primsa.issue.create({
    data: {
      title,
      description,
      latitude,
      longitude,
      address,
      reporterId: req.user!.id,
    },
  });
  res.json(issue);
});

//update issue (admin only)
router.patch("/:id", auth("ADMIN"), async (req, res) => {
  const { id } = req.params;
  const { status, departmentId, assigneeId } = req.body;
  const updated = await primsa.issue.update({
    where: { id },
    data: { status, departmentId },
  });
  if (assigneeId) {
    await primsa.assignment.create({ data: { issueId: id, assigneeId } });
  }
  res.json(updated);
});

export default router;
