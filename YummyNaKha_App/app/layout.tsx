import type { Metadata, Viewport } from "next";
import { Nunito, Sarabun } from "next/font/google";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "YummyNaKha! — What's yummy for you?",
    template: "%s · YummyNaKha!",
  },
  description:
    "Upload a Thai menu and get picks that fit your taste, with warnings for your avoid list and your order shown back in Thai.",
  applicationName: "YummyNaKha!",
  // Opened from the iPhone home screen: full screen, with our own title.
  appleWebApp: { capable: true, title: "YummyNaKha", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#F8F8F2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the theme script may set data-theme before React loads.
    <html lang="en" className={`${nunito.variable} ${sarabun.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <div className="relative mx-auto flex min-h-dvh w-full max-w-(--shell-max) flex-col bg-cream md:border-x md:border-line md:shadow-[0_0_40px_rgba(28,25,23,0.06)]">
          {children}
        </div>
      </body>
    </html>
  );
}
