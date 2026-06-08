import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // shared/* paketleri TS kaynak olarak yayinlandigi icin Next'in
  // bunlari transpile etmesi gerekiyor.
  transpilePackages: [
    "@shared/jira",
    "@shared/lib",
    "@shared/schemas",
    "@shared/supabase",
    "@shared/theme",
  ],
  // Cloud Run / Docker icin: tum sunucuyu .next/standalone altinda
  // kendi kendine yeten (self-contained) sekilde paketle.
  output: "standalone",
  // pnpm monorepo'da paylasilan paketlerin de izlenip (tracing) kopyalanmasi
  // icin monorepo kok dizinini isaret et. Build web-app dizininde calistigi
  // icin bir ust dizin monorepo kokudur.
  outputFileTracingRoot: path.join(process.cwd(), ".."),
};

export default nextConfig;
