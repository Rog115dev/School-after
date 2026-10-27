import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "@/constants/theme";

type Props = {
  title: string;
  borderColor: string;
  arrowColor: string;
  onPress: () => void;
};

/** Wide speech bubble: sloping base, skewed tail, corner chevron. */
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
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={[styles.card, { borderColor }]}>
        <Text style={styles.title} numberOfLines={3}>
          {title}
        </Text>
        <View style={[styles.lip, { borderColor }]} />
        <View
          style={[styles.arrow, { backgroundColor: arrowColor }]}
          pointerEvents="none"
        >
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.tail} pointerEvents="none">
        <View style={[styles.tailOuter, { borderTopColor: borderColor }]} />
        <View style={styles.tailInner} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    paddingRight: 16,
    paddingBottom: 16,
    overflow: "visible",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 14,
    justifyContent: "center",
    overflow: "visible",
  },
  title: {
    color: "#1A4F9C",
    fontFamily: fonts.extrabold,
    fontSize: 15,
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  lip: {
    position: "absolute",
    left: -2.5,
    right: -2.5,
    bottom: -4,
    height: 12,
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    transform: [{ rotate: "-3.5deg" }],
  },
  tail: {
    position: "absolute",
    left: 14,
    bottom: 4,
    width: 30,
    height: 18,
    transform: [{ rotate: "-22deg" }],
  },
  tailOuter: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 18,
    borderTopWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  tailInner: {
    position: "absolute",
    left: 3,
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 13,
    borderTopWidth: 11,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFFFFF",
  },
  arrow: {
    position: "absolute",
    right: -16,
    bottom: -12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
});
