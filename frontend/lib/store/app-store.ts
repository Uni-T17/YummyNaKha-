import { useMemo, useSyncExternalStore } from "react";
import { categorizeMenu } from "../matching";
import { DEFAULT_PROFILE, SAMPLE_UPLOADS } from "../mock-data";
import type { AppUser, AvoidItem, Dish, ExtractedDish, MenuUpload, TasteProfile } from "../types";

// Client-side session state for the prototype. Persisted to sessionStorage so a
// page refresh keeps the user where they were. When a backend exists, `user`,
// `profile` and `hasOnboarded` come from the API instead; uploads / menu /
// selection can stay client-side.

export interface AppState {
  /** False until sessionStorage has been read on the client. */
  hydrated: boolean;
  user: AppUser | null;
  hasOnboarded: boolean;
  profile: TasteProfile;
  uploads: MenuUpload[];
  /** Extracted dishes from the latest analysis; null = nothing analyzed yet. */
  menu: ExtractedDish[] | null;
  selectedIds: string[];
}

const STORAGE_KEY = "yummynakha:session:v1";

const initialState: AppState = {
  hydrated: false,
  user: null,
  hasOnboarded: false,
  profile: DEFAULT_PROFILE,
  uploads: SAMPLE_UPLOADS,
  menu: null,
  selectedIds: [],
};

let state: AppState = initialState;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  let saved: Partial<AppState> = {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) saved = JSON.parse(raw) as Partial<AppState>;
  } catch {
    // Storage unavailable (private mode, blocked) — start fresh.
  }
  state = { ...initialState, ...saved, hydrated: true };
}

function persist() {
  try {
    // Object URLs do not survive a reload, so only the file names are kept.
    const uploads = state.uploads.map((u) => ({ id: u.id, fileName: u.fileName }));
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, hydrated: undefined, uploads }));
  } catch {
    // Non-fatal: state still works in memory.
  }
}

function setState(update: (prev: AppState) => AppState) {
  load();
  state = update(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  load();
  return state;
}

function getServerSnapshot() {
  return initialState;
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The analyzed menu checked against the current profile, sorted top → check → avoid. */
export function useDishes(): Dish[] | null {
  const { menu, profile } = useAppState();
  return useMemo(() => (menu ? categorizeMenu(menu, profile) : null), [menu, profile]);
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export const appActions = {
  signIn(user: AppUser) {
    setState((s) => ({ ...s, user }));
  },

  signOut() {
    state.uploads.forEach((u) => u.previewUrl && URL.revokeObjectURL(u.previewUrl));
    setState(() => ({ ...initialState, hydrated: true }));
  },

  updateUserName(name: string) {
    setState((s) => (s.user ? { ...s, user: { ...s.user, name } } : s));
  },

  completeOnboarding() {
    setState((s) => ({ ...s, hasOnboarded: true }));
  },

  addFav(name: string) {
    setState((s) => {
      const exists = s.profile.favs.some((f) => f.toLowerCase() === name.toLowerCase());
      return exists ? s : { ...s, profile: { ...s.profile, favs: [...s.profile.favs, name] } };
    });
  },

  removeFav(name: string) {
    setState((s) => ({ ...s, profile: { ...s.profile, favs: s.profile.favs.filter((f) => f !== name) } }));
  },

  addAvoid(item: AvoidItem) {
    setState((s) => {
      const exists = s.profile.avoid.some((a) => a.name.toLowerCase() === item.name.toLowerCase());
      return exists ? s : { ...s, profile: { ...s.profile, avoid: [...s.profile.avoid, item] } };
    });
  },

  removeAvoid(name: string) {
    setState((s) => ({
      ...s,
      profile: { ...s.profile, avoid: s.profile.avoid.filter((a) => a.name !== name) },
    }));
  },

  addUploads(uploads: MenuUpload[]) {
    setState((s) => ({ ...s, uploads: [...s.uploads, ...uploads] }));
  },

  removeUpload(id: string) {
    setState((s) => {
      const target = s.uploads.find((u) => u.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return { ...s, uploads: s.uploads.filter((u) => u.id !== id) };
    });
  },

  setMenu(menu: ExtractedDish[]) {
    // A new analysis starts a new order.
    setState((s) => ({ ...s, menu, selectedIds: [] }));
  },

  toggleDish(id: string) {
    setState((s) => ({
      ...s,
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    }));
  },
};
