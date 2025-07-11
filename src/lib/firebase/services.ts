import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./config";
import type { User, Category, Transaction } from "@/types";

// User services
export const createUser = async (
  userId: string,
  userData: Omit<User, "id" | "createdAt">
) => {
  const userRef = doc(db, "users", userId);

  // Create user object, excluding undefined profileImage
  const user: Omit<User, "id"> = {
    displayName: userData.displayName,
    email: userData.email,
    settings: userData.settings,
    createdAt: new Date(),
  };

  // Only add profileImage if it's not undefined
  if (userData.profileImage !== undefined) {
    (user as User).profileImage = userData.profileImage;
  }

  await setDoc(userRef, user);
  return { id: userId, ...user };
};

export const getUser = async (userId: string): Promise<User | null> => {
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
};

export const updateUserSettings = async (
  userId: string,
  settings: User["settings"]
) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { settings });
};

export const updateUser = async (
  userId: string,
  updates: Partial<Pick<User, "displayName" | "profileImage">>
) => {
  const userRef = doc(db, "users", userId);

  // Filter out undefined values as Firestore doesn't support them
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  await updateDoc(userRef, { ...cleanUpdates, updatedAt: new Date() });
};

// Image upload services
export const uploadProfileImage = async (
  userId: string,
  file: File
): Promise<string> => {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Image must be less than 5MB");
  }

  // Create a unique filename
  const fileExtension = file.name.split(".").pop();
  const fileName = `profile-images/${userId}/${Date.now()}.${fileExtension}`;

  // Upload to Firebase Storage
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);

  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
};

export const deleteProfileImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const path = decodeURIComponent(
      url.pathname.split("/o/")[1]?.split("?")[0] || ""
    );

    if (path) {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    }
  } catch (error) {
    console.error("Error deleting profile image:", error);
    // Don't throw error as the image might not exist or be from Google
  }
};

// Category services
export const getCategories = async (userId: string): Promise<Category[]> => {
  const categoriesRef = collection(db, "users", userId, "categories");
  const q = query(categoriesRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Category[];
};

export const createCategory = async (
  userId: string,
  categoryData: Omit<Category, "id" | "createdAt">
) => {
  const categoriesRef = collection(db, "users", userId, "categories");
  const category: Omit<Category, "id"> = {
    ...categoryData,
    createdAt: new Date(),
  };

  const docRef = await addDoc(categoriesRef, category);
  return { id: docRef.id, ...category };
};

export const updateCategory = async (
  userId: string,
  categoryId: string,
  updates: Partial<Category>
) => {
  const categoryRef = doc(db, "users", userId, "categories", categoryId);
  await updateDoc(categoryRef, { ...updates, updatedAt: new Date() });
};

export const deleteCategory = async (userId: string, categoryId: string) => {
  const categoryRef = doc(db, "users", userId, "categories", categoryId);
  await deleteDoc(categoryRef);
};

export const createDefaultCategories = async (userId: string) => {
  const defaultCategories = [
    // Income categories
    {
      name: "Salary",
      type: "income" as const,
      color: "#22c55e",
      icon: "dollar-sign",
      isDefault: true,
    },
    {
      name: "Freelance",
      type: "income" as const,
      color: "#06b6d4",
      icon: "briefcase",
      isDefault: true,
    },
    {
      name: "Investment",
      type: "income" as const,
      color: "#8b5cf6",
      icon: "trending-up",
      isDefault: true,
    },
    {
      name: "Other Income",
      type: "income" as const,
      color: "#84cc16",
      icon: "plus-circle",
      isDefault: true,
    },
    // Expense categories
    {
      name: "Food & Dining",
      type: "expense" as const,
      color: "#ef4444",
      icon: "utensils",
      isDefault: true,
    },
    {
      name: "Transportation",
      type: "expense" as const,
      color: "#f97316",
      icon: "car",
      isDefault: true,
    },
    {
      name: "Shopping",
      type: "expense" as const,
      color: "#eab308",
      icon: "shopping-bag",
      isDefault: true,
    },
    {
      name: "Bills & Utilities",
      type: "expense" as const,
      color: "#3b82f6",
      icon: "zap",
      isDefault: true,
    },
    {
      name: "Entertainment",
      type: "expense" as const,
      color: "#ec4899",
      icon: "music",
      isDefault: true,
    },
    {
      name: "Healthcare",
      type: "expense" as const,
      color: "#6b7280",
      icon: "heart",
      isDefault: true,
    },
  ];

  const categoriesRef = collection(db, "users", userId, "categories");

  // Create all default categories
  const promises = defaultCategories.map((category) => {
    const categoryData: Omit<Category, "id" | "createdAt"> = {
      ...category,
    };
    return addDoc(categoriesRef, { ...categoryData, createdAt: new Date() });
  });

  await Promise.all(promises);
};

// Transaction services
export const getTransactions = async (
  userId: string,
  limitCount = 50
): Promise<Transaction[]> => {
  const transactionsRef = collection(db, "users", userId, "transactions");
  const q = query(transactionsRef, orderBy("date", "desc"), limit(limitCount));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Transaction[];
};

export const getTransactionsByCategory = async (
  userId: string,
  categoryId: string
): Promise<Transaction[]> => {
  const transactionsRef = collection(db, "users", userId, "transactions");
  const q = query(
    transactionsRef,
    where("categoryId", "==", categoryId),
    orderBy("date", "desc")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Transaction[];
};

export const createTransaction = async (
  userId: string,
  transactionData: Omit<Transaction, "id" | "createdAt" | "updatedAt">
) => {
  const transactionsRef = collection(db, "users", userId, "transactions");
  const transaction: Omit<Transaction, "id"> = {
    ...transactionData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await addDoc(transactionsRef, transaction);
  return { id: docRef.id, ...transaction };
};

export const updateTransaction = async (
  userId: string,
  transactionId: string,
  updates: Partial<Transaction>
) => {
  const transactionRef = doc(
    db,
    "users",
    userId,
    "transactions",
    transactionId
  );
  await updateDoc(transactionRef, { ...updates, updatedAt: new Date() });
};

export const deleteTransaction = async (
  userId: string,
  transactionId: string
) => {
  const transactionRef = doc(
    db,
    "users",
    userId,
    "transactions",
    transactionId
  );
  await deleteDoc(transactionRef);
};
