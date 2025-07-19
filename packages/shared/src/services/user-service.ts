import { supabase } from "./config";
import { User, UserRole, UserWithFeatures } from "@clarity/types";

export class UserService {
  static async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows returned
      throw error;
    }
    return data;
  }

  static async createUser(userData: {
    id: string;
    email: string;
    display_name: string;
    role?: UserRole;
    profile_image?: string;
    theme?: "light" | "dark" | "system";
  }): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUserRole(
    userId: string,
    role: UserRole,
    updatedBy: string
  ): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .update({
        role,
        role_updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAllUsers(): Promise<UserWithFeatures[]> {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,
        feature_subscriptions!feature_subscriptions_user_id_fkey (
          id,
          feature_flag,
          feature_name,
          status,
          granted_at,
          granted_by,
          revoked_at,
          revoked_by,
          notes
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as UserWithFeatures[];
  }

  static async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) throw error;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows returned
      throw error;
    }
    return data;
  }

  static async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) return false;
    return data?.role === "admin";
  }
}

export default UserService;
