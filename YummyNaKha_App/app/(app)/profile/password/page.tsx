import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/profile/change-password-form";

export const metadata: Metadata = { title: "Change Password" };

export default function ChangePasswordPage() {
  return <ChangePasswordForm />;
}
