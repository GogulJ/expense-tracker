// Notification utilities for habit reminders

export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return Promise.resolve('denied');
  }

  if (Notification.permission === 'granted') {
    return Promise.resolve('granted');
  }

  return Notification.requestPermission();
}

export function showNotification(title, options = {}) {
  if (!('Notification' in window)) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    return null;
  }

  const notification = new Notification(title, {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    ...options
  });

  return notification;
}

export function scheduleHabitReminder(habit, reminderTime) {
  // Parse reminder time (HH:MM format)
  const [hours, minutes] = reminderTime.split(':').map(Number);
  
  const now = new Date();
  const reminderDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  );

  // If the time has passed today, schedule for tomorrow
  if (reminderDate <= now) {
    reminderDate.setDate(reminderDate.getDate() + 1);
  }

  const timeUntilReminder = reminderDate.getTime() - now.getTime();

  // Store the timeout ID so we can cancel it later
  const timeoutId = setTimeout(() => {
    showNotification(`⏰ Habit Reminder: ${habit.title}`, {
      body: `Don't forget to complete your habit today!`,
      tag: `habit-${habit.id}`,
      requireInteraction: true
    });
    
    // Reschedule for next day
    scheduleHabitReminder(habit, reminderTime);
  }, timeUntilReminder);

  return timeoutId;
}

// Store reminders in memory (in production, you'd use service workers)
const activeReminders = new Map();

export function setHabitReminder(habit, reminderTime) {
  // Clear existing reminder for this habit
  if (activeReminders.has(habit.id)) {
    clearTimeout(activeReminders.get(habit.id));
  }

  if (reminderTime) {
    const timeoutId = scheduleHabitReminder(habit, reminderTime);
    activeReminders.set(habit.id, timeoutId);
  }
}

export function clearHabitReminder(habitId) {
  if (activeReminders.has(habitId)) {
    clearTimeout(activeReminders.get(habitId));
    activeReminders.delete(habitId);
  }
}

export function clearAllReminders() {
  activeReminders.forEach((timeoutId) => {
    clearTimeout(timeoutId);
  });
  activeReminders.clear();
}

// Check if notifications are supported and enabled
export function getNotificationStatus() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}
