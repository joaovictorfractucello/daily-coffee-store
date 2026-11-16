"use client";

import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { headerCopy } from "@/data/copy";
import { menuLink } from "@/lib/links";

const SEARCH_ICON_SIZE = 22;

type HeaderSearchProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HeaderSearch({ open, onOpenChange }: HeaderSearchProps) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus({ preventScroll: true });

    function closeOnOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      onOpenChange(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onOpenChange]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTerm = term.trim();
    onOpenChange(false);
    if (!trimmedTerm) return;

    router.push(`${menuLink}?q=${encodeURIComponent(trimmedTerm)}`);
  }

  function handleButtonClick() {
    if (!open) {
      onOpenChange(true);
      return;
    }
    formRef.current?.requestSubmit();
  }

  return (
    <div ref={rootRef} data-open={open} className="header-search">
      <form
        ref={formRef}
        role="search"
        inert={!open}
        onSubmit={submitSearch}
        className="header-search-pill"
      >
        <label htmlFor={inputId} className="sr-only">
          {headerCopy.searchLabel}
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="search"
          name="q"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          maxLength={60}
          autoComplete="off"
          placeholder={headerCopy.searchPlaceholder}
          className="header-search-field"
        />
      </form>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={inputId}
        aria-label={open ? headerCopy.submitSearch : headerCopy.openSearch}
        onClick={handleButtonClick}
        className="header-search-button"
      >
        <MagnifyingGlass aria-hidden="true" size={SEARCH_ICON_SIZE} />
      </button>
    </div>
  );
}
