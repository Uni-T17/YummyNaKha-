"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Share, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// "Add to home screen": one tap to open the app at the table, full screen, no
// link to type. Android/Chrome shows its own install prompt; iPhone Safari has
// no prompt, so we explain the two taps. Hidden once installed or dismissed.

const DISMISSED_KEY = "yummynakha:install-dismissed";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const noop = () => () => {};

function readDismissed() {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function getPlatform(): "installed" | "ios" | "other" {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
  if (standalone) return "installed";
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios ? "ios" : "other";
}

export function InstallApp() {
  const platform = useSyncExternalStore(noop, getPlatform, () => "installed" as const);
  const storedDismissed = useSyncExternalStore(noop, readDismissed, () => true);
  const [dismissed, setDismissed] = useState(false);
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault(); // show our own button instead of the browser's mini bar
      setPrompt(e as InstallPromptEvent);
    }
    const onInstalled = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (platform === "installed" || storedDismissed || dismissed) return null;
  if (platform !== "ios" && !prompt) return null;

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Not saved: the card comes back next visit, which is fine.
    }
  }

  return (
    <section aria-labelledby="install-app" className="relative rounded-2xl border border-line bg-white p-4 pr-12 shadow-sm">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Hide this tip"
        className="absolute top-2 right-2 flex h-10 w-10 items-center justify-center rounded-full text-subtle hover:text-ink"
      >
        <X size={16} aria-hidden />
      </button>
      <h2 id="install-app" className="mb-1 flex items-center gap-1.5 text-sm font-black text-ink">
        <Smartphone size={15} className="text-brand" aria-hidden />
        Add YummyNaKha! to your home screen
      </h2>
      {platform === "ios" ? (
        <p className="text-xs leading-relaxed text-muted">
          Open it with one tap at the restaurant. In Safari, tap{" "}
          <Share size={12} className="inline align-[-2px]" aria-label="Share" /> <b>Share</b>, then <b>Add to Home Screen</b>.
        </p>
      ) : (
        <>
          <p className="mb-3 text-xs leading-relaxed text-muted">Open it with one tap at the restaurant, full screen like an app.</p>
          <Button
            size="sm"
            className="shadow-none"
            onClick={async () => {
              if (!prompt) return;
              await prompt.prompt();
              const { outcome } = await prompt.userChoice;
              if (outcome === "accepted") setPrompt(null);
            }}
          >
            Add to home screen
          </Button>
        </>
      )}
    </section>
  );
}
