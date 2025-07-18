import { supabase } from "./config";
import { Transaction } from "@/types";

export class TransactionsService {
  static async getTransactions(
    userId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      category_id?: string;
      type?: "income" | "expense";
    }
  ): Promise<Transaction[]> {
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        categories (*)
      `
      )
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (options?.startDate) {
      query = query.gte("date", options.startDate.toISOString());
    }

    if (options?.endDate) {
      query = query.lte("date", options.endDate.toISOString());
    }

    if (options?.category_id) {
      query = query.eq("category_id", options.category_id);
    }

    if (options?.type) {
      query = query.eq("type", options.type);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createTransaction(
    userId: string,
    transactionData: {
      amount: number;
      type: "income" | "expense";
      category_id: string;
      description?: string;
      date: Date;
    }
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          amount: transactionData.amount,
          type: transactionData.type,
          category_id: transactionData.category_id,
          description: transactionData.description,
          date: transactionData.date.toISOString(),
          user_id: userId,
        },
      ])
      .select(
        `
        *,
        categories (*)
      `
      )
      .single();

    if (error) throw error;
    return data;
  }

  static async createMultipleTransactions(
    userId: string,
    transactionsData: Omit<
      Transaction,
      "id" | "user_id" | "created_at" | "updated_at"
    >[]
  ): Promise<Transaction[]> {
    const transactionsWithUserId = transactionsData.map((transaction) => ({
      ...transaction,
      user_id: userId,
    }));

    const { data, error } = await supabase
      .from("transactions")
      .insert(transactionsWithUserId).select(`
        *,
        categories (*)
      `);

    if (error) throw error;
    return data || [];
  }

  static async updateTransaction(
    transactionId: string,
    updates: Partial<
      Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">
    >
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", transactionId)
      .select(
        `
        *,
        categories (*)
      `
      )
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTransaction(
    transactionId: string
  ): Promise<{ user_id: string }> {
    const { data, error } = await supabase
      .from("transactions")
      .select("user_id")
      .eq("id", transactionId)
      .single();

    if (error) throw error;

    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId);

    if (deleteError) throw error;

    return { user_id: data.user_id };
  }

  static async getTransactionById(
    transactionId: string
  ): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        categories (*)
      `
      )
      .eq("id", transactionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows returned
      throw error;
    }
    return data;
  }

  static async getRecentTransactions(
    userId: string,
    limit: number = 10
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        categories (*)
      `
      )
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getTransactionsByCategory(
    userId: string,
    category_id: string
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        categories (*)
      `
      )
      .eq("user_id", userId)
      .eq("category_id", category_id)
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getTransactionSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  }> {
    let query = supabase
      .from("transactions")
      .select("amount, type")
      .eq("user_id", userId);

    if (startDate) {
      query = query.gte("date", startDate.toISOString());
    }

    if (endDate) {
      query = query.lte("date", endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const summary = (data || []).reduce(
      (acc, transaction) => {
        const amount = parseFloat(transaction.amount.toString());
        if (transaction.type === "income") {
          acc.totalIncome += amount;
        } else {
          acc.totalExpense += amount;
        }
        acc.transactionCount++;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 }
    );

    summary.balance = summary.totalIncome - summary.totalExpense;
    return summary;
  }

  static subscribeToTransactions(
    userId: string,
    callback: (transactions: Transaction[]) => void
  ) {
    return supabase
      .channel("transactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const transactions = await this.getTransactions(userId);
          callback(transactions);
        }
      )
      .subscribe();
  }
}

export default TransactionsService;
