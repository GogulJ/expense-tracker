
import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { format, subDays, isSameDay } from 'date-fns';
import { FaPlus, FaTrash, FaCheck, FaFire, FaBell } from 'react-icons/fa';
import { requestNotificationPermission, setHabitReminder, getNotificationStatus } from '../utils/notifications';
import './HabitsPage.css';

const PREDEFINED_HABITS = [
  'Workout / Gym',
  'Read Books',
  'Coding',
  'Drink Water',
  'Meditation',
  'Journaling'
];

export default function HabitsPage() {
  const { habits, logs, addHabit, deleteHabit, toggleHabit, getHabitStreak } = useHabits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [category, setCategory] = useState('Health');
  const [reminderTime, setReminderTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reminders, setReminders] = useState({});

  // Load reminders from localStorage
  useEffect(() => {
    const savedReminders = localStorage.getItem('habitReminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  // Setup reminders when habits or reminders change
  useEffect(() => {
    if (getNotificationStatus() === 'granted') {
      habits.forEach(habit => {
        if (reminders[habit.id]) {
          setHabitReminder(habit, reminders[habit.id]);
        }
      });
    }
  }, [habits, reminders]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newHabit) return;
    
    const habitId = await addHabit(newHabit, category);
    
    // Save reminder if set
    if (reminderTime && habitId) {
      const newReminders = { ...reminders, [habitId]: reminderTime };
      setReminders(newReminders);
      localStorage.setItem('habitReminders', JSON.stringify(newReminders));
      
      // Request permission and set reminder
      await requestNotificationPermission();
      setHabitReminder({ id: habitId, title: newHabit }, reminderTime);
    }
    
    setNewHabit('');
    setReminderTime('');
    setIsModalOpen(false);
  };

  // Helper to check if a habit is done on a specific date
  const isDone = (habitId, dateStr) => {
    return logs.some(l => l.habitId === habitId && l.date === dateStr);
  }; 

  return (
    <div className="fade-in">
      {/* Header */}
      <header className="habits-header">
        <div>
          <h1>Daily Habits</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
             <input 
               type="date" 
               className="input-control" 
               style={{ width: 'auto' }}
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
             />
             <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {isSameDay(new Date(selectedDate), new Date()) ? 'Today' : format(new Date(selectedDate), 'EEEE, MMMM d')}
             </span>
          </div>
        </div>
        
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Add Habit
        </button>
      </header>

      {/* Habits Grid */}
      <div className="habits-grid">
        {habits.map(habit => {
          const streak = getHabitStreak(habit.id);
          const doneOnSelectedDate = isDone(habit.id, selectedDate);
          const habitReminder = reminders[habit.id];

          return (
            <div key={habit.id} className="habit-card">
              <div>
                <div className="habit-info">
                  <h3>{habit.title}</h3>
                  <button 
                    className="icon-btn delete" 
                    onClick={() => window.confirm('Delete this habit?') && deleteHabit(habit.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <div className="habit-stats">
                  <span className="stat-chip">
                    <FaFire className="fire-icon" /> {streak} Day Streak
                  </span>
                  <span className="badge">{habit.category}</span>
                  {habitReminder && (
                    <span className="stat-chip reminder-chip">
                      <FaBell /> {habitReminder}
                    </span>
                  )}
                </div>

                {/* Last 7 Days Dots */}
                <div className="mini-calendar">
                  {[...Array(7)].map((_, i) => {
                    const d = subDays(new Date(), 6 - i);
                    const dateStr = format(d, 'yyyy-MM-dd');
                    const done = isDone(habit.id, dateStr);
                    const isSelected = dateStr === selectedDate;
                    
                    return (
                      <div 
                        key={i} 
                        className={`day-dot ${done ? 'done' : ''}`}
                        title={`${format(d, 'MMM d')}: ${done ? 'Done' : 'Missed'}`}
                        style={isSelected ? { border: '2px solid var(--primary-color)', transform: 'scale(1.2)' } : {}}
                        onClick={() => setSelectedDate(dateStr)}
                      >
                        {format(d, 'd')}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button 
                  className={`check-btn ${doneOnSelectedDate ? 'completed' : ''}`}
                  onClick={() => toggleHabit(habit.id, selectedDate)}
                >
                  {doneOnSelectedDate ? (
                    <>
                      <FaCheck /> Completed
                    </>
                  ) : (
                    'Mark as Done'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="no-habits">
          <h2>No habits tracked yet</h2>
          <p>Start building your routine by adding a new habit.</p>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Track New Habit</h2>
            <form onSubmit={handleAdd} className="modal-form">
              <div className="input-group">
                <label className="input-label">Habit Name</label>
                <input 
                  autoFocus
                  required
                  className="input-control"
                  placeholder="e.g. Read 10 pages"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                />
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {PREDEFINED_HABITS.map(h => (
                    <span 
                      key={h} 
                      className="badge" 
                      style={{ cursor: 'pointer', background: 'var(--bg-secondary)' }}
                      onClick={() => setNewHabit(h)}
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Category</label>
                <select 
                  className="input-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Health</option>
                  <option>Productivity</option>
                  <option>Learning</option>
                  <option>Mindfulness</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FaBell style={{ marginRight: '0.5rem' }} />
                  Daily Reminder (optional)
                </label>
                <input 
                  type="time"
                  className="input-control"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Get a browser notification at this time daily
                </span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary">Start Tracking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
