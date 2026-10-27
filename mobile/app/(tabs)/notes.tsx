import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getNotes, saveNotes, type Note } from "@/lib/storage";
import { AppChrome, PillBanner } from "@/components/AppChrome";
import { Button, Empty } from "@/components/ui";
import { Toast } from "@/components/Toast";
import { colors, fonts, spacing } from "@/constants/theme";

type Panel = "write" | "saved";

function formatWhen(iso: string) {
  const date = new Date(iso);
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return `Today, ${time}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  const day = date.toLocaleDateString([], { day: "numeric", month: "short" });
  return `${day}, ${time}`;
}

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState("");
  const [panel, setPanel] = useState<Panel>("write");
  const [openId, setOpenId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getNotes().then(setNotes);
    }, [])
  );

  const openNote = notes.find((note) => note.id === openId) ?? null;

  async function addNote() {
    if (!draft.trim()) {
      setToast("Write something first");
      return;
    }
    const next: Note[] = [
      {
        id: String(Date.now()),
        title: "Note",
        body: draft.trim(),
        updatedAt: new Date().toISOString(),
      },
      ...notes,
    ];
    setNotes(next);
    await saveNotes(next);
    setDraft("");
    setOpenId(null);
    setPanel("saved");
    setToast("Note saved on this phone");
  }

  function confirmDelete(id: string) {
    Alert.alert("Delete this note?", "This removes it from this phone.", [
      { text: "Keep", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeNote(id),
      },
    ]);
  }

  async function removeNote(id: string) {
    const next = notes.filter((note) => note.id !== id);
    setNotes(next);
    await saveNotes(next);
    setOpenId(null);
    setToast("Note deleted");
  }

  function showSaved() {
    setOpenId(null);
    setPanel("saved");
  }

  return (
    <AppChrome contentStyle={{ paddingTop: spacing.md, paddingBottom: 0 }}>
      <PillBanner label="Notes" />
      <View style={styles.switch}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPanel("write")}
          style={[styles.switchItem, panel === "write" && styles.switchOn]}
        >
          <Text style={[styles.switchText, panel === "write" && styles.switchTextOn]}>
            Write
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={showSaved}
          style={[styles.switchItem, panel === "saved" && styles.switchOn]}
        >
          <Text style={[styles.switchText, panel === "saved" && styles.switchTextOn]}>
            Saved{notes.length ? ` ${notes.length}` : ""}
          </Text>
        </Pressable>
      </View>

      {panel === "write" ? (
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.writeContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.notebook}>
              <Text style={styles.prompt}>
                Write down any questions you may have here, then think about who to
                speak to.
              </Text>
              <View style={styles.paper}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <View key={i} style={styles.line} />
                ))}
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Start writing…"
                  placeholderTextColor={colors.muted}
                  multiline
                  style={styles.input}
                  textAlignVertical="top"
                />
              </View>
            </View>
            <View style={styles.saveWrap}>
              <Button label="Save note" onPress={addNote} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : openNote ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.readContent}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => setOpenId(null)}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Back to saved notes"
          >
            <Ionicons name="chevron-back" size={18} color={colors.headerInk} />
            <Text style={styles.backText}>All saved notes</Text>
          </Pressable>
          <Text style={styles.when}>{formatWhen(openNote.updatedAt)}</Text>
          <View style={styles.readCard}>
            <Text style={styles.readBody}>{openNote.body}</Text>
          </View>
          <Button
            label="Delete note"
            variant="danger"
            onPress={() => confirmDelete(openNote.id)}
          />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {!notes.length ? (
            <Empty text="Saved notes will appear here after you write one." />
          ) : (
            notes.map((item, index) => {
              const accent = colors.questionCards[index % colors.questionCards.length].border;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open note from ${formatWhen(item.updatedAt)}`}
                  onPress={() => setOpenId(item.id)}
                  style={({ pressed }) => [
                    styles.card,
                    { borderColor: accent, opacity: pressed ? 0.92 : 1 },
                  ]}
                >
                  <View style={styles.cardCopy}>
                    <Text style={[styles.when, { color: accent }]}>
                      {formatWhen(item.updatedAt)}
                    </Text>
                    <Text style={styles.preview} numberOfLines={2}>
                      {item.body}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={accent} />
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}

      <Toast message={toast} visible={!!toast} onHide={() => setToast("")} />
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  switch: {
    flexDirection: "row",
    backgroundColor: colors.skyDeep,
    borderRadius: 999,
    padding: 4,
    marginBottom: spacing.md,
  },
  switchItem: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: "center",
  },
  switchOn: {
    backgroundColor: "#FFFFFF",
  },
  switchText: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  switchTextOn: {
    color: colors.headerInk,
  },
  writeContent: {
    paddingBottom: spacing.xl,
  },
  notebook: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: "#FFFEFA",
  },
  prompt: {
    color: colors.ink,
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  paper: {
    height: 7 * 28,
    position: "relative",
  },
  line: {
    height: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#E4EEF8",
  },
  input: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    color: colors.ink,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 28,
    padding: 0,
  },
  saveWrap: {
    marginTop: spacing.md,
  },
  listContent: {
    gap: 12,
    paddingBottom: spacing.xl,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardCopy: {
    flex: 1,
    gap: 4,
  },
  when: {
    fontFamily: fonts.extrabold,
    fontSize: 13,
    color: colors.headerInk,
  },
  preview: {
    color: colors.ink,
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 21,
  },
  readContent: {
    paddingBottom: spacing.xl,
    gap: 12,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 2,
    paddingVertical: 4,
  },
  backText: {
    color: colors.headerInk,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  readCard: {
    backgroundColor: "#FFFEFA",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: spacing.md,
  },
  readBody: {
    color: colors.ink,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
});
