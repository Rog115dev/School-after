import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  session: "outschool_session",
  favourites: "outschool_favourites",
  notes: "outschool_notes",
};

export type Session = {
  email: string;
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  expiresAt: string;
};

export type Favourite = {
  id: string;
  title: string;
  kind: "subtopic" | "topTip";
  subtitle?: string;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
};

export async function getSession() {
  const raw = await AsyncStorage.getItem(KEYS.session);
  return raw ? (JSON.parse(raw) as Session) : null;
}

export async function saveSession(session: Session) {
  await AsyncStorage.setItem(KEYS.session, JSON.stringify(session));
}

export async function clearSession() {
  await AsyncStorage.removeItem(KEYS.session);
}

export async function getFavourites() {
  const raw = await AsyncStorage.getItem(KEYS.favourites);
  return raw ? (JSON.parse(raw) as Favourite[]) : [];
}

export async function saveFavourites(items: Favourite[]) {
  await AsyncStorage.setItem(KEYS.favourites, JSON.stringify(items));
}

export async function getNotes() {
  const raw = await AsyncStorage.getItem(KEYS.notes);
  return raw ? (JSON.parse(raw) as Note[]) : [];
}

export async function saveNotes(items: Note[]) {
  await AsyncStorage.setItem(KEYS.notes, JSON.stringify(items));
}
