import type { Metadata } from "next";
import { ThaiOrder } from "@/components/order/thai-order";

export const metadata: Metadata = { title: "Order in Thai" };

export default function ThaiOrderPage() {
  return <ThaiOrder />;
}
