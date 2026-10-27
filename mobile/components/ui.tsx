import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { colors, radii, spacing } from "@/constants/theme";

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Card({
  children,
  onPress,
  accent,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  accent?: string;
}) {
  const content = (
    <View
      style={[
        styles.card,
        accent ? { borderLeftColor: accent, borderLeftWidth: 5 } : null,
      ]}
    >
      {children}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.buttonSecondary,
        variant === "danger" && styles.buttonDanger,
        (pressed || disabled) && { opacity: 0.7 },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant !== "primary" && { color: colors.brandDark },
          variant === "danger" && { color: colors.danger },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.loading}>
      <View style={styles.loadingCard}>
        <ActivityIndicator color={colors.brand} size="large" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return <Text style={styles.empty}>{text}</Text>;
}

export function ListRow({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.listRow, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.listIcon}>
        <Text style={styles.listIconText}>{icon}</Text>
      </View>
      <Text style={styles.listLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.sky,
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  button: {
    backgroundColor: colors.banner,
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: colors.cloud,
  },
  buttonDanger: {
    backgroundColor: "#FDE8E6",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.sky,
    padding: spacing.lg,
  },
  loadingCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 36,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: colors.muted,
    fontWeight: "700",
  },
  empty: {
    color: colors.muted,
    textAlign: "center",
    marginTop: spacing.xl,
    fontWeight: "600",
    lineHeight: 22,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  listIconText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  listLabel: {
    flex: 1,
    color: colors.ink,
    fontWeight: "700",
    fontSize: 15,
  },
});
