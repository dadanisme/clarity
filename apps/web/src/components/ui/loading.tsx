import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function Spinner({ size = "default", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2
      className={cn("animate-spin", sizeClasses[size], className)}
      aria-label="Loading"
    />
  );
}

interface LoadingTextProps {
  text?: string;
  className?: string;
}

export function LoadingText({
  text = "Loading...",
  className,
}: LoadingTextProps) {
  return (
    <div className={cn("text-muted-foreground text-center", className)}>
      {text}
    </div>
  );
}

interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function LoadingSpinner({
  text = "Loading...",
  size = "default",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <Spinner size={size} />
      {text && <LoadingText text={text} />}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

interface TransactionSkeletonProps {
  className?: string;
}

export function TransactionSkeleton({ className }: TransactionSkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border rounded-lg",
        className
      )}
    >
      <div className="flex items-center space-x-4">
        <Skeleton className="w-3 h-3 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

interface CategorySkeletonProps {
  className?: string;
}

export function CategorySkeleton({ className }: CategorySkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border rounded-lg",
        className
      )}
    >
      <div className="flex items-center space-x-3">
        <Skeleton className="w-4 h-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-16 rounded" />
    </div>
  );
}

interface DashboardCardSkeletonProps {
  className?: string;
}

export function DashboardCardSkeleton({
  className,
}: DashboardCardSkeletonProps) {
  return (
    <div className={cn("p-6 border rounded-lg", className)}>
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

interface PageLoadingProps {
  text?: string;
  className?: string;
}

export function PageLoading({
  text = "Loading...",
  className,
}: PageLoadingProps) {
  return (
    <div
      className={cn("min-h-screen flex items-center justify-center", className)}
    >
      <LoadingSpinner text={text} size="lg" />
    </div>
  );
}

interface ContentLoadingProps {
  text?: string;
  className?: string;
}

export function ContentLoading({
  text = "Loading...",
  className,
}: ContentLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <LoadingSpinner text={text} />
    </div>
  );
}
