import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { asObjectId } from "../objectId.js";

export const contentRouter = Router();

const subtopicInclude = {
  explanationVideos: { orderBy: { sortOrder: "asc" as const } },
  scenarioVideos: { orderBy: { sortOrder: "asc" as const } },
  mythFactSets: {
    include: { items: { orderBy: { sortOrder: "asc" as const } } },
  },
  parentChallenges: { orderBy: { sortOrder: "asc" as const } },
  links: { orderBy: { sortOrder: "asc" as const } },
  pdfs: { orderBy: { sortOrder: "asc" as const } },
};

/** Public: published content for the mobile app */
contentRouter.get("/public/questions", async (_req, res) => {
  const questions = await prisma.question.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      subtopics: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          sortOrder: true,
        },
      },
    },
  });
  res.json(questions);
});

contentRouter.get("/public/subtopics/:id", async (req, res) => {
  const subtopic = await prisma.subtopic.findFirst({
    where: { id: req.params.id, published: true, question: { published: true } },
    include: {
      ...subtopicInclude,
      question: { select: { id: true, title: true } },
    },
  });
  if (!subtopic) return res.status(404).json({ error: "Not found" });
  res.json(subtopic);
});

contentRouter.get("/public/top-tips", async (_req, res) => {
  const tips = await prisma.topTip.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  res.json(tips);
});

contentRouter.get("/public/stories", async (_req, res) => {
  const stories = await prisma.story.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  res.json(stories);
});

/** Admin: full content management */
contentRouter.get("/questions", requireAdmin, async (_req, res) => {
  const questions = await prisma.question.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      subtopics: {
        orderBy: { sortOrder: "asc" },
        include: subtopicInclude,
      },
    },
  });
  res.json(questions);
});

contentRouter.post("/questions", requireAdmin, async (req, res) => {
  const schema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    sortOrder: z.number().int().optional(),
    published: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const question = await prisma.question.create({ data: parsed.data });
  res.status(201).json(question);
});

contentRouter.put("/questions/:id", requireAdmin, async (req, res) => {
  const schema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    sortOrder: z.number().int().optional(),
    published: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(question);
  } catch {
    res.status(404).json({ error: "Question not found" });
  }
});

contentRouter.delete("/questions/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.question.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Question not found" });
  }
});

contentRouter.post("/subtopics", requireAdmin, async (req, res) => {
  const schema = z.object({
    questionId: z.string(),
    title: z.string().min(1),
    description: z.string().optional(),
    sortOrder: z.number().int().optional(),
    published: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const subtopic = await prisma.subtopic.create({ data: parsed.data });
  res.status(201).json(subtopic);
});

contentRouter.put("/subtopics/:id", requireAdmin, async (req, res) => {
  const schema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    sortOrder: z.number().int().optional(),
    published: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const subtopic = await prisma.subtopic.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(subtopic);
  } catch {
    res.status(404).json({ error: "Subtopic not found" });
  }
});

contentRouter.delete("/subtopics/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.subtopic.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Subtopic not found" });
  }
});

contentRouter.get("/subtopics/:id", requireAdmin, async (req, res) => {
  const subtopic = await prisma.subtopic.findUnique({
    where: { id: req.params.id },
    include: {
      ...subtopicInclude,
      question: { select: { id: true, title: true } },
    },
  });
  if (!subtopic) return res.status(404).json({ error: "Not found" });
  res.json(subtopic);
});

