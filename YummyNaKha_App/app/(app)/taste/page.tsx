import type { Metadata } from "next";
import { TasteEditor } from "@/components/taste/taste-editor";

export const metadata: Metadata = { title: "My Taste" };

export default function TastePage() {
  return <TasteEditor />;
}
