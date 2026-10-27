import { Stack } from "expo-router";

/** Question, resource, and myth screens stay inside Home so the tab bar remains. */
export default function HomeStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="question/[id]" />
      <Stack.Screen name="subtopic/[id]" />
      <Stack.Screen name="myth/[id]" />
    </Stack>
  );
}
