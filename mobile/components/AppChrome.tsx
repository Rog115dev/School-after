import { ReactNode, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BrandMark } from "@/components/BrandMark";
import { MenuDrawer } from "@/components/MenuDrawer";
import { appName, colors, fonts, radii, spacing } from "@/constants/theme";

export function AppChrome({
  children,
  showBack = false,
  contentStyle,
  starred,
  onToggleStar,
}: {
  children: ReactNode;
  showBack?: boolean;
  contentStyle?: ViewStyle;
  starred?: boolean;
  onToggleStar?: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const starScale = useSharedValue(1);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.sky}>
        <View style={[styles.cloud, styles.cloud1]} />
        <View style={[styles.cloud, styles.cloud2]} />
        <View style={[styles.cloud, styles.cloud3]} />

        <View style={styles.header}>
          <Pressable
            style={styles.menuBtn}
            onPress={() => setMenuOpen(true)}
            hitSlop={12}
            accessibilityLabel="Open menu"
          >
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </Pressable>

          <Text style={styles.title} numberOfLines={2}>
            {appName}
          </Text>

          <View style={styles.logoWrap}>
            <BrandMark size={42} />
          </View>
        </View>

        <View style={styles.starRow}>
          {showBack ? (
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.push("/(tabs)"))}
              style={styles.backChip}
              hitSlop={10}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={18} color={colors.headerInk} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          ) : (
            <View />
          )}

          <Pressable
            onPress={() => {
              if (!onToggleStar) return;
              starScale.value = withSpring(1.35, {}, () => {
                starScale.value = withSpring(1);
              });
              onToggleStar();
            }}
            disabled={!onToggleStar}
            hitSlop={12}
            accessibilityLabel={starred ? "Remove favourite" : "Add favourite"}
          >
            <Animated.Text
              style={[
                styles.star,
                starStyle,
                { color: starred ? colors.star : "#F7E08A" },
              ]}
            >
              {starred ? "★" : "☆"}
            </Animated.Text>
          </Pressable>
        </View>

        <View style={[styles.sheet, contentStyle]}>{children}</View>
      </View>

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

export function PillBanner({ label }: { label: string }) {
  return (
    <Animated.View entering={FadeInDown.duration(280)} style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </Animated.View>
  );
}

export function LeafTile({
  label,
  onPress,
  icon,
  empty,
  color,
  delay = 0,
}: {
  label?: string;
  onPress?: () => void;
  icon?: ReactNode;
  empty?: boolean;
  color?: string;
  delay?: number;
}) {
  const body = (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(320)}
      style={[
        styles.leaf,
        color ? { backgroundColor: color } : null,
        empty && styles.leafEmpty,
      ]}
    >
      {icon}
      {label ? <Text style={styles.leafText}>{label}</Text> : null}
    </Animated.View>
  );
  const frame = { flex: 1, minHeight: 128, alignSelf: "stretch" as const };
  if (!onPress || empty) {
    return <View style={frame}>{body}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        frame,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.sky,
  },
  sky: {
    flex: 1,
    backgroundColor: colors.sky,
    overflow: "hidden",
  },
  cloud: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 999,
  },
  cloud1: { width: 120, height: 36, top: 18, left: -20 },
  cloud2: { width: 90, height: 28, top: 48, right: 40 },
  cloud3: { width: 70, height: 22, top: 28, right: -10 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: 8,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.headerInk,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  menuLine: {
    width: 16,
    height: 2,
    backgroundColor: colors.headerInk,
    borderRadius: 2,
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: colors.headerInk,
    fontFamily: fonts.extrabold,
    fontSize: 17,
    lineHeight: 21,
  },
  logoWrap: {
    width: 46,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  starRow: {
    paddingHorizontal: spacing.lg,
    marginTop: 4,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 2,
  },
  backText: {
    color: colors.headerInk,
    fontWeight: "700",
    fontSize: 15,
  },
  star: {
    fontSize: 26,
    textShadowColor: "rgba(0,0,0,0.08)",
    textShadowRadius: 2,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  pill: {
    alignSelf: "center",
    backgroundColor: colors.banner,
    borderRadius: radii.pill,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginBottom: spacing.lg,
    minWidth: "78%",
    alignItems: "center",
  },
  pillText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 20,
    textAlign: "center",
  },
  leaf: {
    flex: 1,
    width: "100%",
    minHeight: 128,
    backgroundColor: colors.tile,
    borderRadius: 22,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
  },
  leafEmpty: {
    opacity: 0.35,
  },
  leafText: {
    color: colors.tileText,
    fontWeight: "800",
    fontSize: 17,
    textAlign: "center",
    lineHeight: 22,
  },
});
