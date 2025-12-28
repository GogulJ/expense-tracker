import React, { useState } from 'react';
import { useIncome } from '../hooks/useIncome';
import { format } from 'date-fns';
import { FaPlus, FaTrash, FaEdit, FaSearch } from 'react-icons/fa';

const SOURCES = ['Salary', 'Freelance', 'Bonus', 'Investment', 'Gift', 'Other'];

export default function IncomePage() {
  const { incomes, addIncome, deleteIncome, updateIncome } = useIncome();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    source: 'Salary',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const filteredIncomes = incomes.filter(
    (i) =>
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (income = null) => {
    if (income) {
      setEditingId(income.id);
      setFormData({
        title: income.title,
        amount: income.amount,
        source: income.source,
        date: format(income.date, 'yyyy-MM-dd'),
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        amount: '',
        source: 'Salary',
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
      source: formData.source,
      date: new Date(formData.date),
    };

    editingId ? await updateIncome(editingId, payload) : await addIncome(payload);
    setIsModalOpen(false);
  };

  return (
    <div className="fade-in">
      <header className="expenses-header">
        <h1>Income</h1>

        <button className="btn btn-primary" onClick={() => openModal()}>
          <FaPlus /> Add Income
        </button>
      </header>

      <div className="card search-card">
        <FaSearch />
        <input
          placeholder="Search by title or source…"
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
              <th>Source</th>
              <th className="amount">Amount</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredIncomes.map((i) => (
              <tr key={i.id}>
                <td>{format(i.date, 'MMM d, yyyy')}</td>
                <td className="title">{i.title}</td>
                <td>
                  <span className={`badge ${i.source.toLowerCase()}`}>
                    {i.source}
                  </span>
                </td>
                <td className="amount">₹{parseFloat(i.amount).toFixed(2)}</td>
                <td className="actions">
                  <button onClick={() => openModal(i)} className="icon-btn edit">
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => window.confirm('Delete this income?') && deleteIncome(i.id)}
                    className="icon-btn delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}

            {filteredIncomes.length === 0 && (
              <tr>
                <td colSpan="5" className="empty">
                  No income records found
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
            <h2>{editingId ? 'Edit Income' : 'Add Income'}</h2>

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
                <label>Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  {SOURCES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary">
                  {editingId ? 'Update' : 'Add'} Income
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
          color: #16a34a;
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
          background: rgba(34,197,94,0.12);
          color: #16a34a;
        }

        .badge.salary {
          background: rgba(99,102,241,0.12);
          color: #4f46e5;
        }

        .badge.freelance {
          background: rgba(168,85,247,0.12);
          color: #a855f7;
        }

        .badge.bonus {
          background: rgba(245,158,11,0.12);
          color: #f59e0b;
        }

        .badge.investment {
          background: rgba(6,182,212,0.12);
          color: #06b6d4;
        }

        .badge.gift {
          background: rgba(236,72,153,0.12);
          color: #ec4899;
        }

        .empty {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .modal-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          padding: 2.5rem;
          border-radius: 24px;
          width: 100%;
          max-width: 520px;
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.15),
            0 10px 10px -5px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .modal-card h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          color: #1f2937;
          font-weight: 600;
        }

        .input-group {
          margin-bottom: 1.25rem;
        }

        .input-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-group input,
        .input-group select {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          font-family: inherit;
          transition: all 0.3s ease;
          background: white;
        }

        .input-group input:focus,
        .input-group select:focus {
          outline: none;
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
          background: white;
        }

        .input-group input:hover,
        .input-group select:hover {
          border-color: #d1d5db;
        }

        .row {
          display: flex;
          gap: 1rem;
        }

        .row .input-group {
          flex: 1;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn {
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          box-shadow: 0 4px 15px -3px rgba(22, 163, 74, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px -3px rgba(22, 163, 74, 0.5);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .ghost {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .ghost:hover {
          background: #e5e7eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .ghost:active {
          transform: translateY(0);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
