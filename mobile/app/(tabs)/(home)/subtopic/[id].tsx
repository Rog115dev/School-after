import { useCallback, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api, trackEvent } from "@/lib/api";
import { useSession } from "@/context/SessionContext";
import {
  getFavourites,
  saveFavourites,
  type Favourite,
} from "@/lib/storage";
import { AppChrome, LeafTile, PillBanner } from "@/components/AppChrome";
import { Loading } from "@/components/ui";
import { ResourceModal } from "@/components/ResourceModal";
import { Toast } from "@/components/Toast";
import { colors, spacing } from "@/constants/theme";

type SubtopicDetail = {
  id: string;
  title: string;
  description: string;
  question: { id: string; title: string };
  explanationVideos: Array<{ id: string; title: string; vimeoUrl: string }>;
  scenarioVideos: Array<{ id: string; title: string; vimeoUrl: string }>;
  parentChallenges: Array<{ id: string; title: string; vimeoUrl: string }>;
  links: Array<{ id: string; title: string; url: string }>;
  pdfs: Array<{ id: string; title: string; url: string }>;
  mythFactSets: Array<{ id: string; title: string; items: unknown[] }>;
};

type ModalState =
  | { open: false }
  | {
      open: true;
      title: string;
      items: Array<{ id: string; title: string; vimeoUrl: string }>;
    };

export default function SubtopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<SubtopicDetail | null>(null);
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [toast, setToast] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      setLoading(true);
      Promise.all([
        api<SubtopicDetail>(`/api/content/public/subtopics/${id}`),
        getFavourites(),
      ])
        .then(([detail, favs]) => {
          setData(detail);
          setFavourites(favs);
        })
        .finally(() => setLoading(false));
    }, [id])
  );

  if (loading || !data) return <Loading />;

  const subtopic = data;
  const saved = favourites.some((f) => f.id === subtopic.id);
  const explanation = subtopic.explanationVideos;
  const challenge = subtopic.parentChallenges;
  const mythSet = subtopic.mythFactSets[0];

  async function toggleFavourite() {
    const next = saved
      ? favourites.filter((f) => f.id !== subtopic.id)
      : [
          ...favourites,
          {
            id: subtopic.id,
            title: subtopic.title,
            kind: "subtopic" as const,
            subtitle: subtopic.question.title,
          },
        ];
    setFavourites(next);
    await saveFavourites(next);
    setToast(saved ? "Removed from favourites" : "Saved to favourites");
  }

  function openVideos(
    title: string,
    items: Array<{ id: string; title: string; vimeoUrl: string }>
  ) {
    if (!items.length) return;
    items.forEach((v) =>
      trackEvent("video_play", session?.schoolId, {
        videoId: v.id,
        title: v.title,
        subtopicId: subtopic.id,
      })
    );
    setModal({ open: true, title, items });
  }

  return (
    <AppChrome
      showBack
      contentStyle={{ paddingTop: spacing.md }}
      starred={saved}
      onToggleStar={toggleFavourite}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        <PillBanner label={subtopic.title} />

        <View style={styles.tiles}>
          <LeafTile
            delay={40}
            color="#7EB6E8"
            label="Intro video"
            icon={<Ionicons name="play-circle" size={42} color="#fff" />}
            onPress={() => openVideos("Intro video", explanation)}
            empty={!explanation.length}
          />
          <LeafTile
            delay={80}
            color="#8EABD9"
            label="Myth vs fact"
            icon={
              <View style={styles.mythBadge}>
                <Text style={styles.mythBadgeText}>
                  MYTHS{"\n"}VS{"\n"}FACTS
                </Text>
              </View>
            }
            onPress={() => {
              if (mythSet) {
                router.push(`/myth/${mythSet.id}?subtopicId=${subtopic.id}`);
              }
            }}
            empty={!mythSet}
          />
          <LeafTile
            delay={120}
            color="#8FC9A8"
            label="Try this at home"
            icon={<Ionicons name="home" size={34} color="#fff" />}
            onPress={() => openVideos("Try this at home", challenge)}
            empty={!challenge.length}
          />
        </View>

        <Pressable
          disabled={!subtopic.pdfs.length}
          onPress={() => {
            const pdf = subtopic.pdfs[0];
            if (pdf) Linking.openURL(pdf.url);
          }}
          style={({ pressed }) => [
            styles.action,
            !subtopic.pdfs.length && styles.actionOff,
            pressed && subtopic.pdfs.length ? { opacity: 0.9 } : null,
          ]}
        >
          <Ionicons name="download-outline" size={22} color="#fff" />
          <Text style={styles.actionText}>Download</Text>
        </Pressable>
        <Pressable
          disabled={!subtopic.links.length}
          onPress={() => {
            const link = subtopic.links[0];
            if (link) Linking.openURL(link.url);
          }}
          style={({ pressed }) => [
            styles.action,
            styles.actionLink,
            !subtopic.links.length && styles.actionOff,
            pressed && subtopic.links.length ? { opacity: 0.9 } : null,
          ]}
        >
          <Ionicons name="link-outline" size={22} color={colors.headerInk} />
          <Text style={[styles.actionText, { color: colors.headerInk }]}>Link</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(tabs)/tips")}
          style={({ pressed }) => [styles.prompt, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.promptText}>
            Go to the Top tips section now to find out when you can use these strategies
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.headerInk} />
        </Pressable>
      </ScrollView>

      <ResourceModal
        open={modal.open}
        title={modal.open ? modal.title : ""}
        items={modal.open ? modal.items : []}
        onClose={() => setModal({ open: false })}
      />
      <Toast
        message={toast}
        visible={!!toast}
        onHide={() => setToast("")}
      />
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
    gap: 12,
  },
  tiles: {
    flexGrow: 1,
    gap: 12,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.banner,
  },
  actionLink: {
    backgroundColor: "#E7F2FB",
  },
  actionOff: {
    opacity: 0.4,
  },
  actionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  prompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF6E8",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  promptText: {
    flex: 1,
    color: colors.headerInk,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  mythBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  mythBadgeText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 11,
  },
});
