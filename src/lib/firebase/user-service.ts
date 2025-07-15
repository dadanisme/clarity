import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./config";
import { User, UserRole } from "@/types";

export class UserService {
  // Get a single user by ID
  static async getUser(userId: string): Promise<User | null> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as User;
    }
    return null;
  }

  // Subscribe to real-time user updates
  static subscribeToUser(
    userId: string,
    onUpdate: (user: User | null) => void
  ) {
    const userRef = doc(db, "users", userId);

    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const user: User = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as User;
        onUpdate(user);
      } else {
        onUpdate(null);
      }
    });
  }

  // Create a new user
  static async createUser(
    userId: string,
    userData: Omit<User, "id" | "createdAt">
  ): Promise<User> {
    const userRef = doc(db, "users", userId);

    // Create user object, excluding undefined profileImage
    const user: Omit<User, "id"> = {
      displayName: userData.displayName,
      email: userData.email,
      role: userData.role,
      settings: userData.settings,
      createdAt: new Date(),
    };

    // Only add profileImage if it's not undefined
    if (userData.profileImage !== undefined) {
      (user as User).profileImage = userData.profileImage;
    }

    await setDoc(userRef, user);
    return { id: userId, ...user };
  }

  // Update user profile
  static async updateUser(
    userId: string,
    updates: Partial<Pick<User, "displayName" | "profileImage">>
  ): Promise<void> {
    const userRef = doc(db, "users", userId);

    // Filter out undefined values as Firestore doesn't support them
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await updateDoc(userRef, { ...cleanUpdates, updatedAt: new Date() });
  }

  // Update user settings
  static async updateUserSettings(
    userId: string,
    settings: User["settings"]
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { settings });
  }

  // Update user role (admin only)
  static async updateUserRole(
    userId: string,
    role: UserRole,
    updatedBy: string
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role,
      updatedAt: new Date(),
      roleUpdatedBy: updatedBy,
    });
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<User[]> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as User[];
  }

  // Subscribe to all users (admin only)
  static subscribeToAllUsers(onUpdate: (users: User[]) => void) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as User[];

        onUpdate(users);
      },
      (error) => {
        console.error("Error subscribing to users:", error);
        onUpdate([]);
      }
    );
  }

  // Check if user is admin
  static async isAdmin(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    return user?.role === UserRole.ADMIN;
  }
}
