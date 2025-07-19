import { TransactionSkeleton } from "@/components/ui/loading";

interface TransactionSkeletonListProps {
  count?: number;
  className?: string;
}

export function TransactionSkeletonList({
  count = 5,
  className,
}: TransactionSkeletonListProps) {
  return (
    <div className={`space-y-4 ${className || ""}`}>
      {Array.from({ length: count }).map((_, index) => (
        <TransactionSkeleton key={index} />
      ))}
    </div>
  );
}
