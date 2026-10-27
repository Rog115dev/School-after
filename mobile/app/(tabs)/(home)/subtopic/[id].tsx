import { useCallback, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
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
import { ListRow, Loading } from "@/components/ui";
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
  const scenarios = subtopic.scenarioVideos;
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <PillBanner label={subtopic.title} />

        <View style={styles.grid}>
          <View style={styles.row}>
            <LeafTile
              delay={40}
              color="#7EB6E8"
              label="Watch this video"
              icon={<Ionicons name="play-circle" size={42} color="#fff" />}
              onPress={() => openVideos("Explanation", explanation)}
              empty={!explanation.length}
            />
            <LeafTile
              delay={80}
              color="#8EABD9"
              label="Play this game"
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
          </View>
          <View style={styles.row}>
            <LeafTile
              delay={120}
              color="#8FC9A8"
              label="Try this at home"
              icon={<Ionicons name="home" size={34} color="#fff" />}
              onPress={() => openVideos("Try this at home", challenge)}
              empty={!challenge.length}
            />
            <LeafTile
              delay={160}
              color="#E0A0C8"
              label="Stories"
              icon={<Ionicons name="book" size={34} color="#fff" />}
              onPress={() => openVideos("Stories", scenarios)}
              empty={!scenarios.length}
            />
          </View>
        </View>

        <View style={{ marginTop: spacing.md }}>
          {subtopic.pdfs.map((pdf) => (
            <ListRow
              key={pdf.id}
              icon="↓"
              label={pdf.title || "Advice sheet to download"}
              onPress={() => Linking.openURL(pdf.url)}
            />
          ))}
          {subtopic.links.map((link) => (
            <ListRow
              key={link.id}
              icon="⛓"
              label={link.title || "Link to source"}
              onPress={() => Linking.openURL(link.url)}
            />
          ))}
        </View>
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
  grid: {
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 14,
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
    fontSize: 9,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 11,
  },
});
