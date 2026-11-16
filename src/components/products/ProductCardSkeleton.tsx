export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-square bg-muted" />
      <div className="mt-4 h-4 w-3/4 bg-muted" />
      <div className="mt-3 h-10 bg-muted" />
      <div className="mt-2 h-4 w-1/4 bg-muted" />
    </div>
  );
}
