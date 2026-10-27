import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { colors, fonts, spacing } from "@/constants/theme";
import { BrandMark } from "@/components/BrandMark";
import { LoopingHeroVideo } from "@/components/LoopingHeroVideo";

export function HomeHeader({ questionCount }: { questionCount: number }) {
  const { width } = useWindowDimensions();
  const innerWidth = Math.max(0, width - spacing.md * 2);
  const mascotWidth = Math.round((innerWidth * 3) / 7);
  const mascotHeight = Math.round(mascotWidth * (600 / 318));
  const textWidth = Math.max(120, innerWidth - mascotWidth - 10);
  const headlineSize = Math.max(26, Math.min(34, Math.round(textWidth / 5.8)));

  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        <View style={styles.brand}>
          <BrandMark size={36} />
          <Text style={styles.brandTitle}>
            Speech & Language{"\n"}Essentials
          </Text>
        </View>
        <Text
          style={[
            styles.headline,
            { fontSize: headlineSize, lineHeight: headlineSize + 2 },
          ]}
        >
          What would{"\n"}you like to{"\n"}know?
        </Text>
        <Text style={styles.sub}>
          {questionCount} common question{questionCount === 1 ? "" : "s"}
          {"\n"}from parents
        </Text>
      </View>
      <LoopingHeroVideo style={{ width: mascotWidth, height: mascotHeight }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingBottom: 6,
    gap: 8,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandTitle: {
    flex: 1,
    color: colors.headerInk,
    fontFamily: fonts.extrabold,
    fontSize: 16,
    lineHeight: 18,
  },
  headline: {
    marginTop: 8,
    color: "#163A7A",
    fontFamily: fonts.extrabold,
    letterSpacing: -0.5,
  },
  sub: {
    marginTop: 6,
    color: "#5E7394",
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 18,
  },
});
