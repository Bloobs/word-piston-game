/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === "development"

const nextConfig = {
  output: "export",
  assetPrefix: isDevelopment ? "" : "./",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
