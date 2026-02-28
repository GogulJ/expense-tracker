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
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';

const TransactionContext = createContext();

const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Mobile Recharge', 'Taxi', 'Utilities', 'Movie', 'Xerox', 'Pharmacy', 'Others'];
const DEFAULT_SOURCES = ['Salary', 'Dad', 'Investment', 'Other'];

export function useTransactions() {
  return useContext(TransactionContext);
}

export function TransactionProvider({ children }) {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [sources, setSources] = useState(DEFAULT_SOURCES);
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
      setCategories(DEFAULT_CATEGORIES);
      setSources(DEFAULT_SOURCES);
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

    // Listen to user preferences for categories and sources
    const prefsDocRef = doc(db, 'userPreferences', currentUser.uid);
    const unsubscribePrefs = onSnapshot(prefsDocRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setCategories(data.categories || DEFAULT_CATEGORIES);
        setSources(data.sources || DEFAULT_SOURCES);
      } else {
        // Initialize with defaults if document doesn't exist
        await setDoc(prefsDocRef, {
          categories: DEFAULT_CATEGORIES,
          sources: DEFAULT_SOURCES,
        });
        setCategories(DEFAULT_CATEGORIES);
        setSources(DEFAULT_SOURCES);
      }
    });

    setLoading(false);

    return () => {
      unsubscribeExpenses();
      unsubscribeIncomes();
      unsubscribePrefs();
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

  const addCategory = async (category) => {
    if (!currentUser || !category.trim()) return;
    const trimmedCategory = category.trim();
    if (categories.includes(trimmedCategory)) return; // Already exists
    
    const newCategories = [...categories, trimmedCategory];
    const prefsDocRef = doc(db, 'userPreferences', currentUser.uid);
    await updateDoc(prefsDocRef, { categories: newCategories });
  };

  const addSource = async (source) => {
    if (!currentUser || !source.trim()) return;
    const trimmedSource = source.trim();
    if (sources.includes(trimmedSource)) return; // Already exists
    
    const newSources = [...sources, trimmedSource];
    const prefsDocRef = doc(db, 'userPreferences', currentUser.uid);
    await updateDoc(prefsDocRef, { sources: newSources });
  };

  const value = {
    expenses,
    incomes,
    categories,
    sources,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    addCategory,
    addSource,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}
