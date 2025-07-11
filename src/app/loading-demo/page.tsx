import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Spinner,
  LoadingSpinner,
  LoadingText,
  Skeleton,
  CardSkeleton,
  TransactionSkeleton,
  CategorySkeleton,
  DashboardCardSkeleton,
  PageLoading,
  ContentLoading,
} from "@/components/ui/loading";
import { TransactionSkeletonList } from "@/components/transactions/transaction-skeleton-list";
import { CategorySkeletonList } from "@/components/categories/category-skeleton-list";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export const metadata: Metadata = {
  title: "Loading Components Demo - Clarity",
  description: "Demo of all loading components",
};

export default function LoadingDemoPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Loading Components Demo</h1>
          <p className="text-muted-foreground">
            Showcase of all loading states and components
          </p>
        </div>

        {/* Basic Loading Components */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Loading Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Spinner Sizes</h3>
                <div className="flex items-center gap-4">
                  <Spinner size="sm" />
                  <Spinner size="default" />
                  <Spinner size="lg" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Loading Text</h3>
                <LoadingText text="Custom loading message..." />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Loading Spinner</h3>
                <LoadingSpinner text="Loading with spinner" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton Components */}
        <Card>
          <CardHeader>
            <CardTitle>Skeleton Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Basic Skeleton</h3>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Card Skeleton</h3>
                <CardSkeleton />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Transaction Skeleton</h3>
                <TransactionSkeleton />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Category Skeleton</h3>
                <CategorySkeleton />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Dashboard Card Skeleton</h3>
              <DashboardCardSkeleton />
            </div>
          </CardContent>
        </Card>

        {/* Skeleton Lists */}
        <Card>
          <CardHeader>
            <CardTitle>Skeleton Lists</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Transaction Skeleton List</h3>
                <TransactionSkeletonList count={3} />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Category Skeleton List</h3>
                <CategorySkeletonList count={3} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Dashboard Skeleton</h3>
              <DashboardSkeleton />
            </div>
          </CardContent>
        </Card>

        {/* Page Loading States */}
        <Card>
          <CardHeader>
            <CardTitle>Page Loading States</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Page Loading (Full Screen)</h3>
                <div className="h-32 border rounded-lg flex items-center justify-center">
                  <PageLoading text="Loading page..." />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Content Loading</h3>
                <div className="h-32 border rounded-lg flex items-center justify-center">
                  <ContentLoading text="Loading content..." />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">In Components:</h3>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                {`// For page-level loading
if (loading) {
  return <PageLoading text="Authenticating..." />;
}

// For content loading
if (isLoading) {
  return <ContentLoading text="Loading transactions..." />;
}

// For skeleton loading
if (isLoading) {
  return <TransactionSkeletonList count={8} />;
}

// For button loading
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner size="sm" />
      Loading...
    </>
  ) : (
    "Submit"
  )}
</Button>`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
