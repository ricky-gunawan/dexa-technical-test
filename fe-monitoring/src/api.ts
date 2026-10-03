export type User = {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  position: string;
  phoneNumber: string | null;
};
export type Attendance = {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  userPosition: string;
  createdAt: string;
  status: "masuk" | "pulang";
};
export type Page<T> = { data: T[]; nextCursor: string | null };
export type UserUpdate = {
  id: string;
  type: "user.updated";
  userId: string;
  changes: Record<string, unknown>;
  createdAt: string;
};
const base = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (response.status === 401) {
    localStorage.removeItem("token");
    if (path !== "/login") location.reload();
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      Array.isArray(body?.message)
        ? body.message.join(", ")
        : body?.message || "Permintaan gagal",
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
export async function login(email: string, password: string) {
  const data = await request<{ access_token: string }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("token", data.access_token);
}

export function currentUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    ).sub as string;
  } catch {
    return null;
  }
}

export async function subscribeToUpdates(
  onUpdate: (event: UserUpdate) => void,
  signal: AbortSignal,
) {
  while (!signal.aborted) {
    try {
      const response = await fetch(`${base}/events`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        signal,
      });
      if (!response.ok || !response.body)
        throw new Error("SSE connection failed");
      const reader = response.body.getReader(),
        decoder = new TextDecoder();
      let buffer = "";
      while (!signal.aborted) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";
        for (const chunk of chunks) {
          const type = chunk.match(/^event: (.+)$/m)?.[1];
          const data = chunk.match(/^data: (.+)$/m)?.[1];
          if (type === "user.updated" && data) onUpdate(JSON.parse(data));
        }
      }
    } catch {
      if (!signal.aborted)
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
