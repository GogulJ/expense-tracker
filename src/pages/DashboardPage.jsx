import React, { useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
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
} from 'date-fns';
import { FaArrowUp, FaArrowDown, FaWallet } from 'react-icons/fa';

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

  /* =========================
     📊 CORE STATS
  ========================= */
  const stats = useMemo(() => {
    const now = new Date();
    const lastMonth = subMonths(now, 1);

    const total = expenses.reduce(
      (acc, curr) => acc + (parseFloat(curr.amount) || 0),
      0
    );

    const thisMonth = expenses
      .filter((e) => isSameMonth(e.date, now))
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    const thisWeek = expenses
      .filter((e) => isSameWeek(e.date, now))
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    const prevMonth = expenses
      .filter((e) => isSameMonth(e.date, lastMonth))
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    return { total, thisMonth, thisWeek, prevMonth };
  }, [expenses]);

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
    return stats.total / days.size;
  }, [expenses, stats.total]);

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
    stats.prevMonth > 0
      ? ((stats.thisMonth - stats.prevMonth) / stats.prevMonth) * 100
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

      {/* KPI Cards */}
      <section className="stats-grid">
        <div className="stat-card highlight">
          <FaWallet />
          <div>
            <p>Total Spending</p>
            <h2>₹{stats.total.toLocaleString()}</h2>
            <span>Lifetime</span>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p>This Month</p>
            <h2>₹{stats.thisMonth.toLocaleString()}</h2>
          </div>
          <span className={`trend ${stats.thisMonth > stats.prevMonth ? 'up' : 'down'}`}>
            {stats.thisMonth > stats.prevMonth ? <FaArrowUp /> : <FaArrowDown />} vs last month
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
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(10px);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .stat-card.highlight {
          background: linear-gradient(135deg, #6366F1, #4F46E5);
          color: #fff;
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
