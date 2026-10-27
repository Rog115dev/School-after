import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { HomeHeader } from "@/components/HomeHeader";
import { SpeechBubbleCard } from "@/components/SpeechBubbleCard";
import { WelcomeCover } from "@/components/WelcomeCover";
import { Empty, Loading } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { subscribeHomePage } from "@/lib/homeTab";

type Question = {
  id: string;
  title: string;
  description: string;
  subtopics: Array<{ id: string; title: string; description?: string }>;
};

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => subscribeHomePage(() => setEntered(false)), []);

  const gap = 14;
  const horizontal = spacing.md;
  const cardWidth = Math.floor((width - horizontal * 2 - gap) / 2);

  const load = useCallback(async () => {
    const data = await api<Question[]>("/api/content/public/questions");
    setQuestions(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load()
        .catch(() => setQuestions([]))
        .finally(() => setLoading(false));
    }, [load])
  );

  if (!entered) return <WelcomeCover onContinue={() => setEntered(true)} />;
  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<HomeHeader questionCount={questions.length} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.accent}
            onRefresh={async () => {
              setRefreshing(true);
              await load().finally(() => setRefreshing(false));
            }}
          />
        }
        ListEmptyComponent={
          <Empty text="No published questions yet. Pull to refresh." />
        }
        renderItem={({ item, index }) => {
          const theme =
            colors.questionCards[index % colors.questionCards.length];
          return (
            <Animated.View
              entering={FadeInDown.delay(index * 40).duration(280)}
              style={{ width: cardWidth }}
            >
              <SpeechBubbleCard
                title={item.title}
                borderColor={theme.border}
                arrowColor={theme.arrow}
                onPress={() =>
                  router.push({
                    pathname: "/question/[id]",
                    params: {
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      subtopics: JSON.stringify(item.subtopics),
                    },
                  })
                }
              />
            </Animated.View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3FBFE",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    gap: 12,
    marginBottom: 2,
  },
});
