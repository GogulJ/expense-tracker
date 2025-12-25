import React, { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { format } from 'date-fns';
import { FaPlus, FaTrash, FaEdit, FaSearch } from 'react-icons/fa';

const CATEGORIES = ['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Health', 'Other'];

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense, updateExpense } = useExpenses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const filteredExpenses = expenses.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (expense = null) => {
    if (expense) {
      setEditingId(expense.id);
      setFormData({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: format(expense.date, 'yyyy-MM-dd'),
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        amount: '',
        category: 'Food',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: new Date(formData.date),
    };

    editingId ? await updateExpense(editingId, payload) : await addExpense(payload);
    setIsModalOpen(false);
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <header className="expenses-header">
        <h1>Expenses</h1>

        <button className="btn btn-primary" onClick={() => openModal()}>
          <FaPlus /> Add Expense
        </button>
      </header>

      {/* Search */}
      <div className="card search-card">
        <FaSearch />
        <input
          placeholder="Search by title or category…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th className="amount">Amount</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredExpenses.map((e) => (
              <tr key={e.id}>
                <td>{format(e.date, 'MMM d, yyyy')}</td>
                <td className="title">{e.title}</td>
                <td>
                  <span className={`badge ${e.category.toLowerCase()}`}>
                    {e.category}
                  </span>
                </td>
                <td className="amount">₹{parseFloat(e.amount).toFixed(2)}</td>
                <td className="actions">
                  <button onClick={() => openModal(e)} className="icon-btn edit">
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => window.confirm('Delete this expense?') && deleteExpense(e.id)}
                    className="icon-btn delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}

            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="5" className="empty">
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>{editingId ? 'Edit Expense' : 'Add Expense'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="row">
                <div className="input-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label>Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary">
                  {editingId ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .expenses-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .search-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .search-card input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.95rem;
        }

        .table-card {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }

        thead {
          background: #f9fafb;
        }

        th, td {
          padding: 0.9rem;
          text-align: left;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        .title {
          font-weight: 500;
        }

        .amount {
          font-weight: 600;
        }

        .actions {
          text-align: right;
        }

        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          margin-left: 6px;
          border-radius: 6px;
        }

        .icon-btn.edit:hover {
          background: rgba(99,102,241,0.15);
        }

        .icon-btn.delete:hover {
          background: rgba(239,68,68,0.15);
          color: #ef4444;
        }

        .badge {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.8rem;
          background: rgba(99,102,241,0.12);
          color: #4f46e5;
        }

        .empty {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-card {
          background: white;
          padding: 2rem;
          border-radius: 18px;
          width: 100%;
          max-width: 520px;
          animation: pop .3s ease;
        }

        .row {
          display: flex;
          gap: 1rem;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .ghost {
          background: #f3f4f6;
        }

        @keyframes pop {
          from { opacity: 0; transform: scale(.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
