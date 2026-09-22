import type { Metadata } from "next";
import { MenuResults } from "@/components/menu/menu-results";

export const metadata: Metadata = { title: "Your Menu" };

export default function MenuPage() {
  return <MenuResults />;
}
