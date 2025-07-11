import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { CategoryList } from "@/components/categories/category-list";
import { CategoryForm } from "@/components/categories/category-form";

export const metadata: Metadata = {
  title: "Categories | Clarity",
  description: "Manage your transaction categories",
};

export default function CategoriesPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Categories
                </h1>
                <p className="text-muted-foreground">
                  Organize your transactions with categories
                </p>
              </div>
              <div className="flex justify-end sm:justify-end">
                <CategoryForm mode="create" />
              </div>
            </div>

            <CategoryList />
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
