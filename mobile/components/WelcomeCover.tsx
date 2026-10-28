import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandMark } from "@/components/BrandMark";
import { coverAuthors, coverBackground, coverCredit, coverQuestion } from "@/constants/cover";
import { colors, fonts, spacing } from "@/constants/theme";

const PHOTO_W = 720;
const PHOTO_H = 1280;

export function WelcomeCover({ onContinue }: { onContinue: () => void }) {
  const { width, height } = useWindowDimensions();
  const scale = Math.max(width / PHOTO_W, height / PHOTO_H);
  const photoWidth = PHOTO_W * scale;
  const photoHeight = PHOTO_H * scale;
  // The child sits on the right. A centered cover crop hides that face,
  // so the extra width is taken mostly from the left.
  const photoLeft = -((photoWidth - width) * 0.78);
  const photoTop = -((photoHeight - height) * 0.35);

  return (
    <View style={styles.screen}>
      <Image
        source={coverBackground}
        resizeMode="cover"
        style={[styles.photo, { width: photoWidth, height: photoHeight, left: photoLeft, top: photoTop }]}
      />
      <View style={styles.wash} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* <View style={styles.top}>
        <BrandMark size={58} />
      </View> */}

      <View style={styles.middle}>
        <Text style={styles.question}>{coverQuestion}</Text>
        {coverAuthors.length ? (
          <View style={styles.authors}>
            {coverAuthors.map((author) => (
              <Text key={author.name} style={styles.authorName}>
                {author.name}
              </Text>
            ))}
          </View>
        ) : null}
        <Text style={styles.credit}>{coverCredit}</Text>
      </View>

      <Pressable
        onPress={onContinue}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
        accessibilityRole="button"
        accessibilityLabel="See the questions"
      >
        <Text style={styles.buttonText}>See the questions</Text>
      </Pressable>
      <View style={{ height: spacing.md }} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4E7DC",
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  photo: {
    position: "absolute",
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(243, 251, 254, 0.48)",
  },
  top: {
    alignItems: "center",
    paddingTop: spacing.md,
  },
  middle: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  question: {
    color: "#163A7A",
    fontFamily: fonts.extrabold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  authors: {
    gap: 4,
  },
  authorName: {
    color: colors.headerInk,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  credit: {
    color: "#5E7394",
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 23,
  },
  button: {
    backgroundColor: colors.banner,
    borderRadius: 999,
    paddingVertical: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: fonts.extrabold,
    fontSize: 25,
  },
});
