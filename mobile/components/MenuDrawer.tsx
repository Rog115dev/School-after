import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/context/SessionContext";
import { colors, radii, spacing } from "@/constants/theme";

const links = [
  { label: "Home", href: "/(tabs)", icon: "home-outline" as const },
  { label: "Stories", href: "/(tabs)/stories", icon: "book-outline" as const },
  { label: "Favourites", href: "/(tabs)/favourites", icon: "star-outline" as const },
  { label: "Top tips", href: "/(tabs)/tips", icon: "bulb-outline" as const },
  { label: "Notes", href: "/(tabs)/notes", icon: "create-outline" as const },
  { label: "School access", href: "/(tabs)/more", icon: "school-outline" as const },
];

export function MenuDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { session, signOut } = useSession();

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.heading}>Menu</Text>
          {session ? (
            <Text style={styles.school}>{session.schoolName}</Text>
          ) : null}

          {links.map((item) => (
            <Pressable
              key={item.href}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => {
                onClose();
                router.push(item.href as never);
              }}
            >
              <Ionicons name={item.icon} size={20} color={colors.headerInk} />
              <Text style={styles.rowText}>{item.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}

          {session ? (
            <Pressable
              style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.8 }]}
              onPress={async () => {
                onClose();
                await signOut();
                router.replace("/");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={styles.signOutText}>Clear school access</Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(27, 58, 107, 0.35)",
    justifyContent: "flex-start",
  },
  panel: {
    marginTop: 72,
    marginLeft: spacing.md,
    width: 280,
    backgroundColor: "#fff",
    borderRadius: radii.card,
    padding: spacing.md,
    shadowColor: "#1B3A6B",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heading: {
    fontWeight: "800",
    fontSize: 22,
    color: colors.headerInk,
    marginBottom: 4,
  },
  school: {
    color: colors.muted,
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowPressed: {
    backgroundColor: colors.cloud,
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  rowText: {
    flex: 1,
    color: colors.ink,
    fontWeight: "700",
    fontSize: 17,
  },
  chevron: {
    color: colors.muted,
    fontSize: 22,
  },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: spacing.md,
    paddingVertical: 10,
  },
  signOutText: {
    color: colors.danger,
    fontWeight: "700",
  },
});
