import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asObjectId } from "../objectId.js";

export const accessRouter = Router();

accessRouter.post("/unlock", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    code: z.string().min(4),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Email and school code are required" });
  }

  const school = await prisma.school.findUnique({
    where: { code: parsed.data.code.trim().toUpperCase() },
  });

  if (!school || !school.active) {
    return res.status(404).json({
      error: "School code not found",
      status: "invalid",
    });
  }

  if (school.expiresAt.getTime() < Date.now()) {
    return res.status(403).json({
      error: "This school's access has expired. Please contact your school.",
      status: "expired",
      schoolName: school.name,
    });
  }

  await prisma.accessLog.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      schoolId: school.id,
    },
  });

  await prisma.analyticsEvent.create({
    data: {
      schoolId: school.id,
      eventType: "unlock",
      payload: JSON.stringify({ email: parsed.data.email.toLowerCase() }),
    },
  });

  return res.json({
    status: "ok",
    school: {
      id: school.id,
      name: school.name,
      code: school.code,
      expiresAt: school.expiresAt,
    },
  });
});

accessRouter.post("/validate", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    schoolId: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  if (!asObjectId(parsed.data.schoolId)) {
    return res.json({ status: "invalid" });
  }

  const school = await prisma.school.findUnique({
    where: { id: parsed.data.schoolId },
  });

  if (!school || !school.active) {
    return res.json({ status: "invalid" });
  }
  if (school.expiresAt.getTime() < Date.now()) {
    return res.json({
      status: "expired",
      message: "This school's access has expired. Please contact your school.",
      schoolName: school.name,
    });
  }

  await prisma.accessLog.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      schoolId: school.id,
    },
  });

  return res.json({
    status: "ok",
    school: {
      id: school.id,
      name: school.name,
      code: school.code,
      expiresAt: school.expiresAt,
    },
  });
});
