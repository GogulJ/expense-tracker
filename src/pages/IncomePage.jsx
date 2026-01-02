import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { format } from 'date-fns';
import { FaPlus, FaTrash, FaEdit, FaSearch } from 'react-icons/fa';
import './IncomePage.css';

const SOURCES = ['Salary','Dad','Investment','Balance Add-on','Other'];

export default function IncomePage() {
  const { incomes, addIncome, deleteIncome, updateIncome } = useTransactions();

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

      <div className="search-card">
        <FaSearch />
        <input
          placeholder="Search by title or source…"
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
              <th>Source</th>
              <th className="amount">Amount</th>
              <th>Actions</th>
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
                <td>
                  <div className="actions">
                    <button onClick={() => openModal(i)} className="icon-btn edit">
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => window.confirm('Delete this income?') && deleteIncome(i.id)}
                      className="icon-btn delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
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
                    step="5"
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
                <label className="input-label">Source</label>
                <select
                  className="input-control"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  {SOURCES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
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
    </div>
  );
}

