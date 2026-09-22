import { Camera, ChevronRight, Heart, Languages, Sparkles, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";

const FEATURES: { icon: LucideIcon; text: string; tile: string }[] = [
  { icon: Heart, text: "Set your food preferences once", tile: "bg-[#FF654218] text-brand" },
  { icon: Camera, text: "Upload any Thai menu photo", tile: "bg-[#8B5CF618] text-[#8B5CF6]" },
  { icon: Sparkles, text: "Get personalized picks in English", tile: "bg-[#F59E0B18] text-[#F59E0B]" },
  { icon: Languages, text: "Show your order in Thai to staff", tile: "bg-[#10B98118] text-[#10B981]" },
];

export default function WelcomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-[linear-gradient(170deg,#FFF5EC_0%,#FFFBF7_55%,#F0FDF4_100%)] px-6 py-16">
      <div className="flex w-full max-w-xs flex-col items-center text-center md:max-w-sm">
        <IconTile icon={UtensilsCrossed} size="xl" className="mb-6 rounded-3xl bg-brand text-white shadow-md" />

        <h1 className="mb-2 text-[2.75rem] leading-none font-black tracking-tight text-ink md:text-5xl">
          YummyNaKha!
        </h1>
        <p className="mb-8 text-lg font-bold text-brand">What&apos;s yummy for you?</p>

        <div className="mb-8 w-full rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-[15px] leading-relaxed text-body">
            Upload a Thai menu. We&apos;ll help you find food that fits your taste.
          </p>
        </div>

        <ul className="mb-10 flex w-full flex-col gap-3.5 text-left">
          {FEATURES.map(({ icon, text, tile }) => (
            <li key={text} className="flex items-center gap-3">
              <IconTile icon={icon} className={tile} />
              <span className="text-sm font-semibold text-body">{text}</span>
            </li>
          ))}
        </ul>

        <ButtonLink href="/sign-in" fullWidth className="text-lg shadow-lg">
          Get Started
          <ChevronRight size={20} strokeWidth={3} aria-hidden />
        </ButtonLink>
      </div>
    </main>
  );
}
