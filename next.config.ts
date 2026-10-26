import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Só vale no `npm run dev`: deixa abrir o site pelo IP da rede (ex.: 192.168.0.88:3000 no celular).
  // Sem isso o Next bloqueia o JavaScript de desenvolvimento e a página fica sem menu e sem animações.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  // No Next 16 só a qualidade 75 é permitida por padrão: qualquer outro valor é trocado por ela.
  // A 90 é usada na faixa promocional (prop `quality` do componente Photo).
  images: {
    qualities: [75, 90],
    // O Next guarda a imagem otimizada por 4h, identificada pelo endereço e não pelo conteúdo: se
    // você trocar uma foto mantendo o nome, a antiga continua aparecendo. No `npm run dev` o prazo
    // é de 1 segundo, então a foto nova aparece ao recarregar. Em produção vale o padrão (4h).
    ...(process.env.NODE_ENV === "development" && { minimumCacheTTL: 1 }),
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
