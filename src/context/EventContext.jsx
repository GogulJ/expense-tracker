import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';

const EventContext = createContext();

export function useEvents() {
  return useContext(EventContext);
}

export function EventProvider({ children }) {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const qEvents = query(
      collection(db, 'events'),
      where('uid', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(qEvents, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addEvent = async (eventData) => {
    if (!currentUser) return null;
    const docRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      uid: currentUser.uid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateEvent = async (id, eventData) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'events', id), eventData);
  };

  const deleteEvent = async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'events', id));
  };

  const getEventsForDate = (dateStr) => {
    return events.filter(e => e.date === dateStr);
  };

  const value = {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}
