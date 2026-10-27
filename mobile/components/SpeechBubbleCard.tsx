import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { fonts } from "@/constants/theme";

type Props = {
  title: string;
  borderColor: string;
  arrowColor: string;
  onPress: () => void;
};

const WHITE = "#fafdfe";

/** Styles follow the shared speech-bubble HTML stylesheet. */
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
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.speechBubble}>
        <View style={styles.bubbleShape} pointerEvents="none">
          <View style={styles.bottomClip}>
            <View style={[styles.bubbleBottom, { borderColor }]} />
          </View>
          <View style={[styles.bubbleTop, { borderColor }]} />
          <Svg width={26} height={18} style={styles.tailOutline}>
            <Polygon points="3.12,0 26,0 0,18" fill={borderColor} />
          </Svg>
          <Svg width={22} height={16} style={styles.tailFill}>
            <Polygon points="2.64,0 22,0 0,16" fill={WHITE} />
          </Svg>
        </View>

        <View style={styles.bubbleText}>
          <Text style={styles.bubbleTextLabel} numberOfLines={3}>
            {title}
          </Text>
        </View>
      </View>

      <View style={[styles.arrow, { backgroundColor: arrowColor }]} pointerEvents="none">
        <View style={styles.arrowChevron} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    position: "relative",
    width: "100%",
    height: 116,
    padding: 10,
    borderWidth: 5,
    borderColor: "#eaf7fb",
    borderRadius: 22,
    backgroundColor: WHITE,
  },
  speechBubble: {
    position: "relative",
    width: "100%",
    height: 76,
  },
  bubbleShape: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  bubbleTop: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: 44,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 28,
    backgroundColor: WHITE,
  },
  /* clip-path: inset(40% 0 0 0) */
  bottomClip: {
    position: "absolute",
    top: "40%",
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },
  bubbleBottom: {
    position: "absolute",
    top: "-66.7%",
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 2,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 38,
    borderBottomLeftRadius: 23,
    backgroundColor: WHITE,
    transform: [{ skewY: "-2deg" }],
    transformOrigin: "left bottom",
  },
  /* ::before — polygon(12% 0, 100% 0, 0 100%) */
  tailOutline: {
    position: "absolute",
    zIndex: 1,
    left: 18,
    bottom: -14,
    width: 26,
    height: 18,
  },
  /* ::after */
  tailFill: {
    position: "absolute",
    zIndex: 2,
    left: 20,
    bottom: -10,
    width: 22,
    height: 16,
  },
  bubbleText: {
    position: "relative",
    zIndex: 3,
    height: 72,
    paddingHorizontal: 25,
    justifyContent: "center",
  },
  bubbleTextLabel: {
    color: "#123e6b",
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 21,
    letterSpacing: -0.4,
  },
  arrow: {
    position: "absolute",
    zIndex: 4,
    right: 9,
    bottom: 9,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowChevron: {
    width: 8,
    height: 8,
    marginLeft: -3,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#ffffff",
    transform: [{ rotate: "45deg" }],
  },
});
