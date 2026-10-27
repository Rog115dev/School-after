import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api, trackEvent } from "@/lib/api";
import { useSession } from "@/context/SessionContext";
import {
  getFavourites,
  saveFavourites,
  type Favourite,
} from "@/lib/storage";
import { AppChrome, PillBanner } from "@/components/AppChrome";
import { Empty, Loading } from "@/components/ui";
import { ResourceModal } from "@/components/ResourceModal";
import { Toast } from "@/components/Toast";
import { colors, radii, spacing } from "@/constants/theme";

type Tip = {
  id: string;
  title: string;
  vimeoUrl: string;
};

export default function TipsScreen() {
  const { session } = useSession();
  const [tips, setTips] = useState<Tip[]>([]);
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Tip | null>(null);
  const [toast, setToast] = useState("");

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        api<Tip[]>("/api/content/public/top-tips"),
        getFavourites(),
      ])
        .then(([tipsData, favs]) => {
          setTips(tipsData);
          setFavourites(favs);
        })
        .finally(() => setLoading(false));
    }, [])
  );

  async function toggleFavourite(tip: Tip) {
    const exists = favourites.find((f) => f.id === tip.id);
    const next = exists
      ? favourites.filter((f) => f.id !== tip.id)
      : [
          ...favourites,
          {
            id: tip.id,
            title: tip.title,
            kind: "topTip" as const,
            subtitle: "Top Tip",
          },
        ];
    setFavourites(next);
    await saveFavourites(next);
    setToast(exists ? "Removed from favourites" : "Saved to favourites");
  }

  if (loading) return <Loading />;

  return (
    <AppChrome contentStyle={{ paddingTop: spacing.md }}>
      <PillBanner label="Top Tips" />
      <FlatList
        data={tips}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Empty text="No tips published yet." />}
        contentContainerStyle={{ paddingBottom: spacing.lg, gap: 12 }}
        renderItem={({ item, index }) => {
          const saved = favourites.some((f) => f.id === item.id);
          return (
            <Animated.View entering={FadeInDown.delay(index * 40).duration(280)}>
              <View style={styles.card}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cardMain,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={() => {
                    trackEvent("video_play", session?.schoolId, {
                      tipId: item.id,
                      title: item.title,
                    });
                    setActive(item);
                  }}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons name="bulb" size={26} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.meta}>Tap to watch</Text>
                  </View>
                </Pressable>
                <Pressable hitSlop={10} onPress={() => toggleFavourite(item)}>
                  <Text
                    style={[
                      styles.star,
                      { color: saved ? colors.star : "#D7DEE8" },
                    ]}
                  >
                    {saved ? "★" : "☆"}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          );
        }}
      />

      <ResourceModal
        open={!!active}
        title={active?.title || "Top Tip"}
        items={
          active
            ? [{ id: active.id, title: active.title, vimeoUrl: active.vimeoUrl }]
            : []
        }
        onClose={() => setActive(null)}
      />
      <Toast message={toast} visible={!!toast} onHide={() => setToast("")} />
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.cloud,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  cardMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F0B429",
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
  },
  star: {
    fontSize: 24,
  },
});
