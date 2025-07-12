declare module "next-pwa" {
  import { NextConfig } from "next";

  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: RegExp[];
  }

  interface NextPWAConfig extends NextConfig {
    pwa?: PWAConfig;
  }

  function withPWA(config: NextPWAConfig): NextConfig;
  export default withPWA;
}
