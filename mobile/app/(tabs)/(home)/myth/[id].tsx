import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api, trackEvent } from "@/lib/api";
import { useSession } from "@/context/SessionContext";
import { AppChrome, PillBanner } from "@/components/AppChrome";
import { Button, Loading } from "@/components/ui";
import { colors, fonts, spacing } from "@/constants/theme";

type MythItem = {
  id: string;
  statement: string;
  isMyth: boolean;
  explanation: string;
};

type SubtopicDetail = {
  id: string;
  mythFactSets: Array<{
    id: string;
    title: string;
    items: MythItem[];
  }>;
};

function shuffle<T>(list: T[]) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function MythGameScreen() {
  const { id, subtopicId } = useLocalSearchParams<{
    id: string;
    subtopicId: string;
  }>();
  const { session } = useSession();
  const [pool, setPool] = useState<MythItem[]>([]);
  const [round, setRound] = useState<MythItem[] | null>(null);
  const [playCount, setPlayCount] = useState(1);
  const [title, setTitle] = useState("Myth vs Fact");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [guessedMyth, setGuessedMyth] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subtopicId) return;
    setRound(null);
    setDone(false);
    api<SubtopicDetail>(`/api/content/public/subtopics/${subtopicId}`)
      .then((data) => {
        const statements = data.mythFactSets.flatMap((set) => set.items);
        const named =
          data.mythFactSets.find((set) => set.id === id) || data.mythFactSets[0];
        setPool(statements);
        setPlayCount(statements.length || 1);
        if (named) setTitle(named.title);
      })
      .finally(() => setLoading(false));
  }, [id, subtopicId]);

  const items = round ?? [];
  const current = items[index];
  const facts = useMemo(() => items.filter((item) => !item.isMyth), [items]);

  function startRound(count = playCount) {
    const size = Math.min(Math.max(count, 1), pool.length);
    setPlayCount(size);
    setRound(shuffle(pool).slice(0, size));
    setIndex(0);
    setScore(0);
    setFeedback(null);
    setGuessedMyth(null);
    setDone(false);
  }

  function answer(asMyth: boolean) {
    if (!current || feedback) return;
    const correct = asMyth === current.isMyth;
    if (correct) setScore((s) => s + 1);
    setGuessedMyth(asMyth);
    setFeedback(
      `${correct ? "Nice!" : "Not quite."} ${
        current.isMyth ? "This is a myth." : "This is a fact."
      }\n\n${current.explanation}`
    );
  }

  function next() {
    if (index >= items.length - 1) {
      setDone(true);
      trackEvent("myth_complete", session?.schoolId, {
        setId: id,
        score,
        total: items.length,
      });
      return;
    }
    setIndex((i) => i + 1);
    setFeedback(null);
    setGuessedMyth(null);
  }

  if (loading) return <Loading />;

  if (!pool.length) {
    return (
      <AppChrome showBack>
        <PillBanner label="Myth vs Fact" />
        <Text style={styles.muted}>No statements found for this game.</Text>
      </AppChrome>
    );
  }

  if (!round) {
    return (
      <AppChrome showBack contentStyle={{ paddingTop: spacing.md }}>
        <ScrollView style={styles.fill} contentContainerStyle={styles.setup} showsVerticalScrollIndicator={false}>
          <PillBanner label={title} />
          <Text style={styles.total}>{pool.length}</Text>
          <Text style={styles.muted}>
            {pool.length === 1
              ? "statement is saved for this topic."
              : "statements are saved for this topic."}
          </Text>
          <Text style={styles.prompt}>How many do you want to see?</Text>
          <View style={styles.stepper}>
            <Pressable
              accessibilityLabel="Show fewer statements"
              disabled={playCount <= 1}
              onPress={() => setPlayCount((count) => Math.max(1, count - 1))}
              style={[styles.step, playCount <= 1 && styles.stepOff]}
            >
              <Text style={styles.stepText}>−</Text>
            </Pressable>
            <Text style={styles.count}>{playCount}</Text>
            <Pressable
              accessibilityLabel="Show more statements"
              disabled={playCount >= pool.length}
              onPress={() => setPlayCount((count) => Math.min(pool.length, count + 1))}
              style={[styles.step, playCount >= pool.length && styles.stepOff]}
            >
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>
            {playCount === pool.length
              ? "All saved statements will be shown, in a random order."
              : `${playCount} ${playCount === 1 ? "statement" : "statements"} will be chosen at random from the ${pool.length} saved.`}
          </Text>
          <Button label="Start" onPress={() => startRound()} />
        </ScrollView>
      </AppChrome>
    );
  }

  if (done) {
    return (
      <AppChrome showBack contentStyle={{ paddingTop: spacing.md, paddingBottom: 0 }}>
        <ScrollView style={styles.fill} contentContainerStyle={styles.setup} showsVerticalScrollIndicator={false}>
          <PillBanner label={`Score ${score}/${items.length}`} />
          <Text style={styles.muted}>
            Great effort — here are the real facts from this round.
          </Text>
          {facts.map((fact) => (
            <View key={fact.id} style={styles.factCard}>
              <Text style={styles.factLabel}>FACT</Text>
              <Text style={styles.factText}>{fact.statement}</Text>
              <Text style={styles.factExplain}>{fact.explanation}</Text>
            </View>
          ))}
          {!facts.length ? (
            <Text style={styles.muted}>None of the statements in this round were facts.</Text>
          ) : null}
          <Button label="Play again" onPress={() => startRound()} />
        </ScrollView>
      </AppChrome>
    );
  }

  return (
    <AppChrome showBack contentStyle={{ paddingTop: spacing.md }}>
      <Text style={styles.progress}>
        {index + 1} / {items.length}
      </Text>
      <PillBanner label={title} />
      <Text style={styles.muted}>Is this a myth or a fact?</Text>

      <View style={styles.card}>
        <Text style={styles.statement}>{current.statement}</Text>
      </View>

      {!feedback ? (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Button label="⟵ Myth" variant="danger" onPress={() => answer(true)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Fact ⟶" onPress={() => answer(false)} />
          </View>
        </View>
      ) : (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>{feedback}</Text>
          <Text style={styles.guess}>
            You chose: {guessedMyth ? "Myth" : "Fact"}
          </Text>
          <Button
            label={index >= items.length - 1 ? "See score" : "Next"}
            onPress={next}
          />
        </View>
      )}
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  setup: {
    paddingBottom: spacing.xl,
  },
  progress: {
    color: colors.brand,
    fontFamily: fonts.extrabold,
    marginBottom: 4,
    textAlign: "center",
  },
  total: {
    color: colors.headerInk,
    fontFamily: fonts.extrabold,
    fontSize: 42,
    textAlign: "center",
    marginTop: 4,
  },
  prompt: {
    color: colors.headerInk,
    fontFamily: fonts.bold,
    fontSize: 18,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginBottom: spacing.md,
  },
  step: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.banner,
    alignItems: "center",
    justifyContent: "center",
  },
  stepOff: {
    opacity: 0.35,
  },
  stepText: {
    color: "#fff",
    fontFamily: fonts.extrabold,
    fontSize: 28,
    lineHeight: 32,
  },
  count: {
    minWidth: 48,
    textAlign: "center",
    color: colors.headerInk,
    fontFamily: fonts.extrabold,
    fontSize: 36,
  },
  hint: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  muted: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 21,
  },
  card: {
    backgroundColor: colors.cloud,
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    minHeight: 170,
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  statement: {
    fontSize: 23,
    fontWeight: "800",
    color: colors.ink,
    lineHeight: 30,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  feedback: {
    backgroundColor: "#E8F2FC",
    borderRadius: 18,
    padding: spacing.md,
    gap: 12,
  },
  feedbackText: {
    color: colors.ink,
    lineHeight: 22,
    fontSize: 17,
  },
  guess: {
    color: colors.muted,
    fontWeight: "600",
  },
  factCard: {
    backgroundColor: colors.cloud,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 5,
    borderLeftColor: colors.fact,
  },
  factLabel: {
    color: colors.fact,
    fontWeight: "800",
    marginBottom: 6,
  },
  factText: {
    fontWeight: "800",
    color: colors.ink,
    fontSize: 18,
  },
  factExplain: {
    color: colors.muted,
    marginTop: 6,
    lineHeight: 20,
  },
});
