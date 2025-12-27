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

export function useIncome() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIncomes([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "incomes"),
        where("uid", "==", user.uid)
      );

      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate?.() || null,
          })).sort((a, b) => {
            // Sort by date descending on client side
            const dateA = a.date?.getTime?.() || 0;
            const dateB = b.date?.getTime?.() || 0;
            return dateB - dateA;
          });

          setIncomes(data);
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

  // ✅ Add Income
  const addIncome = async (income) => {
    if (!auth.currentUser) return;

    await addDoc(collection(db, "incomes"), {
      ...income,
      uid: auth.currentUser.uid,
      date: income.date ? new Date(income.date) : serverTimestamp(),
    });
  };

  // ✅ Delete Income
  const deleteIncome = async (id) => {
    await deleteDoc(doc(db, "incomes", id));
  };

  // ✅ Update Income
  const updateIncome = async (id, updatedIncome) => {
    await updateDoc(doc(db, "incomes", id), {
      ...updatedIncome,
      date: updatedIncome.date
        ? new Date(updatedIncome.date)
        : serverTimestamp(),
    });
  };

  return { incomes, loading, addIncome, deleteIncome, updateIncome };
}
