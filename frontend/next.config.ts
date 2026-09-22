import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Not a secret: only the provider name, so the consent text matches the server.
    NEXT_PUBLIC_OCR_PROVIDER: process.env.OCR_PROVIDER === "gemini" ? "gemini" : "huggingface",
  },
};

export default nextConfig;
