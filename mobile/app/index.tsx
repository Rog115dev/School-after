import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSession } from "@/context/SessionContext";
import { AppChrome, PillBanner } from "@/components/AppChrome";
import { Button, Field, Loading } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

export default function GateScreen() {
  const { session, loading, expiredMessage, unlock } = useSession();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <Loading />;
  if (session) return <Redirect href="/(tabs)" />;

  async function onUnlock() {
    setBusy(true);
    setError("");
    try {
      await unlock(email.trim(), code.trim());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not unlock. Check your email and school code."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppChrome contentStyle={{ paddingTop: spacing.md }}>
      <PillBanner label="Welcome" />
      <Animated.View entering={FadeInDown.duration(320)}>
        <Text style={styles.lead}>
          Enter your email every time. Your school code only needs to be saved
          once on this phone.
        </Text>

        {expiredMessage ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{expiredMessage}</Text>
          </View>
        ) : null}

        <Field
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
        />
        <Field
          label="School code"
          autoCapitalize="characters"
          value={code}
          onChangeText={setCode}
          placeholder="e.g. DEMO2026"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={busy ? "Checking…" : "Unlock content"}
          onPress={onUnlock}
          disabled={busy || !email || !code}
        />
      </Animated.View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  lead: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  banner: {
    backgroundColor: "#FFF4D6",
    borderRadius: 14,
    padding: 14,
    marginBottom: spacing.md,
  },
  bannerText: {
    color: "#8A6200",
    fontWeight: "600",
    lineHeight: 20,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontWeight: "600",
  },
});
