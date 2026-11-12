import Image from "next/image";
import { existsInPublic } from "@/lib/files";
import type { ImageAsset } from "@/lib/images";

type PhotoProps = {
  image: ImageAsset;
  className?: string;
  // Classes da <img> (ex.: ponto de corte com object-position).
  imgClassName?: string;
  // true: a proporção vem do className (ex.: uma proporção no celular e outra no desktop),
  // em vez da proporção fixa do registro.
  customAspectRatio?: boolean;
  // Qualidade da imagem otimizada (75 ou 90, veja images.qualities no next.config.ts).
  quality?: 75 | 90;
};

// Mostra a foto se o arquivo existir em public/. Se não existir, um bloco liso na proporção
// exata da foto, para o layout não mudar quando ela chegar.
export function Photo({
  image,
  className = "",
  imgClassName = "",
  customAspectRatio = false,
  quality = 75,
}: PhotoProps) {
  const aspectRatio = customAspectRatio
    ? undefined
    : { aspectRatio: `${image.width} / ${image.height}` };

  if (existsInPublic(image.file)) {
    return (
      <div className={`relative ${className}`} style={aspectRatio}>
        <Image
          src={image.file}
          alt={image.alt}
          fill
          sizes={image.sizes}
          quality={quality}
          className={`object-cover ${imgClassName}`}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`relative grid place-items-center bg-muted ${className}`}
      style={aspectRatio}
    >
      {process.env.NODE_ENV !== "production" && (
        <span className="px-4 text-center text-xs font-semibold text-ink-soft">
          {image.file.replace("/images/", "")}
        </span>
      )}
    </div>
  );
}
