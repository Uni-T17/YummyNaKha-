import { Camera, ChevronRight, Heart, Languages, Sparkles, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { Logo } from "@/components/ui/logo";

const FEATURES: { icon: LucideIcon; text: string; tile: string }[] = [
  { icon: Heart, text: "Set your food preferences once", tile: "bg-heart-soft text-heart-ink" },
  { icon: Camera, text: "Snap any Thai menu", tile: "bg-brand-tint text-brand" },
  { icon: Sparkles, text: "See picks for you, in English", tile: "bg-check-badge text-check-ink" },
  { icon: Languages, text: "Show your order in Thai to staff", tile: "bg-brand-soft text-brand-strong" },
];

export default function WelcomePage() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[radial-gradient(120%_70%_at_50%_0%,var(--color-brand-tint)_0%,var(--color-cream)_60%)] px-6 py-14">
      {/* Soft leaf-green glow behind the logo */}
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leaf/25 blur-3xl" />
      <div className="relative flex w-full max-w-xs flex-col items-center text-center md:max-w-sm">
        <Logo width={200} priority className="mb-3 animate-fade-up drop-shadow-sm" />

        <h1 className="mb-1.5 text-[2.75rem] leading-none font-black tracking-tight text-ink md:text-5xl">
          Yummy<span className="text-brand">NaKha!</span>
        </h1>
        <p className="mb-7 text-lg font-bold text-muted">What&apos;s yummy for you?</p>

        <div className="mb-8 w-full rounded-3xl border border-line bg-white/90 p-5 text-left shadow-sm backdrop-blur">
          <p className="mb-4 text-[15px] leading-relaxed text-body">
            Snap a Thai menu. We&apos;ll find the food that fits your taste — and help you order it.
          </p>
          <ul className="flex flex-col gap-3">
            {FEATURES.map(({ icon, text, tile }) => (
              <li key={text} className="flex items-center gap-3">
                <IconTile icon={icon} className={tile} />
                <span className="text-sm font-semibold text-body">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <ButtonLink href="/sign-in" fullWidth className="text-lg shadow-lg shadow-brand/25">
          Get Started
          <ChevronRight size={20} strokeWidth={3} aria-hidden />
        </ButtonLink>
      </div>
    </main>
  );
}
