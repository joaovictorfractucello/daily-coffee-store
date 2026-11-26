import {
  CaretRight,
  MapPin,
  Receipt,
  Storefront,
  User,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import { authCopy } from "@/data/copy";
import { aboutLink, accountAddressesLink, accountDataLink } from "@/lib/links";
import { accountCardClass, accountListClass } from "./list-styles";

const copy = authCopy.account;

export type AccountSection = "home" | "data" | "addresses";

type MenuItem = {
  label: string;
  icon: Icon;
  // Sem link: ainda não existe (pedidos na Etapa 6).
  href?: string;
  section?: AccountSection;
};

const items: MenuItem[] = [
  {
    label: copy.personalData,
    icon: User,
    href: accountDataLink,
    section: "data",
  },
  { label: copy.orders, icon: Receipt },
  {
    label: copy.addresses,
    icon: MapPin,
    href: accountAddressesLink,
    section: "addresses",
  },
  { label: copy.about, icon: Storefront, href: aboutLink },
];

type AccountMenuProps = {
  active?: AccountSection;
  // "cards": lista do celular, um card com borda por item. "nav": menu lateral do desktop.
  variant?: "cards" | "nav";
};

const navItemClass =
  "flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[0.9375rem] font-semibold";

function ComingSoon() {
  return (
    <span className="ml-auto rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold">
      {copy.comingSoon}
    </span>
  );
}

export function AccountMenu({ active, variant = "cards" }: AccountMenuProps) {
  const isNav = variant === "nav";

  return (
    <ul className={isNav ? "flex flex-col gap-1" : accountListClass}>
      {items.map((item) => {
        const isActive = item.section !== undefined && item.section === active;
        const icon = (
          <item.icon aria-hidden="true" size={20} className="text-ink" />
        );

        if (!item.href) {
          return (
            <li
              key={item.label}
              className={`${isNav ? navItemClass : accountCardClass} text-ink-soft`}
            >
              {icon}
              <span>{item.label}</span>
              <ComingSoon />
            </li>
          );
        }

        const linkClass = isNav
          ? `${navItemClass} transition-colors duration-150 ${isActive ? "bg-muted text-accent" : "hover:bg-muted/60"}`
          : `${accountCardClass} transition-colors duration-150 hover:border-ink-soft/60`;

        return (
          <li key={item.label}>
            <Link
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={linkClass}
            >
              {icon}
              <span className="flex-1">{item.label}</span>
              {!isNav && (
                <CaretRight
                  aria-hidden="true"
                  size={18}
                  className="text-ink-soft"
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
