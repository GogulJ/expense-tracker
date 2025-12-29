import React, { useState } from 'react';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { FaPlus, FaTrash, FaBullseye, FaCheck, FaClock } from 'react-icons/fa';
import './Goals.css';

export default function Goals({ goals, onAddGoal, onDeleteGoal, onToggleGoal }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!goalName.trim()) return;

    const newGoal = {
      id: Date.now().toString(),
      name: goalName.trim(),
      targetDate: targetDate || null,
      completed: false,
      createdAt: new Date().toISOString()
    };

    onAddGoal(newGoal);
    setIsModalOpen(false);
    setGoalName('');
    setTargetDate('');
  };

  const completedCount = goals.filter(g => g.completed).length;

  const getDeadlineStatus = (goal) => {
    if (!goal.targetDate || goal.completed) return null;
    
    const target = new Date(goal.targetDate);
    const daysLeft = differenceInDays(target, new Date());
    
    if (isPast(target) && !isToday(target)) {
      return { text: 'Overdue', class: 'overdue', days: Math.abs(daysLeft) };
    } else if (isToday(target)) {
      return { text: 'Due today', class: 'due-today', days: 0 };
    } else if (daysLeft <= 3) {
      return { text: `${daysLeft} days left`, class: 'due-soon', days: daysLeft };
    } else {
      return { text: `${daysLeft} days left`, class: 'on-track', days: daysLeft };
    }
  };

  return (
    <div className="goals-section">
      <div className="goals-header">
        <div>
          <h2><FaBullseye /> Goals</h2>
          <span className="goals-count">{completedCount}/{goals.length} completed</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Add Goal
        </button>
      </div>

      <div className="goals-list">
        {goals.map(goal => {
          const deadline = getDeadlineStatus(goal);
          
          return (
            <div key={goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
              <button 
                className={`goal-checkbox ${goal.completed ? 'checked' : ''}`}
                onClick={() => onToggleGoal(goal.id)}
              >
                {goal.completed && <FaCheck />}
              </button>
              
              <div className="goal-content">
                <span className="goal-name">{goal.name}</span>
                {goal.completed ? (
                  <span className="goal-deadline completed-mark">
                    <FaCheck /> Done
                  </span>
                ) : goal.targetDate && (
                  <span className={`goal-deadline ${deadline?.class || ''}`}>
                    <FaClock />
                    {deadline?.text || format(new Date(goal.targetDate), 'MMM d, yyyy')}
                  </span>
                )}
              </div>

              <div className="goal-actions">
                {!goal.completed && (
                  <button 
                    className="mark-complete-btn"
                    onClick={() => onToggleGoal(goal.id)}
                  >
                    <FaCheck /> Complete
                  </button>
                )}
                
                <button 
                  className="goal-delete"
                  onClick={() => onDeleteGoal(goal.id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="no-goals">
            <p>No goals yet. Add one to stay focused!</p>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Add New Goal</h2>
            <form onSubmit={handleAddGoal} className="modal-form">
              <div className="input-group">
                <label className="input-label">What do you want to achieve?</label>
                <input
                  autoFocus
                  required
                  className="input-control"
                  placeholder="e.g. Complete 30-day challenge"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FaClock style={{ marginRight: '0.5rem' }} />
                  Target Date (optional)
                </label>
                <input
                  type="date"
                  className="input-control"
                  value={targetDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
                <span className="input-hint">Set a deadline to stay accountable</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary">Add Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
