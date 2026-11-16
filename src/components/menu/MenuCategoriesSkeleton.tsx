import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";

const SKELETON_CARDS = 8;

export function MenuCategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
      {Array.from({ length: SKELETON_CARDS }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
