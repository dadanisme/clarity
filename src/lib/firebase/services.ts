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
import { db } from "./config";
import type { User, Category, Transaction } from "@/types";

// User services
export const createUser = async (
  userId: string,
  userData: Omit<User, "id" | "createdAt">
) => {
  const userRef = doc(db, "users", userId);
  const user: Omit<User, "id"> = {
    ...userData,
    createdAt: new Date(),
  };

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
