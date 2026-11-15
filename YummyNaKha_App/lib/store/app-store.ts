import { useMemo, useSyncExternalStore } from "react";
import { fetchSession, markOnboarded, signOutRequest } from "../api/auth";
import { createId } from "../api/client";
import { deleteMenuImage, describeUnlisted, uploadMenuImage, type AnalyzedMenu } from "../api/menu";
import { addDislike, addFavorite, getTasteProfile, removeDislike, removeFavorite, setSpiceLevel } from "../api/preferences";
import { prepareForUpload } from "../image-resize";
import { clearPhotos, deletePhoto, savePhoto } from "../photo-cache";
import { categorizeMenu } from "../matching";
import type { AppUser, AvoidItem, Dish, ExtractedDish, MenuUpload, OtherMenuLine, SpiceLevel, TasteProfile } from "../types";

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
  /** The server's id for that analysis (for the background lookup of unlisted dishes). */
  menuAnalysisId: string | null;
  /** Lines read from the menu that aren't dishes, with their place on the menu. */
  menuOtherLines: OtherMenuLine[];
  /** The photos the menu was read from. */
  menuImageIds: string[];
  /**
   * The optional Menu helper's lookup of dishes not in our guide: running,
   * finished, not turned on, or no answer this time.
   */
  aiLookup: "idle" | "pending" | "done" | "off" | "unavailable";
  selectedIds: string[];
  /** How many of each selected dish (1 when not set). */
  quantities: Record<string, number>;
  /** Requests chosen for each selected dish ("not spicy", "no coriander"), by request id. */
  dishRequests: Record<string, string[]>;
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
  menuAnalysisId: null,
  menuOtherLines: [],
  menuImageIds: [],
  aiLookup: "idle",
  selectedIds: [],
  quantities: {},
  dishRequests: {},
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
  // A lookup still running when the page was reloaded is started again by the Menu screen.
  if (state.aiLookup === "pending") state = { ...state, aiLookup: "idle" };
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

/** Uploads the photo as prepared, keeping a copy in this browser for the Menu screen. */
async function uploadAndKeep(file: File) {
  const prepared = await prepareForUpload(file);
  const image = await uploadMenuImage(prepared);
  // The OCR positions refer to this prepared photo, so this is the copy to keep.
  void savePhoto(image.id, prepared);
  return image;
}

function resetLocal() {
  state.uploads.forEach((u) => u.previewUrl && URL.revokeObjectURL(u.previewUrl));
  void clearPhotos();
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

  /** After the server deleted the account: forget everything kept in this browser. */
  accountDeleted() {
    sessionSync = null;
    resetLocal();
  },

  /** Re-reads the saved profile (after withdrawing the health-data consent clears reasons). */
  reloadProfile() {
    getTasteProfile()
      .then((profile) => setState((s) => ({ ...s, profile })))
      .catch((error) => console.warn("[taste] could not reload:", error));
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

  /** Tapping the chosen level again clears it (no spice check). */
  setSpice(level: SpiceLevel | null) {
    mutateProfile(
      (p) => (level === null ? { favs: p.favs, avoid: p.avoid } : { ...p, spice: level }),
      () => setSpiceLevel(level),
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
      uploadAndKeep(file)
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

  /** Swaps a photo for its cropped / rotated version, keeping its place in the list. */
  replaceUpload(id: string, file: File) {
    const target = state.uploads.find((u) => u.id === id);
    if (!target) return;
    if (target.status === "ready") deleteMenuImage(id).catch(() => {});
    if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
    const upload: MenuUpload = { id: createId("local"), fileName: file.name, status: "uploading", previewUrl: URL.createObjectURL(file) };
    setState((s) => ({ ...s, uploads: s.uploads.map((u) => (u.id === id ? upload : u)) }));
    if (target.status === "ready") void deletePhoto(id);
    uploadAndKeep(file)
      .then((image) =>
        setState((s) => ({ ...s, uploads: s.uploads.map((u) => (u.id === upload.id ? { ...u, id: image.id, status: "ready" } : u)) })),
      )
      .catch((error: Error) =>
        setState((s) => ({
          ...s,
          uploads: s.uploads.map((u) => (u.id === upload.id ? { ...u, status: "error", error: error.message || "Upload failed." } : u)),
        })),
      );
  },

  removeUpload(id: string) {
    const target = state.uploads.find((u) => u.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    if (target?.status === "ready") deleteMenuImage(id).catch(() => {});
    // Keep the local copy while the current results still show this photo.
    if (!state.menuImageIds.includes(id)) void deletePhoto(id);
    setState((s) => ({ ...s, uploads: s.uploads.filter((u) => u.id !== id) }));
  },

  setMenu({ dishes, analysisId, otherLines, imageIds }: AnalyzedMenu) {
    // Photos of the previous results that are no longer on Home aren't needed any more.
    state.menuImageIds
      .filter((id) => !imageIds.includes(id) && !state.uploads.some((u) => u.id === id))
      .forEach((id) => void deletePhoto(id));
    // A new analysis starts a new order.
    setState((s) => ({
      ...s,
      menu: dishes,
      menuAnalysisId: analysisId,
      menuOtherLines: otherLines,
      menuImageIds: imageIds,
      aiLookup: "idle",
      selectedIds: [],
      quantities: {},
      dishRequests: {},
    }));
    appActions.lookUpUnlisted();
  },

  /**
   * In the background, asks the Menu helper about dishes not in our guide; the
   * rest of the menu is already on screen. Guesses replace those dishes in place.
   */
  lookUpUnlisted() {
    const analysisId = state.menuAnalysisId;
    if (!analysisId || !state.menu?.some((d) => d.inGuide === false && !d.aiGuess)) return;
    setState((s) => ({ ...s, aiLookup: "pending" }));
    describeUnlisted(analysisId).then((answer) => {
      if (state.menuAnalysisId !== analysisId) return; // a newer scan replaced this menu
      if (typeof answer === "string") return setState((s) => ({ ...s, aiLookup: answer }));
      const byId = new Map(answer.dishes.map((d) => [d.id, d]));
      setState((s) => ({ ...s, aiLookup: "done", menu: s.menu?.map((d) => byId.get(d.id) ?? d) ?? null }));
    });
  },

  toggleDish(id: string) {
    setState((s) => {
      if (!s.selectedIds.includes(id)) return { ...s, selectedIds: [...s.selectedIds, id] };
      const without = <T,>(record: Record<string, T>) => Object.fromEntries(Object.entries(record).filter(([key]) => key !== id));
      return {
        ...s,
        selectedIds: s.selectedIds.filter((x) => x !== id),
        quantities: without(s.quantities),
        dishRequests: without(s.dishRequests),
      };
    });
  },

  /** Sets how many of a selected dish to order (1–20). */
  setQuantity(id: string, quantity: number) {
    const q = Math.min(20, Math.max(1, Math.round(quantity)));
    setState((s) => (s.selectedIds.includes(id) ? { ...s, quantities: { ...s.quantities, [id]: q } } : s));
  },

  /** Adds or removes a request ("not spicy") for one selected dish. */
  toggleRequest(id: string, requestId: string) {
    setState((s) => {
      const current = s.dishRequests[id] ?? [];
      // Only one spice level per dish: picking one replaces the other.
      const isSpice = (r: string) => r.startsWith("spice-");
      const next = current.includes(requestId)
        ? current.filter((r) => r !== requestId)
        : [...current.filter((r) => !(isSpice(requestId) && isSpice(r))), requestId];
      return { ...s, dishRequests: { ...s.dishRequests, [id]: next } };
    });
  },
};
