import Constants from "expo-constants";
import { Platform } from "react-native";

function resolveApiBase() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

  // On a real device / Memu, localhost points at the device itself — never use it.
  if (envUrl && !(Platform.OS !== "web" && /localhost|127\.0\.0\.1/.test(envUrl))) {
    return envUrl;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.linkingUri ||
    "";

  const host = String(hostUri)
    .replace(/^exp:\/\//, "")
    .replace(/^https?:\/\//, "")
    .split(":")[0];

  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:4000`;
  }

  // Android Studio AVD default bridge to host machine
  if (Platform.OS === "android") return "http://10.0.2.2:4000";
  return "http://localhost:4000";
}

export const API_BASE = resolveApiBase();

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      `Network request failed. API is ${API_BASE}. On Memu/emulator use your PC IP (not localhost), and keep the backend running.`
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(
      typeof data.error === "string" ? data.error : `Request failed (${res.status})`
    ) as Error & {
      status?: string;
      data?: unknown;
    };
    error.status = data.status;
    error.data = data;
    throw error;
  }
  return data as T;
}

export async function trackEvent(
  eventType: string,
  schoolId?: string | null,
  payload?: Record<string, unknown>
) {
  try {
    await api("/api/analytics/events", {
      method: "POST",
      body: JSON.stringify({ eventType, schoolId: schoolId || undefined, payload }),
    });
  } catch {
    // analytics should never block UX
  }
}
