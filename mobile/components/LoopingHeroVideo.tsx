import { useEffect, useRef } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Video, ResizeMode, type AVPlaybackStatus } from "expo-av";
import { useIsFocused } from "@react-navigation/native";

type Props = {
  style?: StyleProp<ViewStyle>;
};

/**
 * Muted, looping, no-controls video that behaves like a GIF.
 * Sized to match the Louise mascot placement in the home mockup.
 */
export function LoopingHeroVideo({ style }: Props) {
  const ref = useRef<Video>(null);
  const focused = useIsFocused();

  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    if (focused) {
      player.playAsync().catch(() => undefined);
    } else {
      player.pauseAsync().catch(() => undefined);
    }
  }, [focused]);

  const frame = StyleSheet.flatten(style);

  return (
    <View style={[styles.wrap, frame]}>
      <Video
        ref={ref}
        source={require("../assets/videos/question-mark.mp4")}
        style={[styles.video, frame]}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={focused}
        isLooping
        isMuted
        volume={0}
        useNativeControls={false}
        onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          if (focused && !status.isPlaying && !status.isBuffering) {
            ref.current?.playAsync().catch(() => undefined);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    backgroundColor: "#F3FBFE",
  },
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3FBFE",
  },
});
