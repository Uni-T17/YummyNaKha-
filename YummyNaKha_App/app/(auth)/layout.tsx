import { RequireGuest } from "@/components/layout/route-guards";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <RequireGuest>{children}</RequireGuest>;
}
