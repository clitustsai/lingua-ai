import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar: string; // emoji
  createdAt: string;
};

type AuthStore = {
  user: AuthUser | null;
  theme: "dark" | "light";
  isLoggedIn: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  setTheme: (t: "dark" | "light") => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
};

// Simple hash for demo password (not production-safe)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

// Registered users stored in localStorage
export function getRegisteredUsers(): Record<string, { user: AuthUser; passwordHash: string }> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("lingua-users") || "{}"); } catch { return {}; }
}

export function saveRegisteredUsers(users: Record<string, { user: AuthUser; passwordHash: string }>) {
  if (typeof window === "undefined") return;
  localStorage.setItem("lingua-users", JSON.stringify(users));
}

export function registerUser(name: string, email: string, password: string): { ok: boolean; error?: string; user?: AuthUser } {
  const users = getRegisteredUsers();
  if (users[email]) return { ok: false, error: "Email đã được đăng ký" };
  const avatars = ["🦊","🐼","🦁","🐯","🦋","🐸","🦄","🐙","🦅","🐬","🌟","🎭"];
  const user: AuthUser = {
    id: Date.now().toString(),
    name, email,
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
    createdAt: new Date().toISOString(),
  };
  users[email] = { user, passwordHash: simpleHash(password) };
  saveRegisteredUsers(users);
  return { ok: true, user };
}

export function loginUser(email: string, password: string): { ok: boolean; error?: string; user?: AuthUser } {
  const users = getRegisteredUsers();
  const record = users[email];
  if (!record) return { ok: false, error: "Email không tồn tại" };
  if (record.passwordHash !== simpleHash(password)) return { ok: false, error: "Mật khẩu không đúng" };
  return { ok: true, user: record.user };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      theme: "dark",
      isLoggedIn: false,
      login: (user) => set({ user, isLoggedIn: true }),
      logout: () => set({ user: null, isLoggedIn: false }),
      setTheme: (theme) => set({ theme }),
      updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
    }),
    { name: "lingua-auth" }
  )
);
