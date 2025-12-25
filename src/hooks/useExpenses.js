import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../services/firebase";

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setExpenses([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "expenses"),
        where("uid", "==", user.uid),
        orderBy("date", "desc")
      );

      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate?.() || null,
          }));

          setExpenses(data);
          setLoading(false);
        },
        (error) => {
          console.error("Firestore listener error:", error);
        }
      );
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  // ✅ Add Expense
  const addExpense = async (expense) => {
    if (!auth.currentUser) return;

    await addDoc(collection(db, "expenses"), {
      ...expense,
      uid: auth.currentUser.uid,
      date: expense.date ? new Date(expense.date) : serverTimestamp(),
    });
  };

  // ✅ Delete Expense
  const deleteExpense = async (id) => {
    await deleteDoc(doc(db, "expenses", id));
  };

  // ✅ Update Expense
  const updateExpense = async (id, updatedExpense) => {
    await updateDoc(doc(db, "expenses", id), {
      ...updatedExpense,
      date: updatedExpense.date
        ? new Date(updatedExpense.date)
        : serverTimestamp(),
    });
  };

  return { expenses, loading, addExpense, deleteExpense, updateExpense };
}
