import { db } from "@/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

export const addTransaction = async (userId: string, tx: {
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
}) => {
  return addDoc(collection(db, `users/${userId}/transactions`), {
    ...tx,
    createdAt: Timestamp.now()
  });
};

export const listenToTransactions = (userId: string, callback: (txs: any[]) => void) => {
  const q = query(
    collection(db, `users/${userId}/transactions`),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

export const updateTransaction = async (userId: string, transactionId: string, updates: Partial<{ amount: number; category: string; description: string; type: 'income' | 'expense'; }>) => {
  const docRef = doc(db, `users/${userId}/transactions/${transactionId}`);
  return updateDoc(docRef, updates);
};

export const deleteTransaction = async (userId: string, transactionId: string) => {
  const docRef = doc(db, `users/${userId}/transactions/${transactionId}`);
  return deleteDoc(docRef);
};
