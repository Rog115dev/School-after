import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { Video, ResizeMode, type AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE } from "@/lib/api";
import { colors, fonts } from "@/constants/theme";

function resolveUrl(url: string) {
  if (!url) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return url;
}

function toVimeoEmbed(url: string) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (!match) return null;
  return `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0&playsinline=1`;
}

type Props = {
  url: string;
  title?: string;
  active?: boolean;
};

/** Friendly parent-app video player for Vimeo links or uploaded files. */
export function VimeoPlayer({ url, title, active = true }: Props) {
  const { width, height: screenH } = useWindowDimensions();
  const [boxWidth, setBoxWidth] = useState(Math.max(0, width - 64));
  // Fit the card: 16:9, but keep room for title, hint, and Done.
  const maxHeight = Math.round(Math.min(210, screenH * 0.28));
  const byRatio = boxWidth > 0 ? Math.round((boxWidth * 9) / 16) : maxHeight;
  const playerHeight = Math.max(150, Math.min(byRatio, maxHeight));

  const resolved = resolveUrl(url);
  const vimeo = toVimeoEmbed(resolved);
  const videoRef = useRef<Video>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    setPlaying(false);
  }, [url, reloadKey]);

  useEffect(() => {
    if (!active) {
      videoRef.current?.pauseAsync().catch(() => undefined);
      setPlaying(false);
    }
  }, [active]);

  function retry() {
    setError("");
    setLoading(true);
    setReloadKey((k) => k + 1);
  }

  function onFrameLayout(e: { nativeEvent: { layout: { width: number } } }) {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0 && w !== boxWidth) setBoxWidth(w);
  }

  if (!resolved) {
    return (
      <View style={[styles.wrap, { height: playerHeight }]} onLayout={onFrameLayout}>
        <Text style={styles.message}>No video available.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.wrap, { height: playerHeight }]} onLayout={onFrameLayout}>
        <Ionicons name="alert-circle-outline" size={32} color="#fff" />
        <Text style={styles.message}>{error}</Text>
        <Pressable onPress={retry} style={styles.retry}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (vimeo) {
    return (
      <View style={[styles.wrap, { height: playerHeight }]} onLayout={onFrameLayout}>
        <WebView
          key={reloadKey}
          source={{ uri: vimeo }}
          style={styles.media}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError("Could not load this video. Check your connection.");
          }}
          onHttpError={() => {
            setLoading(false);
            setError("Could not load this video. Check your connection.");
          }}
        />
        {loading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.message}>Loading video…</Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { height: playerHeight }]} onLayout={onFrameLayout}>
      <Video
        key={reloadKey}
        ref={videoRef}
        source={{ uri: resolved }}
        style={styles.media}
        useNativeControls={playing}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={playing && active}
        onLoad={() => setLoading(false)}
        onLoadStart={() => setLoading(true)}
        onError={() => {
          setLoading(false);
          setError("Could not play this video file.");
        }}
        onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          setPlaying(status.isPlaying);
          if (status.didJustFinish) setPlaying(false);
        }}
      />

      {loading ? (
        <View style={styles.overlay}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.message}>Loading video…</Text>
        </View>
      ) : null}

      {!loading && !playing ? (
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setPlaying(true);
            videoRef.current?.playAsync().catch(() => undefined);
          }}
          accessibilityRole="button"
          accessibilityLabel={title ? `Play ${title}` : "Play video"}
        >
          <View style={styles.playBtn}>
            <Ionicons name="play" size={26} color="#163A7A" style={{ marginLeft: 2 }} />
          </View>
          <Text style={styles.playHint}>Tap to play</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#0F2748",
    marginBottom: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0F2748",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8, 24, 48, 0.45)",
    gap: 10,
    padding: 16,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  playHint: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  message: {
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: 14,
    textAlign: "center",
  },
  retry: {
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryText: {
    color: colors.headerInk,
    fontFamily: fonts.extrabold,
    fontSize: 14,
  },
});
