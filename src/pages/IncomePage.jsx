import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { format } from 'date-fns';
import { FaPlus, FaTrash, FaEdit, FaSearch } from 'react-icons/fa';
import './IncomePage.css';

export default function IncomePage() {
  const { incomes, addIncome, deleteIncome, updateIncome, sources, addSource } = useTransactions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSource, setNewSource] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    source: sources[0] || 'Salary',
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
        source: sources[0] || 'Salary',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
    setIsAddingSource(false);
    setNewSource('');
    setIsModalOpen(true);
  };

  const handleAddSource = async () => {
    if (newSource.trim()) {
      await addSource(newSource);
      setFormData({ ...formData, source: newSource.trim() });
      setNewSource('');
      setIsAddingSource(false);
    }
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <select
                    className="input-control"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    {sources.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsAddingSource(!isAddingSource)}
                    style={{ padding: '8px 12px', minWidth: 'auto' }}
                  >
                    <FaPlus />
                  </button>
                </div>
                {isAddingSource && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="New source name"
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSource()}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleAddSource}
                      style={{ padding: '8px 16px' }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setIsAddingSource(false);
                        setNewSource('');
                      }}
                      style={{ padding: '8px 16px' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
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

