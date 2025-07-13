"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
  createDefaultCategories,
  updateUser,
  uploadProfileImage as uploadProfileImageToStorage,
  deleteProfileImage,
} from "@/lib/firebase/services";
import { User, UserRole, Theme } from "@/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  updateProfile: (
    updates: Partial<Pick<User, "displayName" | "profileImage">>
  ) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<void>;
  removeProfileImage: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

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

          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    const { user: newFirebaseUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update the display name
    await updateFirebaseProfile(newFirebaseUser, { displayName });
  };

  const updateProfile = async (
    updates: Partial<Pick<User, "displayName" | "profileImage">>
  ) => {
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

    // Update local user state
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const uploadProfileImage = async (file: File) => {
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
    await updateProfile({ profileImage: imageUrl });
  };

  const removeProfileImage = async () => {
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
    await updateProfile({ profileImage: undefined });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    updateProfile,
    uploadProfileImage,
    removeProfileImage,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
