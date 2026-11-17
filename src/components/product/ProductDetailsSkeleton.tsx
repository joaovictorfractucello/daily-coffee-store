export function ProductDetailsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mb-6 h-3 w-56 bg-muted" />
      <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-12">
        <div className="aspect-square bg-muted" />
        <div>
          <div className="h-10 w-3/4 bg-muted" />
          <div className="mt-4 h-7 w-28 bg-muted" />
          <div className="mt-6 h-12 bg-muted" />
          <div className="mt-8 h-24 bg-muted" />
        </div>
      </div>
    </div>
  );
}
