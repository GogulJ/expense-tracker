import React, { useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useIncome } from '../hooks/useIncome';
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
  const { expenses, loading } = useExpenses();
  const { incomes } = useIncome();

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
    const weekStart = startOfWeek(now);

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
            <span>Lifetime</span>
          </div>
        </div>

        <div className="stat-card highlight purse">
          <FaPiggyBank />
          <div>
            <p>Purse Amount</p>
            <h2>₹{stats.purseAmount.toLocaleString()}</h2>
            <span>{savingsPercent}% of income</span>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p>This Month Income</p>
            <h2>₹{stats.thisMonthIncome.toLocaleString()}</h2>
          </div>
          <span className="muted">Monthly earnings</span>
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
          <span className="muted">Weekly earnings</span>
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
          <span className="muted">Spending habit</span>
        </div>

        <div className="stat-card highlight">
          <div>
            <p>Predicted Next Month</p>
            <h2>₹{predictedNextMonth.toFixed(0)}</h2>
          </div>
          <span>Forecast</span>
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
          {categoryGrowth.slice(0, 3).map((c) => (
            <div key={c.category} className="growth-row">
              <span>{c.category}</span>
              <span className={c.change >= 0 ? 'up' : 'down'}>
                {c.change >= 0 ? '+' : '-'}₹{Math.abs(c.change).toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Styles */}
      <style>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.2rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          padding: 1.4rem;
          border-radius: 16px;
          background: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        .stat-card:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          border-color: #d1d5db;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .stat-card p {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat-card h2 {
          font-size: 1.6rem;
          margin: 0.3rem 0 0 0;
          color: #1f2937;
          font-weight: 700;
        }
        .stat-card span {
          font-size: 0.75rem;
          color: #9ca3af;
          font-weight: 500;
        }
        .stat-card.highlight {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .stat-card.highlight:hover {
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
          transform: translateY(-2px);
        }
        .stat-card.highlight.purse {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
        }
        .stat-card.highlight.purse:hover {
          box-shadow: 0 8px 20px rgba(22, 163, 74, 0.4);
        }
        .stat-card.highlight p {
          color: rgba(255, 255, 255, 0.85);
        }
        .stat-card.highlight h2 {
          color: white;
        }
        .stat-card.highlight span {
          color: rgba(255, 255, 255, 0.7);
        }
        .stat-card svg {
          font-size: 1.5rem;
          margin-right: 0.8rem;
          color: #6366f1;
          opacity: 0.8;
        }
        .stat-card.highlight svg {
          color: rgba(255, 255, 255, 0.95);
        }
        .trend {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          margin-top: 0.4rem;
          width: fit-content;
        }
        .trend.up {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }
        .trend.down {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
        }
        .muted {
          color: #9ca3af !important;
          font-size: 0.75rem !important;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
        }
        .chart-box {
          height: 280px;
        }
        .growth-row {
          display: flex;
          justify-content: space-between;
          margin-top: 0.6rem;
        }
        .up { color: #16a34a; }
        .down { color: #dc2626; }
        .alert-card {
          background: #fff7ed;
          border-left: 5px solid #f97316;
          padding: 1rem;
          margin-bottom: 1.2rem;
          border-radius: 12px;
        }
        .alert-card.alert-warning {
          background: #fef3c7;
          border-left: 5px solid #eab308;
        }
        .fade-in {
          animation: fade 0.4s ease-in;
        }
        @keyframes fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
