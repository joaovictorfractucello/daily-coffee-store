import Image from "next/image";

// Ilustrações dos estados (vazio, e-mail enviado...), geradas no estilo de figurinha da marca.
// Decorativas: o texto ao lado já diz tudo, então ficam fora da leitura de tela.
const illustrations = {
  cartEmpty: "/images/estados/carrinho-vazio.webp",
  searchEmpty: "/images/estados/busca-vazia.webp",
  emailSent: "/images/estados/email-enviado.webp",
  allSet: "/images/estados/tudo-certo.webp",
  linkExpired: "/images/estados/link-expirado.webp",
  notFound: "/images/estados/pagina-404.webp",
  error: "/images/estados/erro.webp",
  addressesEmpty: "/images/enderecos/vazio.webp",
} as const;

// Estado vazio no celular ocupa a tela: o rodapé só aparece depois de rolar. O valor descontado é o
// título da página acima do estado (o cabeçalho e a barra de baixo são fixos). A 404 e a página de
// erro começam no topo e usam a tela inteira (min-h-svh).
export const emptyStateScreenClass = {
  // Título simples (carrinho).
  short: "max-md:min-h-[calc(100svh-10rem)] max-md:justify-center",
  // Título com voltar e texto de apoio (páginas da conta).
  tall: "max-md:min-h-[calc(100svh-14rem)] max-md:justify-center",
};

type StateIllustrationProps = {
  name: keyof typeof illustrations;
  // Tamanho na tela, em px.
  size?: number;
  className?: string;
};

export function StateIllustration({
  name,
  size = 160,
  className = "",
}: StateIllustrationProps) {
  return (
    <Image
      src={illustrations[name]}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 ${className}`}
    />
  );
}
