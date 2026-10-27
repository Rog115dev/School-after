import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAdmin } from "../middleware/auth.js";

export const schoolsRouter = Router();

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

schoolsRouter.get("/", requireAdmin, async (_req, res) => {
  const schools = await prisma.school.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { accessLogs: true, events: true } },
    },
  });
  res.json(schools);
});

schoolsRouter.post("/", requireAdmin, async (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    expiresAt: z.string().datetime(),
    code: z.string().min(4).max(16).optional(),
    active: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  let code = (parsed.data.code || generateCode()).toUpperCase();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.school.findUnique({ where: { code } });
    if (!exists) break;
    code = generateCode();
  }

  const school = await prisma.school.create({
    data: {
      name: parsed.data.name,
      code,
      expiresAt: new Date(parsed.data.expiresAt),
      active: parsed.data.active ?? true,
    },
  });
  res.status(201).json(school);
});

schoolsRouter.put("/:id", requireAdmin, async (req, res) => {
  const schema = z.object({
    name: z.string().min(1).optional(),
    expiresAt: z.string().datetime().optional(),
    code: z.string().min(4).max(16).optional(),
    active: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const school = await prisma.school.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        code: parsed.data.code?.toUpperCase(),
        expiresAt: parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : undefined,
      },
    });
    res.json(school);
  } catch {
    res.status(404).json({ error: "School not found or code already used" });
  }
});

schoolsRouter.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.school.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "School not found" });
  }
});
