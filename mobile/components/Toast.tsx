import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { colors, radii, spacing } from "@/constants/theme";

export function Toast({
  message,
  visible,
  onHide,
}: {
  message: string;
  visible: boolean;
  onHide: () => void;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (!visible) return;
    opacity.value = withTiming(1, { duration: 180 });
    translateY.value = withTiming(0, { duration: 180 });
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(12, { duration: 200 }, () => {
        runOnJS(onHide)();
      });
    }, 1800);
    return () => clearTimeout(timer);
  }, [visible, message]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, style]} pointerEvents="none">
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: 24,
    backgroundColor: colors.headerInk,
    borderRadius: radii.pill,
    paddingVertical: 12,
    paddingHorizontal: 18,
    zIndex: 50,
  },
  text: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
  },
});
