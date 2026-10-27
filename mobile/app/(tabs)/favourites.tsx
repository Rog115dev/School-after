import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getFavourites, type Favourite } from "@/lib/storage";
import { AppChrome, PillBanner } from "@/components/AppChrome";
import { Empty } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

export default function FavouritesScreen() {
  const [items, setItems] = useState<Favourite[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      getFavourites().then(setItems);
    }, [])
  );

  return (
    <AppChrome contentStyle={{ paddingTop: spacing.md }}>
      <PillBanner label="Favourites" />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Empty text="Favourite a page or tip to see it here." />
        }
        renderItem={({ item, index }) => {
          const dot = colors.numberDots[index % colors.numberDots.length];
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
              onPress={() => {
                if (item.kind === "subtopic") {
                  router.push(`/subtopic/${item.id}`);
                }
              }}
            >
              <View style={[styles.dot, { backgroundColor: dot }]}>
                <Text style={styles.dotText}>★</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>{item.subtitle || item.kind}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        }}
      />
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: {
    color: "#fff",
    fontSize: 12,
  },
  title: {
    fontWeight: "800",
    fontSize: 16,
    color: colors.ink,
  },
  meta: {
    color: colors.muted,
    marginTop: 2,
    fontSize: 13,
  },
  chevron: {
    color: colors.muted,
    fontSize: 28,
    fontWeight: "300",
  },
});
