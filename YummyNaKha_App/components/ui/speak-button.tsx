"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/cn";

// Reads Thai text aloud with the phone's own text-to-speech voice, so a diner
// can hear how to say a dish or play it to staff. Runs on the device (Web
// Speech API); our app sends nothing anywhere.

const noop = () => () => {};
const hasSpeech = () => "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

function thaiVoice() {
  return window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().replace("_", "-").startsWith("th"));
}

interface SpeakButtonProps {
  text: string;
  /** What the button reads, for screen readers: "Listen to ต้มยำกุ้ง". */
  label?: string;
  size?: "sm" | "lg";
  className?: string;
}

export function SpeakButton({ text, label, size = "sm", className }: SpeakButtonProps) {
  const supported = useSyncExternalStore(noop, hasSpeech, () => false);
  const [speaking, setSpeaking] = useState(false);
  const [noVoice, setNoVoice] = useState(false);

  // Stop when the button leaves the screen.
  useEffect(() => () => void (hasSpeech() && speaking && window.speechSynthesis.cancel()), [speaking]);

  if (!supported) return null;

  function speak() {
    const synth = window.speechSynthesis;
    synth.cancel();
    const voices = synth.getVoices();
    const voice = thaiVoice();
    // Voices are listed only after they load; with a full list and no Thai voice, say so.
    if (voices.length > 0 && !voice) {
      setNoVoice(true);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "th-TH";
    if (voice) utterance.voice = voice;
    utterance.rate = 0.85;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  }

  return (
    <span className={cn("inline-flex flex-col items-start", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          speak();
        }}
        aria-label={label ?? `Listen to ${text}`}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border transition-colors",
          speaking ? "border-brand bg-brand text-white" : "border-line bg-white text-brand hover:border-brand",
          size === "lg" ? "h-14 w-14" : "h-10 w-10",
        )}
      >
        <Volume2 size={size === "lg" ? 24 : 16} aria-hidden className={cn(speaking && "animate-pulse")} />
      </button>
      {noVoice && (
        <span role="status" className="mt-1 max-w-48 text-[11px] leading-snug text-check-ink">
          Your phone has no Thai voice. Add one in its settings (Language / Text-to-speech).
        </span>
      )}
    </span>
  );
}
