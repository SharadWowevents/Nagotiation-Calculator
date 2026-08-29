import React, { useState } from 'react';
import { fmtMoney, fmtPct, priceForMargin } from '../assets/utils';

// Replace with your actual backend URL or use an environment variable (e.g., import.meta.env.VITE_API_URL)
const API_URL = '/api/entries';

export default function SavedEntries({ entries, onEdit, onDelete }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDelete = async (id) => {
    setIsDeleting(true);
    setErrorMsg('');
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete the entry from the server.');
      }

      // If successful, tell the parent component to remove it from the local UI state
      onDelete(id);
      setConfirmDeleteId(null);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="table-wrap">
        <div className="empty-state">No entries saved yet. Create one from the New Entry tab.</div>
      </div>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

  return (
    <div>
      <div className="section-title">Saved entries ({entries.length})</div>
      
      {errorMsg && <div className="error-msg">{errorMsg}</div>}
      
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Project</th><th>Date</th><th>Created by</th><th>CTC</th>
              <th>Quote 1</th><th>Quote 2</th><th>Quote 3</th>
              <th>Approved value</th><th>Gross profit %</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map(en => {
              if (confirmDeleteId === en.id) {
                return (
                  <tr key={en.id}>
                    <td colSpan="10">
                      Delete "{en.projectName}"? 
                      <button 
                        className="danger" 
                        onClick={() => handleDelete(en.id)} 
                        style={{ marginLeft: '8px' }}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, delete'}
                      </button> 
                      <button 
                        className="ghost" 
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              }

              const prices = en.margins.map(m => priceForMargin(en.ctc, m));
              const gpPct = (en.approvedValue && en.approvedValue > 0) ? ((en.approvedValue - en.ctc) / en.approvedValue) * 100 : null;

              return (
                <tr key={en.id}>
                  <td>{en.projectName}</td>
                  <td>{en.projectDate}</td>
                  <td>{en.createdBy}</td>
                  <td>{fmtMoney(en.ctc)}</td>
                  <td>{fmtMoney(prices[0])}</td>
                  <td>{fmtMoney(prices[1])}</td>
                  <td>{fmtMoney(prices[2])}</td>
                  <td>{en.approvedValue ? fmtMoney(en.approvedValue) : '—'}</td>
                  <td>{gpPct == null ? '—' : fmtPct(gpPct)}</td>
                  <td className="actions-cell">
                    <button className="ghost" onClick={() => onEdit(en.id)}>Edit</button>
                    <button className="ghost" onClick={() => setConfirmDeleteId(en.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}