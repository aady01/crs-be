import { Router } from "express";
import { PrismaClient } from "../generated/prisma";
import { auth } from "../middleware/auth";

const primsa = new PrismaClient();
const router = Router();

router.get("/", async (_, res) => {
  const deps = await primsa.department.findMany();
  res.json(deps);
});

router.post("/", auth("ADMIN"), async (req, res) => {
  const { name } = req.body;
  const dep = await primsa.department.create({ data: { name } });
  res.json(dep);
});

export default router;
