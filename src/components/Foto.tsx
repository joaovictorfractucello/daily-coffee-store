import Image from "next/image";
import { existeEmPublic } from "@/lib/arquivos";
import type { Imagem } from "@/lib/imagens";

type FotoProps = {
  imagem: Imagem;
  className?: string;
  // Classes da <img> (ex.: ponto de corte com object-position).
  imgClassName?: string;
  // true: a proporção vem do className (ex.: uma proporção no celular e outra no desktop),
  // em vez da proporção fixa do registro.
  proporcaoPropria?: boolean;
  // Qualidade da imagem otimizada (75 ou 90, veja images.qualities no next.config.ts).
  qualidade?: 75 | 90;
};

// Mostra a foto se o arquivo existir em public/. Se não existir, um bloco liso na proporção
// exata da foto, para o layout não mudar quando ela chegar.
export function Foto({
  imagem,
  className = "",
  imgClassName = "",
  proporcaoPropria = false,
  qualidade = 75,
}: FotoProps) {
  const proporcao = proporcaoPropria
    ? undefined
    : { aspectRatio: `${imagem.largura} / ${imagem.altura}` };

  if (existeEmPublic(imagem.arquivo)) {
    return (
      <div className={`relative ${className}`} style={proporcao}>
        <Image
          src={imagem.arquivo}
          alt={imagem.alt}
          fill
          sizes={imagem.sizes}
          quality={qualidade}
          className={`object-cover ${imgClassName}`}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`relative grid place-items-center bg-reserva ${className}`}
      style={proporcao}
    >
      {process.env.NODE_ENV !== "production" && (
        <span className="px-4 text-center text-xs font-semibold text-tinta-suave">
          {imagem.arquivo.replace("/images/", "")}
        </span>
      )}
    </div>
  );
}
