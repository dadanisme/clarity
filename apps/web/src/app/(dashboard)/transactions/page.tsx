import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { TransactionsContent } from "@/components/transactions/transactions-content";

export const metadata: Metadata = {
  title: "Transactions | Clarity",
  description: "View and manage your financial transactions",
};

export default function TransactionsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <TransactionsContent />
      </DashboardLayout>
    </AuthGuard>
  );
}
