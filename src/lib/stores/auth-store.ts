import { create } from 'zustand';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/config";
import {
  createUser,
  getUser,
  subscribeToUser,
  createDefaultCategories,
  updateUser,
  uploadProfileImage as uploadProfileImageToStorage,
  deleteProfileImage,
} from "@/lib/firebase/services";
import { User, UserRole, Theme } from "@/types";

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, "displayName" | "profileImage">>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<void>;
  removeProfileImage: () => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => {
  let userUnsubscribe: (() => void) | null = null;
  
  return {
    // State
    user: null,
    firebaseUser: null,
    loading: true,
    initialized: false,

    // Actions
    signIn: async (email: string, password: string) => {
      await signInWithEmailAndPassword(auth, email, password);
    },

    signInWithGoogle: async () => {
      await signInWithPopup(auth, googleProvider);
    },

    signUp: async (email: string, password: string, displayName: string) => {
      const { user: newFirebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateFirebaseProfile(newFirebaseUser, { displayName });
    },

    updateProfile: async (updates: Partial<Pick<User, "displayName" | "profileImage">>) => {
      const { firebaseUser } = get();
      
      if (!firebaseUser) {
        throw new Error("No user logged in");
      }

      // Update Firebase Auth profile if displayName is being updated
      if (updates.displayName) {
        await updateFirebaseProfile(firebaseUser, {
          displayName: updates.displayName,
        });
      }

      // Update Firestore user document
      await updateUser(firebaseUser.uid, updates);

      // Local state will be updated automatically via real-time listener
    },

    uploadProfileImage: async (file: File) => {
      const { firebaseUser, user } = get();
      
      if (!firebaseUser) {
        throw new Error("No user logged in");
      }

      // Delete old image if it exists and is not from Google
      if (
        user?.profileImage &&
        !user.profileImage.includes("googleusercontent.com")
      ) {
        await deleteProfileImage(user.profileImage);
      }

      // Upload new image
      const imageUrl = await uploadProfileImageToStorage(firebaseUser.uid, file);

      // Update user profile
      await get().updateProfile({ profileImage: imageUrl });
    },

    removeProfileImage: async () => {
      const { firebaseUser, user } = get();
      
      if (!firebaseUser) {
        throw new Error("No user logged in");
      }

      // Delete image from storage if it exists and is not from Google
      if (
        user?.profileImage &&
        !user.profileImage.includes("googleusercontent.com")
      ) {
        await deleteProfileImage(user.profileImage);
      }

      // Update user profile
      await get().updateProfile({ profileImage: undefined });
    },

    logout: async () => {
      await signOut(auth);
    },

    initializeAuth: () => {
      if (get().initialized) return;

      set({ initialized: true });

      const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        set({ firebaseUser });

        // Clean up previous user listener
        if (userUnsubscribe) {
          userUnsubscribe();
          userUnsubscribe = null;
        }

        if (firebaseUser) {
          try {
            let userData = await getUser(firebaseUser.uid);

            // If user document doesn't exist, create it
            if (!userData) {
              const newUserData = {
                displayName: firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                role: UserRole.USER,
                profileImage: firebaseUser.photoURL || undefined,
                settings: {
                  theme: Theme.SYSTEM,
                },
              };
              userData = await createUser(firebaseUser.uid, newUserData);

              // Create default categories for new users
              try {
                await createDefaultCategories(firebaseUser.uid);
              } catch (error) {
                console.error("Error creating default categories:", error);
              }
            }

            // Set up real-time listener for user data
            userUnsubscribe = subscribeToUser(firebaseUser.uid, (updatedUser) => {
              set({ user: updatedUser, loading: false });
            });

          } catch (error) {
            console.error("Error fetching user data:", error);
            set({ loading: false });
          }
        } else {
          set({ user: null, loading: false });
        }
      });

      // Return cleanup function
      return () => {
        authUnsubscribe();
        if (userUnsubscribe) {
          userUnsubscribe();
        }
      };
    },
  };
});

// Initialize auth on module load (client-side only)
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth();
}