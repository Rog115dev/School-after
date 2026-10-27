import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { colors } from "@/constants/theme";

function toEmbedUrl(url: string) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (!match) return url;
  return `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0`;
}

export function VimeoPlayer({ url }: { url: string }) {
  return (
    <View style={styles.wrap}>
      <WebView
        source={{ uri: toEmbedUrl(url) }}
        style={styles.web}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.ink,
    marginBottom: 12,
  },
  web: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
