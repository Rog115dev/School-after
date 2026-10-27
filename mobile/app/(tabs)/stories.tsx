import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api, trackEvent } from "@/lib/api";
import { useSession } from "@/context/SessionContext";
import { AppChrome, PillBanner } from "@/components/AppChrome";
import { Empty, Loading } from "@/components/ui";
import { ResourceModal } from "@/components/ResourceModal";
import { colors, radii, spacing } from "@/constants/theme";

type Story = {
  id: string;
  title: string;
  description: string;
  vimeoUrl: string;
};

export default function StoriesScreen() {
  const { session } = useSession();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Story | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      api<Story[]>("/api/content/public/stories")
        .then(setStories)
        .catch(() => setStories([]))
        .finally(() => setLoading(false));
    }, [])
  );

  if (loading) return <Loading />;

  return (
    <AppChrome contentStyle={{ paddingTop: spacing.md }}>
      <PillBanner label="Stories" />
      <Text style={styles.intro}>
        Short story videos you can watch with your child. Managed by your school
        team in admin.
      </Text>
      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Empty text="No stories published yet." />}
        contentContainerStyle={{ paddingBottom: spacing.lg, gap: 12 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 40).duration(280)}>
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => {
                trackEvent("video_play", session?.schoolId, {
                  storyId: item.id,
                  title: item.title,
                });
                setActive(item);
              }}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="book" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.meta} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : (
                  <Text style={styles.meta}>Tap to watch</Text>
                )}
              </View>
              <Ionicons name="play-circle" size={28} color={colors.brand} />
            </Pressable>
          </Animated.View>
        )}
      />

      <ResourceModal
        open={!!active}
        title={active?.title || "Story"}
        items={
          active
            ? [
                {
                  id: active.id,
                  title: active.title,
                  vimeoUrl: active.vimeoUrl,
                },
              ]
            : []
        }
        onClose={() => setActive(null)}
      />
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  intro: {
    color: colors.muted,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 20,
    fontWeight: "600",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.cloud,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#E0A0C8",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  meta: {
    color: colors.muted,
    marginTop: 2,
    fontWeight: "600",
    fontSize: 12,
    lineHeight: 16,
  },
});
