import Image from "next/image";
import { existsInPublic } from "@/lib/files";

type ProductPhotoProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

function isMissingLocalFile(src: string) {
  return src.startsWith("/") && !existsInPublic(src);
}

export function ProductPhoto({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
}: ProductPhotoProps) {
  if (isMissingLocalFile(src)) {
    return (
      <div
        aria-hidden="true"
        className={`relative aspect-square bg-muted ${className}`}
      />
    );
  }

  return (
    <div className={`relative aspect-square ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
