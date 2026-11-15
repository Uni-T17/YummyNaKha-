import { Languages } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Dish } from "@/lib/types";

/** Small note under a dish title whose English name isn't from our guide or the menu. */
export function NameNote({ dish, className }: { dish: Dish; className?: string }) {
  if (dish.aiGuess || !dish.nameQuality) return null;
  return (
    <p className={cn("flex items-center gap-1 text-[11px] font-bold text-subtle", className)}>
      <Languages size={11} aria-hidden />
      {dish.nameQuality === "rough" ? "Rough translation — not in our dish guide" : "Not translated yet — ask staff"}
    </p>
  );
}

/** The title is Thai when we couldn't translate the name. */
export const titleIsThai = (dish: Dish) => !dish.aiGuess && dish.nameQuality === "untranslated";
