import type { Metadata } from "next";
import { OrderSummary } from "@/components/order/order-summary";

export const metadata: Metadata = { title: "My Order" };

export default function OrderPage() {
  return <OrderSummary />;
}
