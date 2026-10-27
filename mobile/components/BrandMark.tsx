import { Image, View } from "react-native";

const logo = require("../assets/brand-logo.png");

/** Official Speech, Language & Communication mark. `full` includes the wordmark. */
export function BrandMark({ size = 44, full = false }: { size?: number; full?: boolean }) {
  if (full) {
    return (
      <Image
        source={logo}
        accessibilityLabel="Speech, Language and Communication. Essential for every school."
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  const globeShare = 0.72;
  return (
    <View style={{ width: size, height: size, overflow: "hidden" }}>
      <Image
        source={logo}
        accessibilityLabel="Speech, Language and Communication"
        style={{ width: size, height: size / globeShare }}
        resizeMode="cover"
      />
    </View>
  );
}
