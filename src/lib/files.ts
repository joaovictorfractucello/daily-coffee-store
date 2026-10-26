import fs from "node:fs";
import path from "node:path";

// Só roda no servidor. A página é gerada no build, então em produção uma foto nova
// só aparece depois de um novo build (no `npm run dev` aparece ao recarregar).
export function existsInPublic(publicPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", publicPath));
}
