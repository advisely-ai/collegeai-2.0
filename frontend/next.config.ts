import type { NextConfig } from "next";

const apiBase = (process.env.API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

// The browser always calls same-origin /api/v1, and Next forwards it to the FastAPI backend.
// That keeps CORS out of the picture on Vercel and locally.
const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${apiBase}/api/v1/:path*` }];
  },
};

export default nextConfig;
