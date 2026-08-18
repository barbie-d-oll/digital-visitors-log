import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  serverExternalPackages: ["mongoose", "bcryptjs", "nodemailer"],
};

export default nextConfig;
