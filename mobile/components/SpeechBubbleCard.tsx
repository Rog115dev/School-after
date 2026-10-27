import { useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { fonts } from "@/constants/theme";

type Props = {
  title: string;
  borderColor: string;
  arrowColor: string;
  onPress: () => void;
};

const WHITE = "#fafdfe";
const BUBBLE_H = 76;
const TAIL_H = 14;
/** Matches the HTML border: 2px — keep the full stroke inside the canvas. */
const STROKE = 2;
const PAD = STROKE / 2;

/**
 * Continuous outline inset by half the stroke so every side draws at the
 * same 2px thickness (edge strokes are not clipped by the SVG bounds).
 */
function bubblePath(outerW: number, outerH: number) {
  const x0 = PAD;
  const y0 = PAD;
  const x1 = outerW - PAD;
  const y1 = outerH - PAD;
  const w = x1 - x0;
  const h = y1 - y0;

  const rtl = 28;
  const rtr = 26;
  const rbr = 32;
  const rbl = 18;
  const rise = h * 0.045;
  const leftBottom = y0 + h;
  const rightBottom = y0 + h - rise;
  const tailX = x0 + 16;
  const tipX = x0 + 1;
  const tipY = leftBottom + TAIL_H - PAD;
  const tailRight = x0 + 38;

  return [
    `M ${x0 + rtl} ${y0}`,
    `H ${x1 - rtr}`,
    `Q ${x1} ${y0} ${x1} ${y0 + rtr}`,
    `L ${x1} ${rightBottom - rbr}`,
    `Q ${x1} ${rightBottom} ${x1 - rbr} ${rightBottom}`,
    `L ${tailRight} ${leftBottom}`,
    `L ${tipX} ${tipY}`,
    `L ${tailX} ${leftBottom}`,
    `L ${x0 + rbl} ${leftBottom}`,
    `Q ${x0} ${leftBottom} ${x0} ${leftBottom - rbl}`,
    `L ${x0} ${y0 + rtl}`,
    `Q ${x0} ${y0} ${x0 + rtl} ${y0}`,
    "Z",
  ].join(" ");
}

export function SpeechBubbleCard({
  title,
  borderColor,
  arrowColor,
  onPress,
}: Props) {
  const [width, setWidth] = useState(0);

  function onBubbleLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const svgH = BUBBLE_H + TAIL_H;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.speechBubble} onLayout={onBubbleLayout}>
        {width > 0 ? (
          <Svg
            width={width}
            height={svgH}
            style={styles.bubbleSvg}
            pointerEvents="none"
          >
            <Path
              d={bubblePath(width, BUBBLE_H)}
              fill={WHITE}
              stroke={borderColor}
              strokeWidth={STROKE}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="nonScalingStroke"
            />
          </Svg>
        ) : null}

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
    height: BUBBLE_H,
  },
  bubbleSvg: {
    position: "absolute",
    top: 0,
    left: 0,
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
