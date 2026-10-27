import { Image } from "react-native";

const logo = require("../assets/brand-logo.png");

/** Official Speech, Language & Communication globe mark. */
export function BrandMark({ size = 48 }: { size?: number; full?: boolean }) {
  return (
    <Image
      source={logo}
      accessibilityLabel="Speech, Language and Communication"
      style={{ width: size, height: size, backgroundColor: "transparent" }}
      resizeMode="contain"
    />
  );
}
