import type { MetadataRoute } from "next";

/** Lets diners add YummyNaKha! to their home screen and open it full screen, like an app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YummyNaKha!",
    short_name: "YummyNaKha",
    description: "Snap a Thai menu, see what fits your taste, and order in Thai.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8F8F2",
    theme_color: "#F8F8F2",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
