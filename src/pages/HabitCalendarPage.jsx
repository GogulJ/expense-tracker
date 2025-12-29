import React, { useState, useEffect } from 'react';
import EventCalendar from '../components/EventCalendar';
import Goals from '../components/Goals';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission, getNotificationStatus, showNotification } from '../utils/notifications';
import { FaBell } from 'react-icons/fa';
import './HabitCalendarPage.css';

export default function HabitCalendarPage() {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [notificationStatus, setNotificationStatus] = useState('default');

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem(`goals_${currentUser?.uid}`);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
    setNotificationStatus(getNotificationStatus());
  }, [currentUser]);

  // Save goals to localStorage
  const saveGoals = (newGoals) => {
    setGoals(newGoals);
    localStorage.setItem(`goals_${currentUser?.uid}`, JSON.stringify(newGoals));
  };

  const handleAddGoal = (goal) => {
    saveGoals([...goals, goal]);
  };

  const handleDeleteGoal = (goalId) => {
    saveGoals(goals.filter(g => g.id !== goalId));
  };

  const handleToggleGoal = (goalId) => {
    saveGoals(goals.map(g => 
      g.id === goalId ? { ...g, completed: !g.completed } : g
    ));
  };

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationStatus(permission);
    
    if (permission === 'granted') {
      showNotification('🎉 Notifications Enabled!', {
        body: 'You will now receive event reminders.'
      });
    }
  };

  return (
    <div className="fade-in">
      <header className="calendar-page-header">
        <div>
          <h1>Calendar</h1>
          <p>Add events, reminders & track goals</p>
        </div>
        
        <div className="calendar-actions">
          {notificationStatus !== 'granted' ? (
            <button 
              className="btn btn-secondary"
              onClick={handleEnableNotifications}
            >
              <FaBell /> Enable Reminders
            </button>
          ) : (
            <span className="notification-status">
              <FaBell style={{ color: '#22C55E' }} /> Reminders Active
            </span>
          )}
        </div>
      </header>

      {/* Goals Section */}
      <Goals 
        goals={goals}
        onAddGoal={handleAddGoal}
        onDeleteGoal={handleDeleteGoal}
        onToggleGoal={handleToggleGoal}
      />

      {/* Event Calendar */}
      <EventCalendar />
    </div>
  );
}
