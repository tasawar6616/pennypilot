/*
  Lightweight Firebase Firestore wrapper for PennyPilot.

  Usage:
    1. Install firebase: npm install firebase
    2. Edit `env/firebase.ts` with your config (or provide via envs)
    3. Use addTransactionFirestore(...) and getRecentTransactionsFirestore(...) from the app.
*/

import {
  collection,
  addDoc,
  query,
  orderBy,
  limit as limitFn,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase-init';

export async function addTransactionFirestore(
  userId: string,
  payload: {
    amount: number;
    currency?: string;
    timestamp?: number;
    note?: string;
    categoryId?: string;
    paymentMethodId?: string;
  }
) {
  const db = getFirebaseDb();
  const doc = await addDoc(collection(db, `users/${userId}/transactions`), {
    amount: payload.amount,
    currency: payload.currency ?? 'PKR',
    createdAt: Timestamp.fromMillis(payload.timestamp ?? Date.now()),
    note: payload.note ?? null,
    categoryId: payload.categoryId ?? null,
    paymentMethodId: payload.paymentMethodId ?? null,
  });

  return { id: doc.id };
}

export async function getRecentTransactionsFirestore(userId: string, limit = 5) {
  const db = getFirebaseDb();
  const q = query(collection(db, `users/${userId}/transactions`), orderBy('createdAt', 'desc'), limitFn(limit));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      amount: data.amount,
      currency: data.currency,
      timestamp: data.createdAt ? (data.createdAt as Timestamp).toMillis() : null,
      note: data.note ?? null,
      categoryId: data.categoryId ?? null,
      paymentMethodId: data.paymentMethodId ?? null,
    };
  });
}

export type TransactionRow = {
  id: string;
  amount: number;
  currency?: string;
  timestamp?: number | null;
  note?: string | null;
  categoryId?: string | null;
  paymentMethodId?: string | null;
};

export type SettingsData = {
  monthlyIncome: number;
  monthlyBudget: number;
  reminderTime: string;
  currency?: string;
};

export type CategoryBudget = {
  id: string;
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM format
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
};

export type PaymentMethod = {
  id: string;
  name: string;
  icon: string;
  type: 'cash' | 'bank' | 'card' | 'upi' | 'wallet';
};

// Settings management
const SETTINGS_DOC_ID = 'user_settings';

export async function saveSettings(userId: string, settings: SettingsData) {
  const db = getFirebaseDb();
  const { setDoc, doc } = await import('firebase/firestore');
  await setDoc(doc(db, `users/${userId}/settings`, SETTINGS_DOC_ID), {
    ...settings,
    currency: settings.currency ?? 'PKR',
    updatedAt: Timestamp.now(),
  });
}

export async function getSettings(userId: string): Promise<SettingsData | null> {
  const db = getFirebaseDb();
  const { getDoc, doc } = await import('firebase/firestore');
  const docSnap = await getDoc(doc(db, `users/${userId}/settings`, SETTINGS_DOC_ID));

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    monthlyIncome: data.monthlyIncome ?? 0,
    monthlyBudget: data.monthlyBudget ?? 0,
    reminderTime: data.reminderTime ?? '02:00',
    currency: data.currency ?? 'PKR',
  };
}

// Default categories
export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Food', icon: '🍽️', color: '#FF6B6B', isDefault: true },
  { name: 'Transport', icon: '🚗', color: '#4ECDC4', isDefault: true },
  { name: 'Shopping', icon: '🛍️', color: '#FFE66D', isDefault: true },
  { name: 'Bills', icon: '💳', color: '#A8E6CF', isDefault: true },
  { name: 'Health', icon: '⚕️', color: '#FF6B9D', isDefault: true },
  { name: 'Entertainment', icon: '🎬', color: '#C44569', isDefault: true },
  { name: 'Travel', icon: '✈️', color: '#4834DF', isDefault: true },
  { name: 'Education', icon: '📚', color: '#6A89CC', isDefault: true },
  { name: 'Misc', icon: '📦', color: '#95A5A6', isDefault: true },
];

// Default payment methods
export const DEFAULT_PAYMENT_METHODS: Omit<PaymentMethod, 'id'>[] = [
  { name: 'Cash', icon: '💵', type: 'cash' },
  { name: 'Bank Account', icon: '🏦', type: 'bank' },
  { name: 'Credit/Debit Card', icon: '💳', type: 'card' },
  { name: 'UPI/EasyPaisa', icon: '📱', type: 'upi' },
  { name: 'Wallet', icon: '👛', type: 'wallet' },
];

// Initialize default categories if they don't exist
export async function initializeDefaultCategories(userId: string) {
  const db = getFirebaseDb();
  const q = query(collection(db, `users/${userId}/categories`), limitFn(1));
  const snap = await getDocs(q);

  if (snap.empty) {
    for (const cat of DEFAULT_CATEGORIES) {
      await addDoc(collection(db, `users/${userId}/categories`), cat);
    }
  }
}

// Initialize default payment methods if they don't exist
export async function initializeDefaultPaymentMethods(userId: string) {
  const db = getFirebaseDb();
  const q = query(collection(db, `users/${userId}/paymentMethods`), limitFn(1));
  const snap = await getDocs(q);

  if (snap.empty) {
    for (const pm of DEFAULT_PAYMENT_METHODS) {
      await addDoc(collection(db, `users/${userId}/paymentMethods`), pm);
    }
  }
}

// Get all categories
export async function getCategories(userId: string): Promise<Category[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(collection(db, `users/${userId}/categories`));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  } as Category));
}

// Get all payment methods
export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(collection(db, `users/${userId}/paymentMethods`));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  } as PaymentMethod));
}

// Delete transaction
export async function deleteTransaction(userId: string, id: string) {
  const db = getFirebaseDb();
  const { deleteDoc, doc } = await import('firebase/firestore');
  await deleteDoc(doc(db, `users/${userId}/transactions`, id));
}

// Category Budgets Management
export async function saveCategoryBudget(userId: string, categoryId: string, amount: number, month: string) {
  const db = getFirebaseDb();
  const { setDoc, doc } = await import('firebase/firestore');
  const budgetId = `${categoryId}_${month}`;
  await setDoc(doc(db, `users/${userId}/categoryBudgets`, budgetId), {
    categoryId,
    amount,
    month,
    updatedAt: Timestamp.now(),
  });
}

export async function getCategoryBudgets(userId: string, month: string): Promise<CategoryBudget[]> {
  const db = getFirebaseDb();
  const { where } = await import('firebase/firestore');
  const q = query(collection(db, `users/${userId}/categoryBudgets`), where('month', '==', month));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  } as CategoryBudget));
}

export async function getAllCategoryBudgets(userId: string): Promise<CategoryBudget[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(collection(db, `users/${userId}/categoryBudgets`));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  } as CategoryBudget));
}
