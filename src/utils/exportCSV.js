// Export habits and logs to CSV format

export function exportHabitsToCSV(habits, logs) {
  // Create habits CSV
  const habitsHeader = ['ID', 'Title', 'Category', 'Created At'];
  const habitsRows = habits.map(h => [
    h.id,
    h.title,
    h.category || 'General',
    h.createdAt?.toDate?.() || h.createdAt || ''
  ]);

  const habitsCSV = [
    habitsHeader.join(','),
    ...habitsRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create logs CSV
  const logsHeader = ['Habit ID', 'Date', 'Completed'];
  const logsRows = logs.map(l => [
    l.habitId,
    l.date,
    'Yes'
  ]);

  const logsCSV = [
    logsHeader.join(','),
    ...logsRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return { habitsCSV, logsCSV };
}

export function exportTransactionsToCSV(expenses, incomes) {
  // Create expenses CSV
  const expensesHeader = ['Date', 'Title', 'Category', 'Amount'];
  const expensesRows = expenses.map(e => [
    e.date?.toLocaleDateString?.() || e.date,
    e.title,
    e.category || 'Other',
    e.amount
  ]);

  const expensesCSV = [
    expensesHeader.join(','),
    ...expensesRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create incomes CSV
  const incomesHeader = ['Date', 'Title', 'Source', 'Amount'];
  const incomesRows = incomes.map(i => [
    i.date?.toLocaleDateString?.() || i.date,
    i.title,
    i.source || 'Other',
    i.amount
  ]);

  const incomesCSV = [
    incomesHeader.join(','),
    ...incomesRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return { expensesCSV, incomesCSV };
}

export function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Combined export with multiple sheets simulation (separate files)
export function exportAllHabitData(habits, logs) {
  const { habitsCSV, logsCSV } = exportHabitsToCSV(habits, logs);
  
  const today = new Date().toISOString().split('T')[0];
  
  downloadCSV(habitsCSV, `habits_${today}.csv`);
  
  setTimeout(() => {
    downloadCSV(logsCSV, `habit_logs_${today}.csv`);
  }, 500);
}

export function exportAllFinanceData(expenses, incomes) {
  const { expensesCSV, incomesCSV } = exportTransactionsToCSV(expenses, incomes);
  
  const today = new Date().toISOString().split('T')[0];
  
  downloadCSV(expensesCSV, `expenses_${today}.csv`);
  
  setTimeout(() => {
    downloadCSV(incomesCSV, `incomes_${today}.csv`);
  }, 500);
}
