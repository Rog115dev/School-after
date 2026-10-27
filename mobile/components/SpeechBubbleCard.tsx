import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "@/constants/theme";

type Props = {
  title: string;
  borderColor: string;
  arrowColor: string;
  onPress: () => void;
};

/** White speech-bubble tile with coloured border + chevron, per home mockup. */
export function SpeechBubbleCard({
  title,
  borderColor,
  arrowColor,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.wrap,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <View style={[styles.card, { borderColor }]}>
        <Text style={styles.title} numberOfLines={4}>
          {title}
        </Text>
        <View style={[styles.arrow, { backgroundColor: arrowColor }]}>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </View>
      </View>
      {/* Tail at bottom-left */}
      <View style={[styles.tailOuter, { borderTopColor: borderColor }]} />
      <View style={styles.tailInner} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    paddingBottom: 10,
  },
  card: {
    minHeight: 108,
    backgroundColor: "#FFFFFF",
    borderWidth: 2.5,
    borderRadius: 26,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 40,
    justifyContent: "center",
  },
  title: {
    color: colors.headerInk,
    fontFamily: fonts.extrabold,
    fontSize: 15.5,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  arrow: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tailOuter: {
    position: "absolute",
    left: 16,
    bottom: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  tailInner: {
    position: "absolute",
    left: 18,
    bottom: 5,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFFFFF",
  },
});
