import type { Metadata } from "next";
import { AnalysisProgress } from "@/components/menu/analysis-progress";

export const metadata: Metadata = { title: "Finding your yummy" };

export default function AnalyzingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 py-16">
      <AnalysisProgress />
    </main>
  );
}
