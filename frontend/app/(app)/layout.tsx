import { BottomNav } from "@/components/layout/bottom-nav";
import { RequireAuth } from "@/components/layout/route-guards";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      {children}
      <BottomNav />
    </RequireAuth>
  );
}
