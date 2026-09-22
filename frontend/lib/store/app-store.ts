import { useMemo, useSyncExternalStore } from "react";
import { fetchSession, markOnboarded, signOutRequest } from "../api/auth";
import { createId } from "../api/client";
import { deleteMenuImage, uploadMenuImage } from "../api/menu";
import { addDislike, addFavorite, getTasteProfile, removeDislike, removeFavorite } from "../api/preferences";
import { categorizeMenu } from "../matching";
import type { AppUser, AvoidItem, Dish, ExtractedDish, MenuUpload, TasteProfile } from "../types";

// Client-side view of the session. The server is the source of truth for the
// user, onboarding and the taste profile; this store mirrors it (cached in
// sessionStorage for instant paint) and syncs on load via /api/auth/me.
// Menu results and the current selection stay client-side.

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

const STORAGE_KEY = "yummynakha:session:v2";

const EMPTY_PROFILE: TasteProfile = { favs: [], avoid: [] };

const initialState: AppState = {
  hydrated: false,
  user: null,
  hasOnboarded: false,
  profile: EMPTY_PROFILE,
  uploads: [],
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
    // Only finished uploads survive a reload (object URLs and in-flight uploads don't).
    const uploads = state.uploads
      .filter((u) => u.status === "ready")
      .map(({ id, fileName, status }) => ({ id, fileName, status }));
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

function resetLocal() {
  state.uploads.forEach((u) => u.previewUrl && URL.revokeObjectURL(u.previewUrl));
  setState(() => ({ ...initialState, hydrated: true }));
}

/**
 * Optimistically applies a profile change, then replaces it with the saved
 * profile the server returns (or rolls back if the request fails).
 */
function mutateProfile(optimistic: (p: TasteProfile) => TasteProfile, request: () => Promise<TasteProfile>) {
  const before = state.profile;
  setState((s) => ({ ...s, profile: optimistic(s.profile) }));
  request()
    .then((profile) => setState((s) => ({ ...s, profile })))
    .catch((error) => {
      console.warn("[taste] could not save change:", error);
      setState((s) => ({ ...s, profile: before }));
    });
}

let sessionSync: Promise<void> | null = null;

// ─── Actions ──────────────────────────────────────────────────────────────────

export const appActions = {
  /** Called after a successful sign-in / sign-up. */
  signIn(user: AppUser, onboarded: boolean) {
    setState((s) => ({ ...initialState, hydrated: true, uploads: s.user?.id === user.id ? s.uploads : [], user, hasOnboarded: onboarded }));
    getTasteProfile()
      .then((profile) => setState((s) => ({ ...s, profile })))
      .catch(() => {});
  },

  /**
   * Confirms the cached session with the server once per page load and pulls
   * the saved profile. A dead session clears local state (guards redirect).
   */
  syncSession() {
    sessionSync ??= (async () => {
      try {
        const session = await fetchSession();
        if (!session) {
          if (state.user) resetLocal();
          return;
        }
        setState((s) => ({
          ...s,
          ...(s.user?.id !== session.user.id ? { ...initialState, hydrated: true } : {}),
          user: session.user,
          hasOnboarded: session.onboarded,
        }));
        const profile = await getTasteProfile();
        setState((s) => ({ ...s, profile }));
      } catch (error) {
        // Offline / server down: keep the cached session so the app stays usable.
        console.warn("[session] sync failed:", error);
        sessionSync = null;
      }
    })();
    return sessionSync;
  },

  signOut() {
    signOutRequest().catch(() => {});
    sessionSync = null;
    resetLocal();
  },

  updateUserName(name: string) {
    setState((s) => (s.user ? { ...s, user: { ...s.user, name } } : s));
  },

  completeOnboarding() {
    setState((s) => ({ ...s, hasOnboarded: true }));
    markOnboarded().catch((error) => console.warn("[onboarding] could not save:", error));
  },

  addFav(name: string) {
    if (state.profile.favs.some((f) => f.toLowerCase() === name.toLowerCase())) return;
    mutateProfile(
      (p) => ({ favs: [...p.favs, name], avoid: p.avoid.filter((a) => a.name.toLowerCase() !== name.toLowerCase()) }),
      () => addFavorite(name),
    );
  },

  removeFav(name: string) {
    mutateProfile(
      (p) => ({ ...p, favs: p.favs.filter((f) => f !== name) }),
      () => removeFavorite(name),
    );
  },

  addAvoid(item: AvoidItem) {
    if (state.profile.avoid.some((a) => a.name.toLowerCase() === item.name.toLowerCase())) return;
    mutateProfile(
      (p) => ({ favs: p.favs.filter((f) => f.toLowerCase() !== item.name.toLowerCase()), avoid: [...p.avoid, item] }),
      () => addDislike(item.name, item.reason),
    );
  },

  removeAvoid(name: string) {
    mutateProfile(
      (p) => ({ ...p, avoid: p.avoid.filter((a) => a.name !== name) }),
      () => removeDislike(name),
    );
  },

  /** Adds picked files and uploads each one to the server. */
  addFiles(files: File[]) {
    const pending = files.map((file) => ({
      file,
      upload: {
        id: createId("local"),
        fileName: file.name,
        status: "uploading" as const,
        previewUrl: URL.createObjectURL(file),
      },
    }));
    setState((s) => ({ ...s, uploads: [...s.uploads, ...pending.map((p) => p.upload)] }));

    for (const { file, upload } of pending) {
      uploadMenuImage(file)
        .then((image) =>
          setState((s) => ({
            ...s,
            uploads: s.uploads.map((u) => (u.id === upload.id ? { ...u, id: image.id, status: "ready" } : u)),
          })),
        )
        .catch((error: Error) =>
          setState((s) => ({
            ...s,
            uploads: s.uploads.map((u) =>
              u.id === upload.id ? { ...u, status: "error", error: error.message || "Upload failed." } : u,
            ),
          })),
        );
    }
  },

  removeUpload(id: string) {
    const target = state.uploads.find((u) => u.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    if (target?.status === "ready") deleteMenuImage(id).catch(() => {});
    setState((s) => ({ ...s, uploads: s.uploads.filter((u) => u.id !== id) }));
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
