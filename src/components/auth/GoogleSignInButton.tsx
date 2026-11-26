import { GoogleLogo } from "@phosphor-icons/react/ssr";
import { authCopy } from "@/data/copy";
import { googleSignInLink } from "@/lib/links";

type GoogleSignInButtonProps = {
  // Página para voltar depois de entrar (o `?next=` do login).
  next?: string | null;
};

// `<a>` e não `<Link>`: a rota da API redireciona para o Google, então precisa ser uma navegação
// completa do navegador, sem o roteador do Next no meio.
export function GoogleSignInButton({ next }: GoogleSignInButtonProps) {
  return (
    <div className="flex flex-col gap-5">
      <a
        href={googleSignInLink(next)}
        className="button button-outline-ink w-full gap-2.5 rounded-[999px]"
      >
        <GoogleLogo aria-hidden="true" size={20} weight="bold" />
        {authCopy.continueWithGoogle}
      </a>
      <div
        role="separator"
        className="flex items-center gap-3 text-sm text-ink-soft"
      >
        <span className="h-px flex-1 bg-line" />
        {authCopy.orWithEmail}
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
