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
            <div className="hidden md:flex justify-end">
              <CategoryForm mode="create" />
            </div>

            <CategoryList />
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
