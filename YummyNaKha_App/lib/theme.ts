// Colour themes the diner can pick in Profile → Appearance. Only the main
// (brand) colour changes; the result colours — Top Pick green, Check First
// yellow, Avoid red — never do, because they carry safety meaning (rule.md).
// No red, amber or bright-green theme for the same reason. Every main colour
// keeps white button text at 4.5:1 or more (WCAG AA).
//
// The choice is a display preference, kept only in this browser.

export type ThemeId = "sage" | "ocean" | "plum" | "charcoal" | "coral";

export interface Theme {
  id: ThemeId;
  label: string;
  /** Swatch colour shown in the picker (the theme's main colour). */
  swatch: string;
}

export const THEMES: Theme[] = [
  { id: "sage", label: "Sage", swatch: "#557029" },
  { id: "ocean", label: "Ocean", swatch: "#1f5f8b" },
  { id: "plum", label: "Plum", swatch: "#6b3a7a" },
  { id: "charcoal", label: "Charcoal", swatch: "#3a3f44" },
  { id: "coral", label: "Coral", swatch: "#c9431f" },
];

export const DEFAULT_THEME: ThemeId = "sage";
export const THEME_STORAGE_KEY = "yummynakha:theme";

const isTheme = (v: unknown): v is ThemeId => THEMES.some((t) => t.id === v);

export function readTheme(): ThemeId {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

const listeners = new Set<() => void>();

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setTheme(id: ThemeId) {
  if (id === DEFAULT_THEME) delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = id;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // Not saved: the theme lasts until the page is closed.
  }
  listeners.forEach((l) => l());
}

/**
 * Runs in <head> before the page paints, so a saved theme shows at once
 * instead of flashing the default colour first.
 */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t&&${JSON.stringify(
  THEMES.map((t) => t.id).filter((id) => id !== DEFAULT_THEME),
)}.indexOf(t)>-1)document.documentElement.dataset.theme=t}catch(e){}`;
