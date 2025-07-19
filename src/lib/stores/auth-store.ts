import { create } from "zustand";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  AuthService,
  UserService,
  CategoriesService,
  supabase,
} from "@/lib/supabase";
import { User, UserRole, Theme } from "@/types";
import { PATHS } from "@/lib/paths";

interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  updateProfile: (
    updates: Partial<Pick<User, "display_name" | "profile_image">>
  ) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<void>;
  removeProfileImage: () => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => {
  return {
    // State
    user: null,
    supabaseUser: null,
    loading: true,
    initialized: false,

    // Actions
    signIn: async (email: string, password: string) => {
      await AuthService.signIn(email, password);
    },

    signInWithGoogle: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${PATHS.authCallback}`,
        },
      });
      if (error) throw error;
    },

    signUp: async (email: string, password: string, displayName: string) => {
      const { user: newSupabaseUser } = await AuthService.signUp(
        email,
        password,
        displayName
      );

      if (newSupabaseUser) {
        // Create user record in our database
        await UserService.createUser({
          id: newSupabaseUser.id,
          email: newSupabaseUser.email!,
          display_name: displayName,
          role: UserRole.USER,
          theme: Theme.SYSTEM,
        });
      }
    },

    updateProfile: async (
      updates: Partial<Pick<User, "display_name" | "profile_image">>
    ) => {
      const { supabaseUser } = get();

      if (!supabaseUser) {
        throw new Error("No user logged in");
      }

      // Update user in database
      await UserService.updateUser(supabaseUser.id, updates);

      // Local state will be updated automatically via real-time listener
    },

    uploadProfileImage: async (file: File) => {
      const { supabaseUser } = get();

      if (!supabaseUser) {
        throw new Error("No user logged in");
      }

      // Convert file to base64 (keeping same approach as Firebase)
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const base64Image = await base64Promise;

      // Update user profile with base64 image
      await get().updateProfile({ profile_image: base64Image });
    },

    removeProfileImage: async () => {
      const { supabaseUser } = get();

      if (!supabaseUser) {
        throw new Error("No user logged in");
      }

      // Update user profile to remove image
      await get().updateProfile({ profile_image: undefined });
    },

    logout: async () => {
      await AuthService.signOut();
    },

    initializeAuth: () => {
      if (get().initialized) return;

      set({ initialized: true });

      const {
        data: { subscription },
      } = AuthService.onAuthStateChange(async (supabaseUser) => {
        set({ supabaseUser });

        if (supabaseUser) {
          try {
            let userData = await UserService.getUser(supabaseUser.id);

            // If user document doesn't exist, create it
            if (!userData) {
              const newUserData = {
                id: supabaseUser.id,
                email: supabaseUser.email!,
                display_name:
                  supabaseUser.user_metadata?.display_name || "User",
                role: UserRole.USER,
                profile_image:
                  supabaseUser.user_metadata?.avatar_url || undefined,
                theme: Theme.SYSTEM,
              };
              userData = await UserService.createUser(newUserData);

              // Create default categories for new users
              try {
                await createDefaultCategories(supabaseUser.id);
              } catch (error) {
                console.error("Error creating default categories:", error);
              }
            }

            set({ user: userData, loading: false });
          } catch (error) {
            console.error("Error fetching user data:", error);
            set({ loading: false });
          }
        } else {
          set({ user: null, loading: false });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    },
  };
});

// Create default categories for new users
async function createDefaultCategories(userId: string) {
  const defaultCategories = [
    {
      name: "Food & Dining",
      type: "expense" as const,
      color: "#FF6B6B",
      is_default: true,
    },
    {
      name: "Transportation",
      type: "expense" as const,
      color: "#4ECDC4",
      is_default: true,
    },
    {
      name: "Shopping",
      type: "expense" as const,
      color: "#45B7D1",
      is_default: true,
    },
    {
      name: "Entertainment",
      type: "expense" as const,
      color: "#FFA07A",
      is_default: true,
    },
    {
      name: "Bills & Utilities",
      type: "expense" as const,
      color: "#98D8C8",
      is_default: true,
    },
    {
      name: "Healthcare",
      type: "expense" as const,
      color: "#F7DC6F",
      is_default: true,
    },
    {
      name: "Education",
      type: "expense" as const,
      color: "#BB8FCE",
      is_default: true,
    },
    {
      name: "Travel",
      type: "expense" as const,
      color: "#85C1E9",
      is_default: true,
    },
    {
      name: "Salary",
      type: "income" as const,
      color: "#58D68D",
      is_default: true,
    },
    {
      name: "Business",
      type: "income" as const,
      color: "#52C41A",
      is_default: true,
    },
    {
      name: "Investment",
      type: "income" as const,
      color: "#73D13D",
      is_default: true,
    },
    {
      name: "Other Income",
      type: "income" as const,
      color: "#95F985",
      is_default: true,
    },
  ];

  for (const category of defaultCategories) {
    try {
      await CategoriesService.createCategory(userId, category);
    } catch (error) {
      console.error("Error creating category:", category.name, error);
    }
  }
}

// Initialize auth on module load (client-side only)
if (typeof window !== "undefined") {
  useAuthStore.getState().initializeAuth();
}
