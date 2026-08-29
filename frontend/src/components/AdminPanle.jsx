import React, { useState } from 'react';
import { isApproved, normalizedEmail } from '../assets/utils';

// Replace with your actual backend URL or use an environment variable (e.g., import.meta.env.VITE_API_URL)
const API_URL = '/api/settings'; 

export default function AdminPanel({ settings, updateSettings }) {
  const [newEmail, setNewEmail] = useState('');
  const [newAdmin, setNewAdmin] = useState('');
  const [newCode, setNewCode] = useState(settings.accessCode);
  const [msg, setMsg] = useState('');

  // Helper function to handle the API PUT request
  const saveSettingsToBackend = async (updatedData) => {
    try {
      setMsg('Saving changes...');
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings on the server.');
      }

      const savedSettings = await response.json();
      updateSettings(savedSettings); // Update React state with the confirmed DB data
      return true;
    } catch (err) {
      setMsg(`Error: ${err.message}`);
      return false;
    }
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    const val = normalizedEmail(newEmail);
    if (val && !settings.approvedEmails.map(normalizedEmail).includes(val)) {
      const newSettings = { 
        ...settings, 
        approvedEmails: [...settings.approvedEmails, val] 
      };
      
      const success = await saveSettingsToBackend(newSettings);
      if (success) {
        setNewEmail('');
        setMsg('Email added successfully.');
      }
    } else {
      setMsg('Email is invalid or already approved.');
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const val = normalizedEmail(newAdmin);
    
    if (!isApproved(val, settings)) {
      setMsg('That email must be an approved team email before it can be made admin.');
      return;
    }
    
    if (!settings.admins.map(normalizedEmail).includes(val)) {
      const newSettings = { 
        ...settings, 
        admins: [...settings.admins, val] 
      };
      
      const success = await saveSettingsToBackend(newSettings);
      if (success) {
        setNewAdmin('');
        setMsg('Admin added successfully.');
      }
    } else {
      setMsg('User is already an admin.');
    }
  };

  const handleUpdateCode = async (e) => {
    e.preventDefault();
    if (newCode.trim()) {
      const newSettings = { 
        ...settings, 
        accessCode: newCode.trim() 
      };
      
      const success = await saveSettingsToBackend(newSettings);
      if (success) {
        setMsg('Access code updated successfully.');
      }
    }
  };

  const removeEmail = async (email) => {
    if (settings.approvedEmails.length > 1) {
      const newSettings = { 
        ...settings, 
        approvedEmails: settings.approvedEmails.filter(e => e !== email) 
      };
      
      const success = await saveSettingsToBackend(newSettings);
      if (success) {
         setMsg('Email removed successfully.');
      }
    } else {
      setMsg('Cannot remove the last approved email.');
    }
  };

  const removeAdmin = async (email) => {
    if (settings.admins.length > 1) {
      const newSettings = { 
        ...settings, 
        admins: settings.admins.filter(e => e !== email) 
      };
      
      const success = await saveSettingsToBackend(newSettings);
      if (success) {
         setMsg('Admin removed successfully.');
      }
    } else {
      setMsg('Cannot remove the last admin.');
    }
  };

  return (
    <div>
      {msg && <div className="banner info" style={{ borderRadius: '8px', marginBottom: '16px' }}>{msg}</div>}
      
      <div className="section-title">Approved team emails</div>
      <ul className="admin-list">
        {settings.approvedEmails.map(email => (
          <li key={email}>
            {email}
            {settings.approvedEmails.length > 1 && (
              <button className="ghost" type="button" onClick={() => removeEmail(email)}>Remove</button>
            )}
          </li>
        ))}
      </ul>
      <form className="inline-form" onSubmit={handleAddEmail}>
        <input type="email" placeholder="teammate@wowevents.in" required value={newEmail} onChange={e => setNewEmail(e.target.value)} />
        <button className="primary" type="submit">Add</button>
      </form>

      <div className="section-title" style={{ marginTop: '26px' }}>Admins</div>
      <ul className="admin-list">
        {settings.admins.map(email => (
          <li key={email}>
            {email}
            {settings.admins.length > 1 && (
              <button className="ghost" type="button" onClick={() => removeAdmin(email)}>Remove</button>
            )}
          </li>
        ))}
      </ul>
      <form className="inline-form" onSubmit={handleAddAdmin}>
        <input type="email" placeholder="must already be an approved email" required value={newAdmin} onChange={e => setNewAdmin(e.target.value)} />
        <button className="primary" type="submit">Make admin</button>
      </form>

      <div className="section-title" style={{ marginTop: '26px' }}>Access code</div>
      <form className="inline-form" onSubmit={handleUpdateCode}>
        <input type="text" placeholder="new access code" required value={newCode} onChange={e => setNewCode(e.target.value)} />
        <button className="primary" type="submit">Update</button>
      </form>

      <div className="footer-note">
        This is a lightweight team gate, not secure authentication — anyone with this code and an approved email can sign in. Treat it like a shared door code.
      </div>
    </div>
  );
}