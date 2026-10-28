import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { VimeoPlayer } from "@/components/VimeoPlayer";
import { colors, fonts, radii, spacing } from "@/constants/theme";

export type ResourceModalItem = {
  id: string;
  title: string;
  vimeoUrl: string;
};

export function ResourceModal({
  open,
  title,
  items,
  onClose,
}: {
  open: boolean;
  title: string;
  items: ResourceModalItem[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open, items]);

  const current = items[index];
  const hasMany = items.length > 1;

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker} numberOfLines={1}>
              {title}
            </Text>
            {hasMany ? (
              <Text style={styles.count}>
                Video {index + 1} of {items.length}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={onClose}
            style={styles.close}
            hitSlop={12}
            accessibilityLabel="Close video"
          >
            <Ionicons name="close" size={24} color={colors.headerInk} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {!items.length ? (
            <Text style={styles.empty}>Nothing to show yet.</Text>
          ) : current ? (
            <View style={styles.card}>
              <Text style={styles.itemTitle}>{current.title}</Text>
              <VimeoPlayer
                url={current.vimeoUrl}
                title={current.title}
                active={open}
              />
              <Text style={styles.hint}>
                Use the player controls for pause, volume, and full screen.
              </Text>

              {hasMany ? (
                <View style={styles.nav}>
                  <Pressable
                    onPress={() => setIndex((i) => Math.max(0, i - 1))}
                    disabled={index === 0}
                    style={({ pressed }) => [
                      styles.navBtn,
                      index === 0 && styles.navBtnOff,
                      pressed && index > 0 && { opacity: 0.88 },
                    ]}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={18}
                      color={index === 0 ? "#9AA8BD" : colors.headerInk}
                    />
                    <Text
                      style={[
                        styles.navText,
                        index === 0 && { color: "#9AA8BD" },
                      ]}
                    >
                      Previous
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      setIndex((i) => Math.min(items.length - 1, i + 1))
                    }
                    disabled={index >= items.length - 1}
                    style={({ pressed }) => [
                      styles.navBtn,
                      index >= items.length - 1 && styles.navBtnOff,
                      pressed && index < items.length - 1 && { opacity: 0.88 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.navText,
                        index >= items.length - 1 && { color: "#9AA8BD" },
                      ]}
                    >
                      Next
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={
                        index >= items.length - 1 ? "#9AA8BD" : colors.headerInk
                      }
                    />
                  </Pressable>
                </View>
              ) : null}
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.done,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3FBFE",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 12,
  },
  kicker: {
    color: colors.headerInk,
    fontFamily: fonts.extrabold,
    fontSize: 20,
  },
  count: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.card,
    padding: spacing.sm + 2,
    gap: 8,
  },
  itemTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 16,
    lineHeight: 21,
  },
  hint: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4,
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#E7F2FB",
  },
  navBtnOff: {
    backgroundColor: "#EEF2F7",
  },
  navText: {
    color: colors.headerInk,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: 4,
  },
  done: {
    backgroundColor: colors.banner,
    borderRadius: 999,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: {
    color: "#fff",
    fontFamily: fonts.extrabold,
    fontSize: 17,
  },
  empty: {
    color: colors.muted,
    textAlign: "center",
    marginTop: spacing.xl,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
});
