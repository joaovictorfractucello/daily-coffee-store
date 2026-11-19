import { cartPage } from "@/data/copy";

export function CartSkeleton() {
  return (
    <div
      role="status"
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14"
    >
      <span className="sr-only">{cartPage.loading}</span>
      <ul aria-hidden="true">
        {[0, 1].map((row) => (
          <li
            key={row}
            className="flex gap-4 border-b border-line py-5 first:pt-0"
          >
            <div className="aspect-square w-20 shrink-0 bg-muted sm:w-24" />
            <div className="flex-1">
              <div className="h-4 w-1/2 bg-muted" />
              <div className="mt-3 h-4 w-1/4 bg-muted" />
              <div className="mt-4 h-11 w-32 bg-muted" />
            </div>
          </li>
        ))}
      </ul>
      <div aria-hidden="true" className="h-48 bg-muted" />
    </div>
  );
}
