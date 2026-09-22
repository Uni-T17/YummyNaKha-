import "server-only";

// Helpers for cleaning model output and fencing untrusted text in prompts.

const MAX_TEXT = 20_000;

/** Trims, drops code fences and blank-line runs, and caps length. */
export function normalizeModelText(raw: string): string {
  return raw
    // Reasoning models may prepend <think>…</think>; keep only the answer.
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^[\s\S]*<\/think>/i, "")
    .trim()
    .replace(/^```[a-z]*\s*/i, "")
    .replace(/```\s*$/i, "")
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t ]+/g, " ").trim())
    .filter((line, i, lines) => line.length > 0 || (i > 0 && lines[i - 1].length > 0))
    .join("\n")
    .trim()
    .slice(0, MAX_TEXT);
}

/** True when the text contains Thai script. */
export function containsThai(text: string) {
  return /[฀-๿]/.test(text);
}

/**
 * Makes untrusted text safe to place between our own delimiter tags: removes
 * anything that could close or open one of those tags.
 */
export function fenceUntrusted(text: string) {
  return text.replace(/<\s*\/?\s*(menu_text|menu_text_thai|menu_text_english|user_preferences|instructions)[^>]*>/gi, "[removed]");
}
