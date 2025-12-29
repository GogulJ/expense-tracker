import React, { useState, useMemo, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  subMonths,
  getDay,
  isToday,
  isSameMonth
} from 'date-fns';
import { useEvents } from '../context/EventContext';
import { fetchHolidays, fetchWeather, getWeatherIcon } from '../utils/externalApis';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaPlus, FaTrash, FaEdit, FaBell, FaClock } from 'react-icons/fa';
import './EventCalendar.css';

const EVENT_TYPES = [
  { id: 'reminder', label: '🔔 Reminder', color: '#3B82F6' },
  { id: 'event', label: '📅 Event', color: '#8B5CF6' },
  { id: 'task', label: '✅ Task', color: '#F59E0B' },
  { id: 'birthday', label: '🎂 Birthday', color: '#EC4899' },
];

export default function EventCalendar() {
  const { events, addEvent, deleteEvent } = useEvents();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [weather, setWeather] = useState([]);
  
  // Form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('reminder');
  const [eventTime, setEventTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  // Fetch holidays and weather
  useEffect(() => {
    const year = currentMonth.getFullYear();
    fetchHolidays(year, 'IN').then(setHolidays);
    fetchWeather().then(setWeather);
  }, [currentMonth]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Get events + holidays for a date
  const getEventsForDate = (dateStr) => {
    const userEvents = events.filter(e => e.date === dateStr);
    const holidayEvents = holidays
      .filter(h => h.date === dateStr)
      .map(h => ({ ...h, id: `holiday-${h.date}`, type: 'holiday' }));
    return [...userEvents, ...holidayEvents];
  };

  // Get weather for date
  const getWeatherForDate = (dateStr) => {
    return weather.find(w => w.date === dateStr);
  };

  // First day padding
  const firstDayOfMonth = getDay(startOfMonth(currentMonth));
  const paddingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    await addEvent({
      title: eventTitle.trim(),
      type: eventType,
      date: selectedDate,
      time: eventTime || null,
      description: eventDescription || null,
    });

    setEventTitle('');
    setEventTime('');
    setEventDescription('');
    setIsModalOpen(false);
  };

  const selectedDateEvents = getEventsForDate(selectedDate);
  const selectedDateWeather = getWeatherForDate(selectedDate);

  return (
    <div className="event-calendar">
      <div className="calendar-header">
        <h2><FaCalendarAlt /> Event Calendar</h2>
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

        {/* Padding */}
        {[...Array(paddingDays)].map((_, i) => (
          <div key={`pad-${i}`} className="calendar-day empty" />
        ))}

        {/* Days */}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = getEventsForDate(dateStr);
          const dayWeather = getWeatherForDate(dateStr);
          const isSelected = selectedDate === dateStr;
          const isTodayDate = isToday(day);
          const hasHoliday = dayEvents.some(e => e.type === 'holiday');

          return (
            <div
              key={dateStr}
              className={`calendar-day ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''} ${hasHoliday ? 'holiday' : ''}`}
              onClick={() => setSelectedDate(dateStr)}
            >
              <div className="day-header">
                <span className="day-number">{format(day, 'd')}</span>
                {dayWeather && (
                  <span className="day-weather">{getWeatherIcon(dayWeather.weatherCode)}</span>
                )}
              </div>
              
              <div className="day-events">
                {dayEvents.slice(0, 3).map((event, i) => (
                  <div key={event.id || i} className={`event-pill ${event.type}`}>
                    {event.title || event.name}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="more-events">+{dayEvents.length - 3} more</span>
                )}
              </div>

              <button 
                className="add-event-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(dateStr);
                  setIsModalOpen(true);
                }}
              >
                <FaPlus />
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Day Panel */}
      <div className="selected-day-panel">
        <div className="selected-day-header">
          <h3>
            {isToday(new Date(selectedDate)) 
              ? 'Today' 
              : format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
          </h3>
          {selectedDateWeather && (
            <div className="weather-info">
              <span>{selectedDateWeather.description}</span>
              <span>{selectedDateWeather.tempMin}° - {selectedDateWeather.tempMax}°C</span>
            </div>
          )}
        </div>

        <button 
          className="btn btn-primary" 
          style={{ marginBottom: '1rem' }}
          onClick={() => setIsModalOpen(true)}
        >
          <FaPlus /> Add Event
        </button>

        <div className="events-list">
          {selectedDateEvents.map((event, i) => (
            <div key={event.id || i} className={`event-item ${event.type}`}>
              {event.time && (
                <span className="event-time">
                  <FaClock /> {event.time}
                </span>
              )}
              <div className="event-details">
                <div className="event-title">{event.title || event.name}</div>
                {event.description && (
                  <div className="event-description">{event.description}</div>
                )}
              </div>
              {event.type !== 'holiday' && (
                <div className="event-actions">
                  <button 
                    className="delete"
                    onClick={() => deleteEvent(event.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          ))}

          {selectedDateEvents.length === 0 && (
            <div className="no-events">
              <p>No events for this day</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Add Event - {format(new Date(selectedDate), 'MMM d, yyyy')}</h2>
            <form onSubmit={handleAddEvent} className="modal-form">
              <div className="event-type-selector">
                {EVENT_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    className={`event-type-btn ${eventType === type.id ? 'active' : ''}`}
                    onClick={() => setEventType(type.id)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="input-group">
                <label className="input-label">Title</label>
                <input
                  autoFocus
                  required
                  className="input-control"
                  placeholder="Event title..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Time (optional)</label>
                <input
                  type="time"
                  className="input-control"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Description (optional)</label>
                <textarea
                  className="input-control"
                  rows="2"
                  placeholder="Add notes..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary">Add Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
