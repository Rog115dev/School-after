import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLIPS = [
  "https://vimeo.com/76979871",
  "https://vimeo.com/22439234",
  "https://vimeo.com/148751763",
  "https://vimeo.com/90333469",
  "https://vimeo.com/347119375",
];

const PDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

type Flags = {
  intro?: boolean;
  myth?: boolean;
  tryNext?: boolean;
  /** Number of download/link items. Taken from ticks on the Bojan sheet. */
  downloads?: number;
};

type Topic = { title: string } & Flags;

const QUESTIONS: { title: string; topics: Topic[] }[] = [
  {
    title: "When should I be worried about my child's communication?",
    topics: [
      { title: "My child is under 5 years", intro: true, myth: true, downloads: 1 },
      { title: "My child is 5 - 7 years", intro: true, myth: true, downloads: 1 },
      { title: "My child is 7 - 11 years", intro: true, myth: true, downloads: 1 },
      { title: "My child is over 11 years", intro: true, myth: true, downloads: 1 },
    ],
  },
  {
    title: "My child is getting frustrated, what can I do to help?",
    topics: [
      { title: "What are the links between behaviour and communication?", intro: true, myth: true },
      { title: "How does communication impact behaviour?", intro: true, myth: true },
      { title: "What strategies can support communication and behaviour?", intro: true, myth: true },
    ],
  },
  {
    title: "My child isn't talking yet, where do I start?",
    topics: [
      { title: "What are the ages and stages of general development?", intro: true, myth: true },
      { title: "How else is my child communicating?", intro: true, myth: true },
      { title: "What strategies can support early communication?", intro: true, myth: true, downloads: 1 },
      { title: "Why play is so important for language development", myth: true, tryNext: true },
    ],
  },
  {
    title: "Why can't my child tell me what's wrong or what's happened?",
    topics: [
      { title: "How does expressive language develop?", tryNext: true },
      { title: "How do I know if my child has difficulties with expressive language?", myth: true },
      {
        title: "How can I support early expressive language skills?",
        myth: true,
        downloads: 4,
      },
      { title: "Can I help my child to tell stories?", myth: true, downloads: 1 },
    ],
  },
  {
    title: "Will an iPad affect my child's communication?",
    topics: [{ title: "Will an iPad affect my child's communication?", myth: true }],
  },
  {
    title: "Is it ok for my child to have a dummy?",
    topics: [{ title: "Is it ok for my child to have a dummy?", intro: true, myth: true, downloads: 1 }],
  },
  {
    title: "I'm not sure if my child understands me, how can I tell?",
    topics: [
      { title: "How does understanding of language develop?", myth: true, tryNext: true },
      { title: "How do I know if my child has difficulties with understanding language?", intro: true, myth: true },
      {
        title: "How can I support early understanding of language skills?",
        myth: true,
        tryNext: true,
        downloads: 1,
      },
      { title: "How do I support my child to answer questions?", intro: true, myth: true, downloads: 1 },
      { title: "How do I support my child to follow instructions?", myth: true, downloads: 1 },
      { title: "How do I support my child to read between the lines?", myth: true, downloads: 1 },
    ],
  },
  {
    title: "My child is learning English as a second language, how can I help?",
    topics: [
      { title: "Which language should we speak at home?", myth: true },
      {
        title: "What is the best way to support my child learning English as an Additional Language?",
        myth: true,
      },
    ],
  },
  {
    title: "How can I support key areas of my child's language development?",
    topics: [
      { title: "Tell me more about the key areas of language development!", myth: true },
      { title: "What is vocabulary and why is it so important?", myth: true, downloads: 1 },
      { title: "How can I support my child to develop their vocabulary?", myth: true },
      { title: "What is grammar and why is it so important?", myth: true, downloads: 1 },
      { title: "How can I support my child to develop their grammar?", myth: true, downloads: 4 },
    ],
  },
  {
    title: "My child's speech is hard to understand, how can I help?",
    topics: [
      { title: "How do speech sounds develop?", tryNext: true },
      { title: "When should I ask for more help with my child's speech?", myth: true },
      { title: "What is phonological awareness and why is it so important?", myth: true, downloads: 1 },
      { title: "How can I support my child's speech sound development?", myth: true, downloads: 1 },
    ],
  },
  {
    title: "Why is reading so important?",
    topics: [{ title: "Why is reading so important?", intro: true, myth: true }],
  },
  {
    title: "My child has Selective Mutism, how can I help?",
    topics: [
      { title: "What is selective mutism?", myth: true, downloads: 1 },
      { title: "How can I support my child with selective mutism?", myth: true },
    ],
  },
  {
    title: "My child is stammering, how can I help?",
    topics: [
      { title: "What is Stammering?", myth: true, downloads: 1 },
      { title: "How can I support my child who is stammering?", myth: true },
    ],
  },
  {
    title: "My child has DLD, how can I help?",
    topics: [
      { title: "What is Developmental Language Disorder?", intro: true, myth: true, downloads: 1 },
      { title: "How can I support my child with Developmental Language Disorder?", intro: true, myth: true },
    ],
  },
  {
    title: "What is Speech and Language Therapy?",
    topics: [
      { title: "What does a Speech and Language therapist do?", intro: true, myth: true },
      { title: "What happens in a Speech and Language assessment or therapy session?", intro: true, myth: true },
      { title: "What are Speech, Language and Communication Needs (SLCN)?", myth: true, tryNext: true },
    ],
  },
];

