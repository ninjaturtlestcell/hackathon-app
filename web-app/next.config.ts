import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // shared/* paketleri TS kaynak olarak yayinlandigi icin Next'in
  // bunlari transpile etmesi gerekiyor.
  transpilePackages: [
    "@shared/lib",
    "@shared/schemas",
    "@shared/supabase",
    "@shared/theme",
  ],
};

export default nextConfig;
