import { supabase } from "./config";
import { Category, CategoryWithCount } from "@/types";

export class CategoriesService {
  static async getCategories(userId: string): Promise<CategoryWithCount[]> {
    const { data, error } = await supabase
      .from("categories")
      .select(`
        *,
        transactions!category_id(count)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return (data || []).map(category => ({
      ...category,
      count: category.transactions?.[0]?.count || 0
    })).sort((a, b) => b.count - a.count);
  }

  static async createCategory(
    userId: string,
    categoryData: {
      name: string;
      type: "income" | "expense";
      color: string;
      is_default: boolean;
    }
  ): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name: categoryData.name,
          type: categoryData.type,
          color: categoryData.color,
          is_default: categoryData.is_default,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCategory(
    category_id: string,
    updates: Partial<
      Omit<Category, "id" | "user_id" | "created_at" | "updated_at">
    >
  ): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", category_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCategory(
    category_id: string
  ): Promise<{ user_id: string }> {
    const { data, error } = await supabase
      .from("categories")
      .select("user_id")
      .eq("id", category_id)
      .single();

    if (error) throw error;

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", category_id);

    if (deleteError) throw deleteError;

    return { user_id: data.user_id }; // for invalidating the query
  }

  static async getCategoryById(category_id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", category_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows returned
      throw error;
    }
    return data;
  }

  static async getCategoriesByType(
    userId: string,
    type: "income" | "expense"
  ): Promise<CategoryWithCount[]> {
    const { data, error } = await supabase
      .from("categories")
      .select(`
        *,
        transactions!category_id(count)
      `)
      .eq("user_id", userId)
      .eq("type", type)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return (data || []).map(category => ({
      ...category,
      count: category.transactions?.[0]?.count || 0
    })).sort((a, b) => b.count - a.count);
  }

  static async getDefaultCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .eq("is_default", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static subscribeToCategories(
    userId: string,
    callback: (categories: Category[]) => void
  ) {
    return supabase
      .channel("categories")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const categories = await this.getCategories(userId);
          callback(categories);
        }
      )
      .subscribe();
  }
}

export default CategoriesService;
