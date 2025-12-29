
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { format } from 'date-fns';

const HabitContext = createContext();

export function useHabits() {
  return useContext(HabitContext);
}

export function HabitProvider({ children }) {
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setHabits([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query Habits
    const qHabits = query(
      collection(db, 'habits'),
      where('uid', '==', currentUser.uid)
    );

    // Query Logs (Fetching all for now for comprehensive stats)
    // Optimization: In a real app, maybe limit to active months or recent 1000.
    const qLogs = query(
      collection(db, 'habit_logs'),
      where('uid', '==', currentUser.uid)
    );

    const unsubscribeHabits = onSnapshot(qHabits, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHabits(data);
    });

    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id, // This will be habitId_date
        ...doc.data(),
      }));
      setLogs(data);
    });

    setLoading(false);

    return () => {
      unsubscribeHabits();
      unsubscribeLogs();
    };
  }, [currentUser]);

  /* =========================
     ACTIONS
  ========================= */

  const addHabit = async (title, category = 'General') => {
    if (!currentUser) return null;
    const docRef = await addDoc(collection(db, 'habits'), {
      title,
      category,
      uid: currentUser.uid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const deleteHabit = async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'habits', id));
    // Also delete logs for this habit (cleanup)
    // Note: Doing this client-side for simplicity, but cloud functions are better.
    const logsToDelete = logs.filter(l => l.habitId === id);
    logsToDelete.forEach(async (log) => {
      await deleteDoc(doc(db, 'habit_logs', log.id));
    });
  };

  const toggleHabit = async (habitId, dateStr) => {
    // dateStr should be YYYY-MM-DD
    if (!currentUser) return;

    const logId = `${habitId}_${dateStr}`;
    const logRef = doc(db, 'habit_logs', logId);

    // Check if exists in local logs to avoid read
    const exists = logs.some(l => l.id === logId);

    if (exists) {
      // Remove log (untoggle)
      await deleteDoc(logRef);
    } else {
      // Add log
      await setDoc(logRef, {
        habitId,
        date: dateStr,
        uid: currentUser.uid,
        createdAt: serverTimestamp()
      });
    }
  };

  const getHabitStreak = (habitId) => {
    const habitLogs = logs
      .filter(l => l.habitId === habitId)
      .map(l => l.date)
      .sort((a, b) => b.localeCompare(a)); // Descending dates
    
    if (habitLogs.length === 0) return 0;

    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

    // Check if completed today or yesterday to start streak
    // If not done today AND not done yesterday, streak is broken -> 0? 
    // Usually streak counts up to yesterday if today is not yet done.
    
    // Simplistic Streak: Consecutive days starting from (Today or Yesterday) backwards.
    let currentCheck = today;
    if (!habitLogs.includes(today)) {
       if (habitLogs.includes(yesterday)) {
           currentCheck = yesterday;
       } else {
           return 0; // Streak broken
       }
    }

    while (habitLogs.includes(currentCheck)) {
        streak++;
        const prevDate = new Date(currentCheck);
        prevDate.setDate(prevDate.getDate() - 1);
        currentCheck = format(prevDate, 'yyyy-MM-dd');
    }
    return streak;
  };

  const value = {
    habits,
    logs,
    loading,
    addHabit,
    deleteHabit,
    toggleHabit,
    getHabitStreak
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}
