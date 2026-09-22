import type { Metadata } from "next";
import { PrivacySettings } from "@/components/consent/privacy-settings";

export const metadata: Metadata = { title: "Privacy & consents" };

export default function PrivacyPage() {
  return <PrivacySettings />;
}
