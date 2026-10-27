import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { asObjectId } from "../objectId.js";

export const analyticsRouter = Router();

analyticsRouter.post("/events", async (req, res) => {
  const schema = z.object({
    schoolId: z.string().optional(),
    eventType: z.string().min(1),
    payload: z.record(z.any()).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid event" });
  }

  try {
    const event = await prisma.analyticsEvent.create({
      data: {
        schoolId: asObjectId(parsed.data.schoolId),
        eventType: parsed.data.eventType,
        payload: JSON.stringify(parsed.data.payload || {}),
      },
    });
    res.status(201).json({ id: event.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not record event" });
  }
});

analyticsRouter.get("/usage", requireAdmin, async (_req, res) => {
  const schools = await prisma.school.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { accessLogs: true, events: true } },
    },
  });

  const unlocks = await prisma.analyticsEvent.groupBy({
    by: ["schoolId"],
    where: { eventType: "unlock" },
    _count: { _all: true },
  });

  const videoPlays = await prisma.analyticsEvent.groupBy({
    by: ["schoolId"],
    where: { eventType: "video_play" },
    _count: { _all: true },
  });

  const mythCompletes = await prisma.analyticsEvent.groupBy({
    by: ["schoolId"],
    where: { eventType: "myth_complete" },
    _count: { _all: true },
  });

  const uniqueEmails = await prisma.accessLog.groupBy({
    by: ["schoolId", "email"],
  });

  const uniqueBySchool = uniqueEmails.reduce<Record<string, number>>((acc, row) => {
    acc[row.schoolId] = (acc[row.schoolId] || 0) + 1;
    return acc;
  }, {});

  const unlockMap = Object.fromEntries(
    unlocks.map((u) => [u.schoolId || "", u._count._all])
  );
  const videoMap = Object.fromEntries(
    videoPlays.map((u) => [u.schoolId || "", u._count._all])
  );
  const mythMap = Object.fromEntries(
    mythCompletes.map((u) => [u.schoolId || "", u._count._all])
  );

  const recent = await prisma.analyticsEvent.findMany({
    take: 25,
    orderBy: { createdAt: "desc" },
    include: { school: { select: { name: true, code: true } } },
  });

  res.json({
    schools: schools.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      expiresAt: s.expiresAt,
      active: s.active,
      uniqueParents: uniqueBySchool[s.id] || 0,
      unlocks: unlockMap[s.id] || 0,
      videoPlays: videoMap[s.id] || 0,
      mythCompletes: mythMap[s.id] || 0,
      totalEvents: s._count.events,
      totalAccessLogs: s._count.accessLogs,
    })),
    recent: recent.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      schoolName: e.school?.name || "Unknown",
      schoolCode: e.school?.code || null,
      createdAt: e.createdAt,
      payload: JSON.parse(e.payload || "{}"),
    })),
  });
});
