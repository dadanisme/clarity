import { CategorySkeleton } from "@/components/ui/loading";

interface CategorySkeletonListProps {
  count?: number;
  className?: string;
}

export function CategorySkeletonList({
  count = 5,
  className,
}: CategorySkeletonListProps) {
  return (
    <div className={`space-y-4 ${className || ""}`}>
      {Array.from({ length: count }).map((_, index) => (
        <CategorySkeleton key={index} />
      ))}
    </div>
  );
}
