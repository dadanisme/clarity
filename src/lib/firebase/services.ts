import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./config";

import type { Category, Transaction } from "@/types";
import { UserService } from "./user-service";

// Re-export user services from UserService for backwards compatibility
export const createUser = UserService.createUser;
export const getUser = UserService.getUser;
export const subscribeToUser = UserService.subscribeToUser;
export const updateUser = UserService.updateUser;
export const updateUserSettings = UserService.updateUserSettings;
export const updateUserRole = UserService.updateUserRole;

// Image upload services - using base64 for now
export const uploadProfileImage = async (
  userId: string,
  file: File
): Promise<string> => {
  // Convert to base64 for now - in a real app you'd want proper storage
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteProfileImage = async (_imageUrl: string): Promise<void> => {
  // No-op for base64 images
  console.log("Profile image deletion not implemented for base64 images");
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
  options?: {
    startDate?: Date;
    endDate?: Date;
    limitCount?: number;
  }
): Promise<Transaction[]> => {
  const transactionsRef = collection(db, "users", userId, "transactions");
  const { startDate, endDate, limitCount = 1000 } = options || {};

  let q;

  if (startDate && endDate) {
    // Query with date range
    q = query(
      transactionsRef,
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "desc"),
      limit(limitCount)
    );
  } else {
    // Default query without date filtering
    q = query(transactionsRef, orderBy("date", "desc"), limit(limitCount));
  }

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

export const createMultipleTransactions = async (
  userId: string,
  transactions: Omit<Transaction, "id" | "createdAt" | "updatedAt">[]
) => {
  const transactionsRef = collection(db, "users", userId, "transactions");

  const promises = transactions.map((transaction) => {
    const transactionData: Omit<Transaction, "id"> = {
      ...transaction,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return addDoc(transactionsRef, transactionData);
  });

  const results = await Promise.all(promises);
  return results.map((docRef, index) => ({
    id: docRef.id,
    ...transactions[index],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};
