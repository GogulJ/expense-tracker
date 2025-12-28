import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { format } from 'date-fns';
import { FaPlus, FaTrash, FaEdit, FaSearch } from 'react-icons/fa';
import './ExpensesPage.css';

const CATEGORIES = ['Food', 'Travel','Mobile Recharge', 'Taxies', 'Utilities', 'Movie', 'Xerox','Pharmacy', 'Others'];

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense, updateExpense } = useTransactions();

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
      <div className="search-card">
        <FaSearch />
        <input
          placeholder="Search by title or category…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th className="amount">Amount</th>
              <th>Actions</th>
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
                <td>
                  <div className="actions">
                    <button onClick={() => openModal(e)} className="icon-btn edit">
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => window.confirm('Delete this expense?') && deleteExpense(e.id)}
                      className="icon-btn delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
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

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label className="input-label">Title</label>
                <input
                  required
                  className="input-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="row">
                <div className="input-group">
                  <label className="input-label">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="input-control"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                  <div className="quick-add">
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, amount: (parseFloat(prev.amount || 0) + 50).toString() }))}>+50</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, amount: (parseFloat(prev.amount || 0) + 100).toString() }))}>+100</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, amount: (parseFloat(prev.amount || 0) + 500).toString() }))}>+500</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, amount: (parseFloat(prev.amount || 0) + 1000).toString() }))}>+1000</button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Date</label>
                  <input
                    type="date"
                    required
                    className="input-control"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Category</label>
                <select
                  className="input-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
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
    </div>
  );
}

