import { Modal, Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { VimeoPlayer } from "@/components/VimeoPlayer";
import { colors, radii, spacing } from "@/constants/theme";

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
  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Pressable onPress={onClose} style={styles.close} hitSlop={12}>
            <Ionicons name="close" size={26} color={colors.headerInk} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          {items.map((item) => (
            <View key={item.id} style={styles.block}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <VimeoPlayer url={item.vimeoUrl} />
            </View>
          ))}
          {!items.length ? (
            <Text style={styles.empty}>Nothing to show yet.</Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.sky,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 12,
  },
  title: {
    flex: 1,
    fontWeight: "800",
    fontSize: 20,
    color: colors.headerInk,
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    backgroundColor: "#fff",
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    padding: spacing.lg,
    flexGrow: 1,
  },
  block: {
    marginBottom: spacing.lg,
  },
  itemTitle: {
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 8,
    fontSize: 16,
  },
  empty: {
    color: colors.muted,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