contentRouter.post("/explanation-videos", requireAdmin, async (req, res) => {
  const schema = z.object({
    subtopicId: z.string(),
    title: z.string().min(1),
    vimeoUrl: z.string().url(),
    sortOrder: z.number().int().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const item = await prisma.explanationVideo.create({ data: parsed.data });
  res.status(201).json(item);
});

contentRouter.delete("/explanation-videos/:id", requireAdmin, async (req, res) => {
  await prisma.explanationVideo.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

contentRouter.post("/scenario-videos", requireAdmin, async (req, res) => {
  const schema = z.object({
    subtopicId: z.string(),
    title: z.string().min(1),
    vimeoUrl: z.string().url(),
    sortOrder: z.number().int().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const item = await prisma.scenarioVideo.create({ data: parsed.data });
  res.status(201).json(item);
});

contentRouter.delete("/scenario-videos/:id", requireAdmin, async (req, res) => {
  await prisma.scenarioVideo.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

contentRouter.post("/parent-challenges", requireAdmin, async (req, res) => {
  const schema = z.object({
    subtopicId: z.string(),
    title: z.string().optional(),
    vimeoUrl: z.string().url(),
    sortOrder: z.number().int().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const item = await prisma.parentChallenge.create({ data: parsed.data });
  res.status(201).json(item);
});

contentRouter.delete("/parent-challenges/:id", requireAdmin, async (req, res) => {
  await prisma.parentChallenge.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

contentRouter.post("/links", requireAdmin, async (req, res) => {
  const schema = z.object({
    subtopicId: z.string(),
    title: z.string().min(1),
    url: z.string().url(),
    sortOrder: z.number().int().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const item = await prisma.resourceLink.create({ data: parsed.data });
  res.status(201).json(item);
});

contentRouter.delete("/links/:id", requireAdmin, async (req, res) => {
  await prisma.resourceLink.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

contentRouter.post("/pdfs", requireAdmin, async (req, res) => {
  const schema = z.object({
    subtopicId: z.string(),
    title: z.string().min(1),
    url: z.string().url(),
    sortOrder: z.number().int().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const item = await prisma.resourcePdf.create({ data: parsed.data });
  res.status(201).json(item);
});

contentRouter.delete("/pdfs/:id", requireAdmin, async (req, res) => {
  await prisma.resourcePdf.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

const mythItemSchema = z.object({
  statement: z.string().min(1),
  isMyth: z.boolean(),
  explanation: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

contentRouter.post("/myth-fact-sets", requireAdmin, async (req, res) => {
  const schema = z.object({
    subtopicId: z.string(),
    title: z.string().min(1).optional(),
    items: z.array(mythItemSchema).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Title and statements must be filled in" });
  if (!asObjectId(parsed.data.subtopicId)) {
    return res.status(400).json({ error: "Invalid subtopic" });
  }

  const items = parsed.data.items ?? [];
  try {
    const set = await prisma.mythFactSet.create({
      data: {
        subtopicId: parsed.data.subtopicId,
        title: parsed.data.title || "Myth vs Fact",
        ...(items.length
          ? {
              items: {
                create: items.map((item, index) => ({
                  statement: item.statement,
                  isMyth: item.isMyth,
                  explanation: item.explanation,
                  sortOrder: item.sortOrder ?? index,
                })),
              },
            }
          : {}),
      },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
    res.status(201).json(set);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Could not create the myth set" });
  }
});

contentRouter.patch("/myth-fact-sets/:id", requireAdmin, async (req, res) => {
  if (!asObjectId(req.params.id)) return res.status(400).json({ error: "Invalid set" });
  const schema = z.object({ title: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "A set title is required" });

  try {
    const set = await prisma.mythFactSet.update({
      where: { id: req.params.id },
      data: { title: parsed.data.title },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
    res.json(set);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Myth set not found" });
  }
});

contentRouter.delete("/myth-fact-sets/:id", requireAdmin, async (req, res) => {
  if (!asObjectId(req.params.id)) return res.status(400).json({ error: "Invalid set" });
  try {
    await prisma.mythFactItem.deleteMany({ where: { setId: req.params.id } });
    await prisma.mythFactSet.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Myth set not found" });
  }
});

contentRouter.post("/myth-fact-items", requireAdmin, async (req, res) => {
  const schema = mythItemSchema.extend({ setId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Statement, type, and explanation are required" });
  }
  if (!asObjectId(parsed.data.setId)) return res.status(400).json({ error: "Invalid set" });

  try {
    const count = await prisma.mythFactItem.count({ where: { setId: parsed.data.setId } });
    const item = await prisma.mythFactItem.create({
      data: {
        setId: parsed.data.setId,
        statement: parsed.data.statement,
        isMyth: parsed.data.isMyth,
        explanation: parsed.data.explanation,
        sortOrder: parsed.data.sortOrder ?? count,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Could not add the statement" });
  }
});

contentRouter.patch("/myth-fact-items/:id", requireAdmin, async (req, res) => {
  if (!asObjectId(req.params.id)) return res.status(400).json({ error: "Invalid statement" });
  const schema = z
    .object({
      statement: z.string().min(1).optional(),
      isMyth: z.boolean().optional(),
      explanation: z.string().min(1).optional(),
      sortOrder: z.number().int().optional(),
    })
    .refine((value) => Object.keys(value).length > 0);
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Statement and explanation cannot be empty" });
  }

  try {
    const item = await prisma.mythFactItem.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Statement not found" });
  }
});

contentRouter.delete("/myth-fact-items/:id", requireAdmin, async (req, res) => {
  if (!asObjectId(req.params.id)) return res.status(400).json({ error: "Invalid statement" });
  try {
    await prisma.mythFactItem.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Statement not found" });
  }
});

contentRouter.get("/top-tips", requireAdmin, async (_req, res) => {
  const tips = await prisma.topTip.findMany({ orderBy: { sortOrder: "asc" } });
  res.json(tips);
});

contentRouter.post("/top-tips", requireAdmin, async (req, res) => {
  const schema = z.object({
    title: z.string().min(1),
    vimeoUrl: z.string().url(),
    sortOrder: z.number().int().optional(),
    published: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const tip = await prisma.topTip.create({ data: parsed.data });
  res.status(201).json(tip);
});

contentRouter.put("/top-tips/:id", requireAdmin, async (req, res) => {
  const schema = z.object({
    title: z.string().min(1).optional(),
    vimeoUrl: z.string().url().optional(),
    sortOrder: z.number().int().optional(),
    published: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const tip = await prisma.topTip.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(tip);
  } catch {
    res.status(404).json({ error: "Top tip not found" });
  }
});

contentRouter.delete("/top-tips/:id", requireAdmin, async (req, res) => {
  await prisma.topTip.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

contentRouter.get("/stories", requireAdmin, async (_req, res) => {
  const stories = await prisma.story.findMany({ orderBy: { sortOrder: "asc" } });
  res.json(stories);
});

contentRouter.post("/stories", requireAdmin, async (req, res) => {
  const schema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    vimeoUrl: z.string().url(),
    sortOrder: z.number().int().optional(),
    published: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const story = await prisma.story.create({ data: parsed.data });
  res.status(201).json(story);
});

contentRouter.put("/stories/:id", requireAdmin, async (req, res) => {
  const schema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    vimeoUrl: z.string().url().optional(),
    sortOrder: z.number().int().optional(),
    published: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const story = await prisma.story.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(story);
  } catch {
    res.status(404).json({ error: "Story not found" });
  }
});

contentRouter.delete("/stories/:id", requireAdmin, async (req, res) => {
  await prisma.story.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
