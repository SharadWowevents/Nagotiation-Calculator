import React, { useState, useEffect } from 'react';
import { DEFAULT_MARGINS, fmtMoney, fmtPct, priceForMargin, todayISO } from '../assets/utils';

// Replace with your actual backend URL or use an environment variable (e.g., import.meta.env.VITE_API_URL)
const API_URL = '/api/entries';

export default function EntryForm({ editingEntry, onSave, onCancel, currentUser }) {
  const [formData, setFormData] = useState({
    projectName: '',
    projectDate: todayISO(),
    createdBy: currentUser.name,
    ctc: '',
    margins: [...DEFAULT_MARGINS],
    approvedValue: '',
    notes: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingEntry) {
      setFormData({
        projectName: editingEntry.projectName || '',
        projectDate: editingEntry.projectDate || todayISO(),
        createdBy: editingEntry.createdBy || currentUser.name,
        ctc: editingEntry.ctc || '',
        margins: editingEntry.margins ? [...editingEntry.margins] : [...DEFAULT_MARGINS],
        approvedValue: editingEntry.approvedValue || '',
        notes: editingEntry.notes || ''
      });
    } else {
      setFormData(prev => ({ 
        ...prev, 
        projectName: '', 
        ctc: '', 
        approvedValue: '', 
        notes: '', 
        margins: [...DEFAULT_MARGINS] 
      }));
    }
    setErrorMsg('');
  }, [editingEntry, currentUser.name]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMarginChange = (index, value) => {
    const newMargins = [...formData.margins];
    newMargins[index] = value === '' ? '' : parseFloat(value);
    handleChange('margins', newMargins);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    // Prepare payload (excluding DB-generated fields like id, createdAt, updatedAt)
    const submission = {
      ...formData,
      createdByEmail: currentUser.email,
      ctc: parseFloat(formData.ctc),
      approvedValue: formData.approvedValue === '' ? null : parseFloat(formData.approvedValue),
    };

    try {
      const url = editingEntry ? `${API_URL}/${editingEntry.id}` : API_URL;
      const method = editingEntry ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        throw new Error('Failed to save entry to the database.');
      }

      const savedEntry = await response.json();
      
      // Pass the fully populated DB document (with MongoDB _id mapped to id and timestamps) back to App.js
      onSave(savedEntry); 
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Computed Values
  const ctcVal = parseFloat(formData.ctc) || 0;
  const approvedVal = parseFloat(formData.approvedValue);
  const hasApproved = isFinite(approvedVal) && approvedVal > 0 && ctcVal >= 0;
  const gpAmount = hasApproved ? approvedVal - ctcVal : null;
  const gpPct = hasApproved ? (gpAmount / approvedVal) * 100 : null;

  return (
    <div>
      <div className="section-title">{editingEntry ? 'Edit entry' : 'New negotiation entry'}</div>
      
      {errorMsg && <div className="error-msg">{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="field">
            <label>Project name</label>
            <input required value={formData.projectName} onChange={e => handleChange('projectName', e.target.value)} disabled={isSaving} />
          </div>
          <div className="field">
            <label>Project date</label>
            <input type="date" required value={formData.projectDate} onChange={e => handleChange('projectDate', e.target.value)} disabled={isSaving} />
          </div>
          <div className="field">
            <label>Created by</label>
            <input required value={formData.createdBy} onChange={e => handleChange('createdBy', e.target.value)} disabled={isSaving} />
          </div>
        </div>
        
        <div className="field" style={{ maxWidth: '260px' }}>
          <label>Cost to company (CTC) — ₹</label>
          <input type="number" min="0" step="1" required value={formData.ctc} onChange={e => handleChange('ctc', e.target.value)} disabled={isSaving} />
        </div>
        
        <div className="section-title" style={{ marginTop: '4px' }}>
          Quote options 
          <button type="button" className="ghost" onClick={() => handleChange('margins', [...DEFAULT_MARGINS])} style={{ fontSize: '12px' }} disabled={isSaving}>
            Reset to 50 / 35 / 25
          </button>
        </div>
        
        <div className="quote-grid">
          {formData.margins.map((margin, i) => {
            const price = priceForMargin(ctcVal, margin);
            return (
              <div className="quote-card" key={i}>
                <div className="qtitle">Quote {i + 1}</div>
                <label>Gross profit margin %</label>
                <input type="number" min="0" max="99.9" step="0.1" value={margin} onChange={e => handleMarginChange(i, e.target.value)} disabled={isSaving} />
                <div className="price">{price == null ? '—' : fmtMoney(price)}</div>
                <div className="profit">
                  {margin >= 100 ? 'Margin must be under 100%' : (price != null && ctcVal > 0 ? `Profit ${fmtMoney(price - ctcVal)}` : '')}
                </div>
              </div>
            );
          })}
        </div>

        <div className="gp-box">
          <label>Quote value approved by client — ₹</label>
          <input type="number" min="0" step="1" value={formData.approvedValue} onChange={e => handleChange('approvedValue', e.target.value)} style={{ maxWidth: '260px' }} disabled={isSaving} />
          <div className="gp-result">
            <div className={`gp-stat ${gpAmount !== null ? (gpAmount < 0 ? 'loss' : 'win') : ''}`}>
              <label>Gross profit (₹)</label>
              <div className="num">{gpAmount == null ? '—' : fmtMoney(gpAmount)}</div>
            </div>
            <div className={`gp-stat ${gpAmount !== null ? (gpAmount < 0 ? 'loss' : 'win') : ''}`}>
              <label>Gross profit margin</label>
              <div className="num">{gpPct == null ? '—' : fmtPct(gpPct)}</div>
            </div>
          </div>
        </div>

        <div className="field">
          <label>Notes (optional)</label>
          <textarea rows="2" value={formData.notes} onChange={e => handleChange('notes', e.target.value)} disabled={isSaving} />
        </div>

        <div className="form-actions">
          <button className="primary" type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : (editingEntry ? 'Save changes' : 'Save entry')}
          </button>
          {editingEntry && (
            <button type="button" className="ghost" onClick={onCancel} disabled={isSaving}>Cancel</button>
          )}
        </div>
      </form>
    </div>
  );
}