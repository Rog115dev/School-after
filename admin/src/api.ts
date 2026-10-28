const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4111";

export function getToken() {
  return localStorage.getItem("outschool_admin_token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function uploadVideo(file: File) {
  const body = new FormData();
  body.append("video", file);
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}/api/content/uploads/video`, {
    method: "POST",
    headers,
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Upload failed (${res.status})`);
  }
  return data as { url: string; fileName: string; size: number };
}

export { API_BASE };
