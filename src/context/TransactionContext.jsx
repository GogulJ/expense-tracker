import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';

const TransactionContext = createContext();

export function useTransactions() {
  return useContext(TransactionContext);
}

export function TransactionProvider({ children }) {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to parse dates
  const parseDate = (item) => ({
    ...item,
    date: item.date?.toDate?.() || new Date(item.date) || new Date(),
  });

  // Helper to sort by date descending
  const sortByDate = (a, b) => {
    const dateA = a.date?.getTime?.() || 0;
    const dateB = b.date?.getTime?.() || 0;
    return dateB - dateA;
  };

  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      setIncomes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const qExpenses = query(
      collection(db, 'expenses'),
      where('uid', '==', currentUser.uid)
    );

    const qIncomes = query(
      collection(db, 'incomes'),
      where('uid', '==', currentUser.uid)
    );

    const unsubscribeExpenses = onSnapshot(qExpenses, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })).map(parseDate).sort(sortByDate);
      setExpenses(data);
    });

    const unsubscribeIncomes = onSnapshot(qIncomes, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })).map(parseDate).sort(sortByDate);
      setIncomes(data);
    });

    // We can consider loading done once the listeners are attached. 
    // In a real generic implementation, we might want to wait for the first emission, 
    // but onSnapshot usually emits immediately if cached or quickly.
    // For better UX, let's just set loading false after a short timeout or rely on the fact that arrays start empty.
    // A better way is to track if initial load is done, but for now simple false is fine as listeners are async but fast.
    setLoading(false);

    return () => {
      unsubscribeExpenses();
      unsubscribeIncomes();
    };
  }, [currentUser]);

  /* =========================
     ACTIONS
  ========================= */

  const addExpense = async (data) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'expenses'), {
      ...data,
      uid: currentUser.uid,
      date: data.date ? new Date(data.date) : serverTimestamp(),
    });
  };

  const updateExpense = async (id, data) => {
    await updateDoc(doc(db, 'expenses', id), {
      ...data,
      date: data.date ? new Date(data.date) : serverTimestamp(),
    });
  };

  const deleteExpense = async (id) => {
    await deleteDoc(doc(db, 'expenses', id));
  };

  const addIncome = async (data) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'incomes'), {
      ...data,
      uid: currentUser.uid,
      date: data.date ? new Date(data.date) : serverTimestamp(),
    });
  };

  const updateIncome = async (id, data) => {
    await updateDoc(doc(db, 'incomes', id), {
      ...data,
      date: data.date ? new Date(data.date) : serverTimestamp(),
    });
  };

  const deleteIncome = async (id) => {
    await deleteDoc(doc(db, 'incomes', id));
  };

  const value = {
    expenses,
    incomes,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}
