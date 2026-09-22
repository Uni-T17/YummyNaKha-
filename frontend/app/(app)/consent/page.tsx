import type { Metadata } from "next";
import { ConsentForm } from "@/components/consent/consent-form";

export const metadata: Metadata = { title: "Before we read your menu" };

export default function ConsentPage() {
  return <ConsentForm />;
}
