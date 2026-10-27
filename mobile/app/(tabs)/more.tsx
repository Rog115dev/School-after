import { StyleSheet, Text, View } from "react-native";
import { useSession } from "@/context/SessionContext";
import { AppChrome, PillBanner } from "@/components/AppChrome";
import { Button } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

export default function MoreScreen() {
  const { session, signOut } = useSession();

  return (
    <AppChrome showBack contentStyle={{ paddingTop: spacing.md }}>
      <PillBanner label="School access" />
      <View style={styles.card}>
        <Text style={styles.label}>School</Text>
        <Text style={styles.value}>{session?.schoolName}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{session?.email}</Text>
        <Text style={styles.label}>Code</Text>
        <Text style={styles.value}>{session?.schoolCode}</Text>
        <Text style={styles.label}>Expires</Text>
        <Text style={styles.value}>
          {session?.expiresAt
            ? new Date(session.expiresAt).toLocaleDateString()
            : "—"}
        </Text>
      </View>
      <Button
        label="Clear school access on this phone"
        variant="danger"
        onPress={() => signOut()}
      />
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: 4,
  },
  label: {
    marginTop: 8,
    color: colors.muted,
    fontWeight: "700",
    fontSize: 14,
    textTransform: "uppercase",
  },
  value: {
    color: colors.ink,
    fontWeight: "700",
    fontSize: 18,
  },
});
