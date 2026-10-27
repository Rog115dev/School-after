import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppChrome, PillBanner } from "@/components/AppChrome";
import { Empty } from "@/components/ui";
import { colors, fonts, spacing } from "@/constants/theme";

type Subtopic = { id: string; title: string; description?: string };

const accents = colors.questionCards.map((card) => card.border);

export default function QuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    title?: string;
    description?: string;
    subtopics?: string;
  }>();

  const subtopics: Subtopic[] = params.subtopics
    ? JSON.parse(params.subtopics)
    : [];

  return (
    <AppChrome showBack contentStyle={{ paddingTop: spacing.md, paddingBottom: 0 }}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PillBanner label={params.title || "Question"} />
        {!subtopics.length ? (
          <Empty text="No topics published for this question yet." />
        ) : (
          <View style={styles.list}>
            <Text style={styles.hint}>Choose the option that fits your child</Text>
            {subtopics.map((item, index) => {
              const accent = accents[index % accents.length];
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                  onPress={() => router.push(`/subtopic/${item.id}`)}
                  style={({ pressed }) => [
                    styles.card,
                    { borderColor: accent, opacity: pressed ? 0.92 : 1 },
                  ]}
                >
                  <View style={[styles.badge, { backgroundColor: accent }]}>
                    <Text style={styles.badgeText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={[styles.chevron, { backgroundColor: accent }]}>
                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  list: {
    gap: 12,
  },
  hint: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -8,
    marginBottom: 4,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 76,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderRadius: 18,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 12,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontFamily: fonts.extrabold,
    fontSize: 14,
  },
  cardTitle: {
    flex: 1,
    color: colors.headerInk,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 21,
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
