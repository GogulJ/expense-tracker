import React, { useMemo } from 'react';
import { useHabits } from '../context/HabitContext';
import { format, subDays, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { FaFire, FaTrophy, FaChartLine, FaCalendarCheck } from 'react-icons/fa';
import './HabitAnalyticsPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function HabitAnalyticsPage() {
  const { habits, logs, getHabitStreak } = useHabits();

  // Stats
  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const completedToday = logs.filter(l => l.date === today).length;
    const totalHabits = habits.length;
    
    // Best streak
    let bestStreak = 0;
    let bestHabit = '';
    habits.forEach(h => {
      const streak = getHabitStreak(h.id);
      if (streak > bestStreak) {
        bestStreak = streak;
        bestHabit = h.title;
      }
    });

    // Total completions this week
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const thisWeekLogs = logs.filter(l => {
      const d = new Date(l.date);
      return d >= weekStart && d <= weekEnd;
    }).length;

    // Completion rate (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      last7Days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
    }
    const possibleCompletions = habits.length * 7;
    const actualCompletions = logs.filter(l => last7Days.includes(l.date)).length;
    const completionRate = possibleCompletions > 0 ? (actualCompletions / possibleCompletions) * 100 : 0;

    return {
      completedToday,
      totalHabits,
      bestStreak,
      bestHabit,
      thisWeekLogs,
      completionRate
    };
  }, [habits, logs]);

  // Weekly Trend Chart (Last 4 weeks)
  const weeklyTrendData = useMemo(() => {
    const weeks = [];
    const data = [];

    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(new Date(), i));
      const weekEnd = endOfWeek(subWeeks(new Date(), i));
      const label = `Week ${format(weekStart, 'MMM d')}`;
      weeks.push(label);

      const weekLogs = logs.filter(l => {
        const d = new Date(l.date);
        return d >= weekStart && d <= weekEnd;
      }).length;
      data.push(weekLogs);
    }

    return {
      labels: weeks,
      datasets: [
        {
          label: 'Habits Completed',
          data,
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: '#10B981',
          borderWidth: 2,
          borderRadius: 8,
        }
      ]
    };
  }, [logs]);

  // Daily Trend (Last 14 days)
  const dailyTrendData = useMemo(() => {
    const labels = [];
    const data = [];

    for (let i = 13; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      labels.push(format(d, 'MMM d'));
      
      const count = logs.filter(l => l.date === dateStr).length;
      data.push(count);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Daily Completions',
          data,
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: '#10B981',
          tension: 0.4,
          pointBackgroundColor: '#10B981',
        }
      ]
    };
  }, [logs]);

  // Habit Breakdown (Completion count per habit)
  const habitBreakdownData = useMemo(() => {
    const labels = habits.map(h => h.title);
    const data = habits.map(h => {
      return logs.filter(l => l.habitId === h.id).length;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Total Completions',
          data,
          backgroundColor: [
            '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
          ],
        }
      ]
    };
  }, [habits, logs]);

  // Streaks leaderboard
  const streaksLeaderboard = useMemo(() => {
    return habits
      .map(h => ({ title: h.title, streak: getHabitStreak(h.id) }))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5);
  }, [habits, logs]);

  return (
    <div className="fade-in">
      <header className="analytics-header">
        <h1><FaChartLine /> Habit Analytics</h1>
        <p>Track your progress and build consistency</p>
      </header>

      {/* KPI Cards */}
      <section className="analytics-kpi-grid">
        <div className="kpi-card">
          <FaCalendarCheck className="kpi-icon green" />
          <div>
            <p>Completed Today</p>
            <h2>{stats.completedToday} <span>/ {stats.totalHabits}</span></h2>
          </div>
        </div>

        <div className="kpi-card">
          <FaFire className="kpi-icon orange" />
          <div>
            <p>Best Streak</p>
            <h2>{stats.bestStreak} days</h2>
            <span className="meta">{stats.bestHabit || 'N/A'}</span>
          </div>
        </div>

        <div className="kpi-card">
          <FaTrophy className="kpi-icon yellow" />
          <div>
            <p>This Week</p>
            <h2>{stats.thisWeekLogs}</h2>
            <span className="meta">completions</span>
          </div>
        </div>

        <div className="kpi-card">
          <FaChartLine className="kpi-icon blue" />
          <div>
            <p>7-Day Rate</p>
            <h2>{stats.completionRate.toFixed(0)}%</h2>
            <span className="meta">consistency</span>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="analytics-charts">
        <div className="chart-card wide">
          <h3>Daily Progress (Last 14 Days)</h3>
          <div className="chart-box">
            <Line data={dailyTrendData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Weekly Overview</h3>
          <div className="chart-box">
            <Bar data={weeklyTrendData} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Habit Breakdown</h3>
          <div className="chart-box">
            {habits.length > 0 ? (
              <Doughnut data={habitBreakdownData} />
            ) : (
              <p className="empty">No habits yet</p>
            )}
          </div>
        </div>
      </section>

      {/* Streaks Leaderboard */}
      <section className="streaks-section">
        <h2>🔥 Current Streaks</h2>
        <div className="streaks-list">
          {streaksLeaderboard.map((h, i) => (
            <div key={h.title} className="streak-row">
              <span className="rank">#{i + 1}</span>
              <span className="habit-name">{h.title}</span>
              <span className="streak-count">{h.streak} days</span>
            </div>
          ))}
          {streaksLeaderboard.length === 0 && (
            <p className="empty">Start tracking habits to see streaks!</p>
          )}
        </div>
      </section>
    </div>
  );
}
