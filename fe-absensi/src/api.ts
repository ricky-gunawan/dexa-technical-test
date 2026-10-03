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
  createdAt: string;
  status: "masuk" | "pulang";
};
export type Page<T> = { data: T[]; nextCursor: string | null };

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

export async function uploadProfilePhoto(file: File) {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${base}/upload/profile-photo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Gagal mengunggah foto");
  }
  return response.json() as Promise<{ url: string }>;
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
