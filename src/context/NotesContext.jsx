import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';

const NotesContext = createContext();

export function useNotes() {
  return useContext(NotesContext);
}

export function NotesProvider({ children }) {
  const { currentUser } = useAuth();
  const [financeNote, setFinanceNote] = useState('');
  const [habitsNote, setHabitsNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setFinanceNote('');
      setHabitsNote('');
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listen to finance note
    const financeDocRef = doc(db, 'notes', `${currentUser.uid}_finance`);
    const unsubFinance = onSnapshot(financeDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setFinanceNote(docSnap.data().content || '');
      } else {
        setFinanceNote('');
      }
    });

    // Listen to habits note
    const habitsDocRef = doc(db, 'notes', `${currentUser.uid}_habits`);
    const unsubHabits = onSnapshot(habitsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setHabitsNote(docSnap.data().content || '');
      } else {
        setHabitsNote('');
      }
    });

    setLoading(false);

    return () => {
      unsubFinance();
      unsubHabits();
    };
  }, [currentUser]);

  /* =========================
     ACTIONS
  ========================= */

  const updateNote = async (type, content) => {
    if (!currentUser) return;
    
    const docId = `${currentUser.uid}_${type}`;
    const noteRef = doc(db, 'notes', docId);
    
    await setDoc(noteRef, {
      content,
      uid: currentUser.uid,
      type,
      updatedAt: new Date(),
    }, { merge: true });

    // Update local state immediately
    if (type === 'finance') {
      setFinanceNote(content);
    } else if (type === 'habits') {
      setHabitsNote(content);
    }
  };

  const getNote = (type) => {
    return type === 'finance' ? financeNote : habitsNote;
  };

  const value = {
    financeNote,
    habitsNote,
    loading,
    updateNote,
    getNote,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}
