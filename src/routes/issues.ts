import { Router } from "express";
import { PrismaClient } from "../generated/prisma";
import { auth, AuthRequest } from "../middleware/auth";
import upload from "../middleware/upload"; // <-- Multer + Cloudinary storage

const prisma = new PrismaClient();
const router = Router();

//  Get all issues (public)
router.get("/", async (_, res) => {
  try {
    const issues = await prisma.issue.findMany({
      include: { reporter: true, department: true, comments: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(issues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});

//  Create issue (user only) with optional image
router.post(
  "/",
  auth("USER"),
  upload.single("image"), // <-- handles "image" file from form-data
  async (req: AuthRequest, res) => {
    try {
      const { title, description, latitude, longitude, address } = req.body;
      const reporterId = req.user!.id;

      let imageUrl: string | undefined;
      let imageId: string | undefined;

      if (req.file && (req.file as any).path) {
        imageUrl = (req.file as any).path; // Cloudinary URL
        imageId = (req.file as any).filename; // Cloudinary publicId
      }

      const issue = await prisma.issue.create({
        data: {
          title,
          description,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          address,
          reporterId,
          imageUrl,
          imageId,
        },
      });

      res.status(201).json(issue);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create issue" });
    }
  }
);

// Update issue (admin only)
router.patch("/:id", auth("ADMIN"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await prisma.issue.update({
      where: { id },
      data: updates,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update issue" });
  }
});

export default router;
