import Image from "next/image";
import Link from "next/link";
import { authCopy } from "@/data/copy";
import { menuLink } from "@/lib/links";

const copy = authCopy.account;

// Mesmo estilo do banner da home: fundo café, texto claro e foto. Vira o último pedido na Etapa 6.
export function NoOrdersBanner() {
  return (
    <section className="relative overflow-hidden rounded-[1.5rem] bg-dark px-5 py-6 text-light md:px-8 md:py-8">
      <div className="relative z-10 max-w-[60%]">
        <h2 className="heading-soft text-[1.125rem] md:text-[1.75rem]">
          {copy.noOrdersTitle}
        </h2>
        <p className="mt-1 text-sm text-light/75 md:text-base">
          {copy.noOrdersText}
        </p>
        <Link
          href={menuLink}
          className="button mt-4 min-h-10 bg-light px-4 py-2 text-sm text-dark [--overlay:rgb(42_29_22/0.1)] md:min-h-12 md:px-6 md:text-base"
        >
          {copy.seeMenu}
        </Link>
      </div>
      <div className="absolute -right-6 -bottom-8 size-40 overflow-hidden rounded-full md:-right-4 md:-bottom-10 md:size-52">
        <Image
          src="/images/produtos/espresso.webp"
          alt=""
          fill
          sizes="(min-width: 768px) 208px, 160px"
          className="object-cover"
        />
      </div>
    </section>
  );
}
