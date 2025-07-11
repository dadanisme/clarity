import { Metadata } from "next";
import { CategoryList } from "@/components/categories/category-list";
import { CategoryForm } from "@/components/categories/category-form";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";

export const metadata: Metadata = {
  title: "Categories | Clarity",
  description: "Manage your transaction categories",
};

export default function CategoriesPage() {
  return (
    <DashboardLayoutClient>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">
              Organize your transactions with categories
            </p>
          </div>
          <CategoryForm mode="create" />
        </div>

        <CategoryList />
      </div>
    </DashboardLayoutClient>
  );
}
