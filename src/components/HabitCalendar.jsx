import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay,
  isToday
} from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaCheck } from 'react-icons/fa';
import './HabitCalendar.css';

export default function HabitCalendar() {
  const { habits, logs, toggleHabit } = useHabits();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Get completions for a specific date
  const getCompletionsForDate = (dateStr) => {
    return logs.filter(l => l.date === dateStr);
  };

  // Check if habit is done on date
  const isHabitDone = (habitId, dateStr) => {
    return logs.some(l => l.habitId === habitId && l.date === dateStr);
  };

  // Get day of week for first day (for padding)
  const firstDayOfMonth = getDay(startOfMonth(currentMonth));
  const paddingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday start

  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="habit-calendar">
      <div className="calendar-header">
        <h2><FaCalendarAlt /> Habit Calendar</h2>
        <div className="calendar-nav">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <FaChevronLeft />
          </button>
          <span>{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {/* Day headers */}
        {dayHeaders.map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}

        {/* Padding for first week */}
        {[...Array(paddingDays)].map((_, i) => (
          <div key={`pad-${i}`} className="calendar-day empty" />
        ))}

        {/* Days */}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const completions = getCompletionsForDate(dateStr);
          const isSelected = selectedDate === dateStr;
          const isTodayDate = isToday(day);

          return (
            <div
              key={dateStr}
              className={`calendar-day ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
              onClick={() => setSelectedDate(dateStr)}
            >
              <span className="day-number">{format(day, 'd')}</span>
              {completions.length > 0 && (
                <>
                  <div className="completion-dots">
                    {completions.slice(0, 5).map((_, i) => (
                      <span key={i} className="completion-dot" />
                    ))}
                  </div>
                  {completions.length > 0 && (
                    <span className="completion-count">{completions.length}/{habits.length}</span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Details */}
      <div className="selected-day-details">
        <h3>
          {isToday(new Date(selectedDate)) 
            ? 'Today' 
            : format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
        </h3>
        
        <div className="habit-toggle-list">
          {habits.map(habit => {
            const done = isHabitDone(habit.id, selectedDate);
            return (
              <div key={habit.id} className="habit-toggle-item">
                <span className="habit-name">{habit.title}</span>
                <button
                  className={`toggle-btn ${done ? 'done' : 'not-done'}`}
                  onClick={() => toggleHabit(habit.id, selectedDate)}
                >
                  {done ? <><FaCheck /> Done</> : 'Mark Done'}
                </button>
              </div>
            );
          })}
          
          {habits.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
              No habits added yet. Add some habits to track!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