function clip(index: number) {
  return CLIPS[index % CLIPS.length];
}

function mythItems(title: string) {
  const pairs: Array<[boolean, string, string]> = [
    [true, `Parents often hear that "${title}" is something they should wait out.`, "Waiting is not always the right plan. Looking more closely is reasonable."],
    [false, `Support for "${title}" can start with everyday moments at home.`, "Small changes in how adults talk and wait can help straight away."],
    [true, "A single checklist can tell you the whole story.", "Checklists are a starting point. A child's communication is broader than one score."],
    [false, "Understanding, interaction and confidence matter alongside the words.", "Therapists look at the whole picture, not one skill in isolation."],
    [true, "If a child is bright in other ways, communication will sort itself out.", "Strengths in other areas do not rule out a need for communication support."],
    [false, "Asking for advice early is a sensible step, not an overreaction.", "Early advice helps families know what to try next."],
  ];
  return pairs.map(([isMyth, statement, explanation], index) => ({
    sortOrder: index + 1,
    isMyth,
    statement,
    explanation,
  }));
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@outschool.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name: "Sandy Admin", role: "admin" },
    create: { email, passwordHash, name: "Sandy Admin", role: "admin" },
  });

  await prisma.adminUser.upsert({
    where: { email: "daniel@outschool.local" },
    update: {},
    create: {
      email: "daniel@outschool.local",
      passwordHash: await bcrypt.hash("admin123", 10),
      name: "Daniel",
      role: "admin",
    },
  });

  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);

  const school = await prisma.school.upsert({
    where: { code: "DEMO2026" },
    update: { name: "Demo Primary School", expiresAt: expiry, active: true },
    create: {
      name: "Demo Primary School",
      code: "DEMO2026",
      expiresAt: expiry,
      active: true,
    },
  });

  await prisma.mythFactItem.deleteMany();
  await prisma.mythFactSet.deleteMany();
  await prisma.explanationVideo.deleteMany();
  await prisma.scenarioVideo.deleteMany();
  await prisma.parentChallenge.deleteMany();
  await prisma.resourceLink.deleteMany();
  await prisma.resourcePdf.deleteMany();
  await prisma.subtopic.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topTip.deleteMany();
  await prisma.story.deleteMany();

  let clipIndex = 0;
  for (const [qIndex, question] of QUESTIONS.entries()) {
    const created = await prisma.question.create({
      data: {
        title: question.title,
        description: "Sample content from the Bojan sheet. Videos and files are placeholders.",
        sortOrder: qIndex + 1,
        published: true,
        subtopics: {
          create: question.topics.map((topic, index) => ({
            title: topic.title,
            description: "",
            sortOrder: index + 1,
            published: true,
          })),
        },
      },
      include: { subtopics: true },
    });

    for (const topic of question.topics) {
      const subtopic = created.subtopics.find((item) => item.title === topic.title);
      if (!subtopic) continue;

      if (topic.intro) {
        await prisma.explanationVideo.create({
          data: {
            subtopicId: subtopic.id,
            title: `Intro: ${topic.title}`,
            vimeoUrl: clip(clipIndex++),
            sortOrder: 1,
          },
        });
      }

      if (topic.myth) {
        await prisma.mythFactSet.create({
          data: {
            subtopicId: subtopic.id,
            title: "Myth vs Fact",
            items: { create: mythItems(topic.title) },
          },
        });
      }

      if (topic.tryNext) {
        await prisma.parentChallenge.create({
          data: {
            subtopicId: subtopic.id,
            title: "Try this next",
            vimeoUrl: clip(clipIndex++),
            sortOrder: 1,
          },
        });
      }

      const downloads = topic.downloads ?? 0;
      if (downloads > 0) {
        await prisma.resourcePdf.create({
          data: {
            subtopicId: subtopic.id,
            title: `${topic.title} — sample sheet`,
            url: PDF,
            sortOrder: 1,
          },
        });
      }
      for (let i = 1; i < downloads; i += 1) {
        await prisma.resourceLink.create({
          data: {
            subtopicId: subtopic.id,
            title: `Sample link ${i}`,
            url: "https://www.nhs.uk/conditions/speech-and-language-problems-in-children/",
            sortOrder: i,
          },
        });
      }
    }
  }

  await prisma.topTip.createMany({
    data: [
      { title: "Get face to face", vimeoUrl: CLIPS[0], sortOrder: 1, published: true },
      { title: "Follow their lead", vimeoUrl: CLIPS[1], sortOrder: 2, published: true },
      { title: "Add one word", vimeoUrl: CLIPS[2], sortOrder: 3, published: true },
    ],
  });

  await prisma.story.createMany({
    data: [
      {
        title: "Sam waits for a turn",
        description: "A short sample story about waiting and taking turns.",
        vimeoUrl: CLIPS[1],
        sortOrder: 1,
        published: true,
      },
      {
        title: "A story about asking for help",
        description: "A short sample story for the Stories library.",
        vimeoUrl: CLIPS[2],
        sortOrder: 2,
        published: true,
      },
    ],
  });

  const topicCount = QUESTIONS.reduce((sum, question) => sum + question.topics.length, 0);
  console.log(`Seeded ${QUESTIONS.length} questions and ${topicCount} subtopics from the Bojan sheet.`);
  console.log(`Admin: ${email} / ${password}`);
  console.log(`School code: ${school.code}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
