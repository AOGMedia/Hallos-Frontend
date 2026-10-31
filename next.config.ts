import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (smallest), WebP as the fallback; browsers pick what they support.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "prod-api.aahbibi.com",
      },
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "hallos-bucket.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "hallos-bucket.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "pub-568ce08600d94c44a1b05475c24924ec.r2.dev",
      },
    ],
  },
};

export default nextConfig;
