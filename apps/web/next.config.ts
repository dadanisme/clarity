import createPWA from "@ducanh2912/next-pwa";

const withPWA = createPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = withPWA({
  turbopack: {},
});

export default nextConfig;
