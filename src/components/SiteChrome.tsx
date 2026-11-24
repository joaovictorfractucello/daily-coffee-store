import { Suspense } from "react";
import { BottomNav, BottomNavFallback } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";

// Rodapé e barra de baixo da loja. Ficam nos layouts da home e da loja (e não no layout raiz)
// porque as telas de login e cadastro não os mostram: são um momento de foco no formulário.
export function SiteChrome() {
  return (
    <>
      <Footer />
      <Suspense fallback={<BottomNavFallback />}>
        <BottomNav />
      </Suspense>
    </>
  );
}
