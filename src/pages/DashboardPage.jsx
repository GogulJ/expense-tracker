import React, { useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  format,
  startOfMonth,
  startOfWeek,
  isSameMonth,
  isSameWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { FaArrowUp, FaArrowDown, FaWallet, FaPiggyBank } from 'react-icons/fa';
import './DashboardPage.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function DashboardPage() {
  const { expenses, incomes, loading } = useTransactions();

  /* =========================
     📊 CORE STATS
  ========================= */
  const stats = useMemo(() => {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const lastWeek = subWeeks(now, 1);

    const totalExpense = expenses.reduce(
      (acc, curr) => acc + (parseFloat(curr.amount) || 0),
      0
    );

    const totalIncome = incomes.reduce(
      (acc, curr) => acc + (parseFloat(curr.amount) || 0),
      0
    );

    const thisMonthExpense = expenses
      .filter((e) => isSameMonth(e.date, now))
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    const thisMonthIncome = incomes
      .filter((i) => isSameMonth(i.date, now))
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    const thisWeekExpense = expenses
      .filter((e) => isSameWeek(e.date, now))
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    const thisWeekIncome = incomes
      .filter((i) => isSameWeek(i.date, now))
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    const prevMonthExpense = expenses
      .filter((e) => isSameMonth(e.date, lastMonth))
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    const prevWeekExpense = expenses
      .filter((e) => isSameWeek(e.date, lastWeek))
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    const purseAmount = totalIncome - totalExpense;

    return { 
      totalExpense, 
      totalIncome, 
      thisMonthExpense, 
      thisMonthIncome,
      thisWeekExpense,
      thisWeekIncome,
      prevMonthExpense, 
      prevWeekExpense,
      purseAmount
    };
  }, [expenses, incomes]);

  /* =========================
     🍩 CATEGORY SPLIT
  ========================= */
  const categoryData = useMemo(() => {
    const categories = {};
    expenses.forEach((e) => {
      const cat = e.category || 'Other';
      categories[cat] = (categories[cat] || 0) + parseFloat(e.amount);
    });

    return {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            '#6366F1',
            '#22C55E',
            '#F59E0B',
            '#EF4444',
            '#06B6D4',
            '#A855F7',
          ],
        },
      ],
    };
  }, [expenses]);

  /* =========================
     📈 MONTHLY TREND
  ========================= */
  const monthlyData = useMemo(() => {
    const data = {};
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      data[format(d, 'MMM')] = 0;
    }

    expenses.forEach((e) => {
      const label = format(e.date, 'MMM');
      if (data[label] !== undefined) {
        data[label] += parseFloat(e.amount);
      }
    });

    return {
      labels: Object.keys(data),
      datasets: [
        {
          label: 'Monthly Spending',
          data: Object.values(data),
          backgroundColor: 'rgba(99,102,241,0.6)',
          borderRadius: 8,
        },
      ],
    };
  }, [expenses]);

  /* =========================
     📅 WEEKLY TREND
  ========================= */
  const weeklyData = useMemo(() => {
    const data = {};
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    dayLabels.forEach((day) => {
      data[day] = 0;
    });

    const now = new Date();

    expenses.forEach((e) => {
      if (isSameWeek(e.date, now)) {
        const dayIndex = e.date.getDay();
        const dayName = dayLabels[(dayIndex === 0 ? 6 : dayIndex - 1)];
        data[dayName] += parseFloat(e.amount);
      }
    });

    return {
      labels: Object.keys(data),
      datasets: [
        {
          label: 'Weekly Spending',
          data: Object.values(data),
          backgroundColor: 'rgba(34,197,94,0.6)',
          borderRadius: 8,
        },
      ],
    };
  }, [expenses]);

  /* =========================
     📊 CATEGORY GROWTH (MoM)
  ========================= */
  const categoryGrowth = useMemo(() => {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const curr = {};
    const prev = {};

    expenses.forEach((e) => {
      const amt = parseFloat(e.amount) || 0;
      const cat = e.category || 'Other';

      if (isSameMonth(e.date, now)) {
        curr[cat] = (curr[cat] || 0) + amt;
      }
      if (isSameMonth(e.date, lastMonth)) {
        prev[cat] = (prev[cat] || 0) + amt;
      }
    });

    return Object.keys(curr)
      .map((cat) => ({
        category: cat,
        change: (curr[cat] || 0) - (prev[cat] || 0),
      }))
      .sort((a, b) => b.change - a.change);
  }, [expenses]);

  /* =========================
     📉 AVG DAILY SPEND
  ========================= */
  const avgDailySpend = useMemo(() => {
    if (!expenses.length) return 0;
    const days = new Set(expenses.map((e) => format(e.date, 'yyyy-MM-dd')));
    return stats.totalExpense / days.size;
  }, [expenses, stats.totalExpense]);

  /* =========================
     🔮 NEXT MONTH PREDICTION
  ========================= */
  const predictedNextMonth = useMemo(() => {
    let total = 0;
    let count = 0;

    for (let i = 1; i <= 3; i++) {
      const m = subMonths(new Date(), i);
      const sum = expenses
        .filter((e) => isSameMonth(e.date, m))
        .reduce((a, b) => a + parseFloat(b.amount), 0);

      if (sum > 0) {
        total += sum;
        count++;
      }
    }
    return count ? total / count : 0;
  }, [expenses]);

  /* =========================
     🚨 OVERSPEND ALERT
  ========================= */
  const overspendPercent =
    stats.prevMonthExpense > 0
      ? ((stats.thisMonthExpense - stats.prevMonthExpense) / stats.prevMonthExpense) * 100
      : 0;

  const weeklyOverspendPercent =
    stats.prevWeekExpense > 0
      ? ((stats.thisWeekExpense - stats.prevWeekExpense) / stats.prevWeekExpense) * 100
      : 0;

  const savingsPercent = 
    stats.totalIncome > 0 
      ? ((stats.purseAmount / stats.totalIncome) * 100).toFixed(1)
      : 0;

  if (loading) return <div className="dashboard-loader">Loading dashboard…</div>;

  return (
    <div className="dashboard fade-in">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <span>{format(new Date(), 'MMMM d, yyyy')}</span>
      </header>

      {/* Alert */}
      {overspendPercent > 20 && (
        <div className="alert-card">
          ⚠️ You are spending <strong>{overspendPercent.toFixed(1)}%</strong> more
          than last month
        </div>
      )}

      {weeklyOverspendPercent > 20 && (
        <div className="alert-card alert-warning">
          ⚡ This week's spending is <strong>{weeklyOverspendPercent.toFixed(1)}%</strong> higher than last week
        </div>
      )}

      {/* KPI Cards */}
      <section className="stats-grid">
        <div className="stat-card highlight">
          <FaWallet />
          <div>
            <p>Total Income</p>
            <h2>₹{stats.totalIncome.toLocaleString()}</h2>
            <span className="meta">Lifetime</span>
          </div>
        </div>

        <div className="stat-card highlight purse">
          <FaPiggyBank />
          <div>
            <p>Purse Amount</p>
            <h2>₹{stats.purseAmount.toLocaleString()}</h2>
            <span className="meta">{savingsPercent}% of income</span>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p>This Month Income</p>
            <h2>₹{stats.thisMonthIncome.toLocaleString()}</h2>
          </div>
          <span className="meta">Monthly earnings</span>
        </div>

        <div className="stat-card">
          <div>
            <p>This Month Expense</p>
            <h2>₹{stats.thisMonthExpense.toLocaleString()}</h2>
          </div>
          <span className={`trend ${stats.thisMonthExpense > stats.prevMonthExpense ? 'up' : 'down'}`}>
            {stats.thisMonthExpense > stats.prevMonthExpense ? <FaArrowUp /> : <FaArrowDown />} vs last month
          </span>
        </div>

        <div className="stat-card">
          <div>
            <p>This Week Income</p>
            <h2>₹{stats.thisWeekIncome.toLocaleString()}</h2>
          </div>
          <span className="meta">Weekly earnings</span>
        </div>

        <div className="stat-card">
          <div>
            <p>This Week Expense</p>
            <h2>₹{stats.thisWeekExpense.toLocaleString()}</h2>
          </div>
          <span className={`trend ${stats.thisWeekExpense > stats.prevWeekExpense ? 'up' : 'down'}`}>
            {stats.thisWeekExpense > stats.prevWeekExpense ? <FaArrowUp /> : <FaArrowDown />} vs last week
          </span>
        </div>

        <div className="stat-card">
          <div>
            <p>Avg / Day</p>
            <h2>₹{avgDailySpend.toFixed(0)}</h2>
          </div>
          <span className="meta">Spending habit</span>
        </div>

        <div className="stat-card highlight">
          <div>
            <p>Predicted Next Month</p>
            <h2>₹{predictedNextMonth.toFixed(0)}</h2>
          </div>
          <span className="meta">Forecast</span>
        </div>
      </section>

      {/* Charts */}
      <section className="charts-grid">
        <div className="chart-card">
          <h3>Spending by Category</h3>
          <div className="chart-box">
            {categoryData.labels.length ? (
              <Doughnut data={categoryData} />
            ) : (
              <p className="empty">No data available</p>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3>Weekly Trend</h3>
          <div className="chart-box">
            <Bar data={weeklyData} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Monthly Trend</h3>
          <div className="chart-box">
            <Bar data={monthlyData} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Top Category Growth</h3>
          {categoryGrowth.length > 0 ? (
             categoryGrowth.slice(0, 3).map((c) => (
              <div key={c.category} className="growth-row">
                <span>{c.category}</span>
                <span className={c.change >= 0 ? 'up' : 'down'}>
                  {c.change >= 0 ? '+' : '-'}₹{Math.abs(c.change).toFixed(0)}
                </span>
              </div>
            ))
          ) : (
             <p className="empty">No data available</p>
          )}
        </div>
      </section>
    </div>
  );
}
