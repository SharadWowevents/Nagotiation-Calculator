import React, { useState, useEffect } from 'react';
import './App.css'; 
import { isAdmin } from './assets/utils';
import LoginForm from './components/Login'; 
import AdminPanel from './components/AdminPanle'; // (Note: ensure your file name matches this spelling)
import EntryForm from './components/EntryForm';
import SavedEntries from './components/SavedEntries';

// Replace with your actual backend URLs
const API_SETTINGS_URL = 'http://localhost:5000/api/settings';
const API_ENTRIES_URL = 'http://localhost:5000/api/entries';

export default function App() {
  // Application state (starts empty, gets populated from DB)
  const [appState, setAppState] = useState({
    settings: null,
    entries: []
  });
  
  // User session state (kept in localStorage so users stay logged in on refresh)
  const [currentUser, setCurrentUser] = useState(() => {
    const savedSession = localStorage.getItem('negcalc_session');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  const [activeTab, setActiveTab] = useState('new');
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch data from MongoDB whenever a valid user is logged in
  useEffect(() => {
    if (!currentUser) return;

    const fetchAppData = async () => {
      setIsLoadingData(true);
      try {
        const [settingsRes, entriesRes] = await Promise.all([
          fetch(API_SETTINGS_URL),
          fetch(API_ENTRIES_URL)
        ]);

        if (settingsRes.ok && entriesRes.ok) {
          const settingsData = await settingsRes.json();
          const entriesData = await entriesRes.json();
          
          setAppState({
            settings: settingsData,
            entries: entriesData
          });
        } else {
          console.error("Failed to fetch data from the server.");
        }
      } catch (error) {
        console.error("Network error fetching initial data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAppData();
  }, [currentUser]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('negcalc_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('negcalc_session');
    setAppState({ settings: null, entries: [] }); // Clear memory on logout
    setActiveTab('new');
    setEditingEntryId(null);
  };

  // State update handlers: These just update the React UI after the child 
  // components successfully save/delete to the MongoDB backend
  const handleSaveEntry = (entry) => {
    setAppState(prev => {
      const isExisting = prev.entries.some(e => e.id === entry.id);
      return {
        ...prev,
        entries: isExisting 
          ? prev.entries.map(e => e.id === entry.id ? entry : e)
          : [entry, ...prev.entries] // Added to top of list
      };
    });
    setEditingEntryId(null);
    setActiveTab('saved');
  };

  const handleDeleteEntry = (id) => {
    setAppState(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== id)
    }));
  };

  // If not logged in, show login form. (No longer passing settings here, as Login handles its own fetch)
  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Prevent rendering main app until settings are successfully pulled from DB
  if (isLoadingData || !appState.settings) {
    return (
      <div className="center-screen">
        <p style={{ color: 'var(--text-dim)' }}>Loading application data...</p>
      </div>
    );
  }

  const userIsAdmin = isAdmin(currentUser.email, appState.settings);
  const editingEntry = editingEntryId ? appState.entries.find(e => e.id === editingEntryId) : null;

  return (
    <div id="root">
      <header className="topbar">
        <h1>Negotiation Calculator</h1>
        <div className="who">
          {currentUser.name} &middot; {currentUser.email}
          {userIsAdmin && <span className="pill">admin</span>}
          &nbsp;<button className="ghost" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <nav className="tabs">
        <button className={activeTab === 'new' ? 'active' : ''} onClick={() => setActiveTab('new')}>
          {editingEntryId ? 'Edit Entry' : 'New Entry'}
        </button>
        <button className={activeTab === 'saved' ? 'active' : ''} onClick={() => { setActiveTab('saved'); setEditingEntryId(null); }}>
          Saved Entries
        </button>
        {userIsAdmin && (
          <button className={activeTab === 'admin' ? 'active' : ''} onClick={() => setActiveTab('admin')}>
            Admin
          </button>
        )}
      </nav>

      <main>
        {activeTab === 'new' && (
          <EntryForm 
            currentUser={currentUser} 
            editingEntry={editingEntry} 
            onSave={handleSaveEntry} 
            onCancel={() => { setEditingEntryId(null); setActiveTab('saved'); }} 
          />
        )}
        
        {activeTab === 'saved' && (
          <SavedEntries 
            entries={appState.entries} 
            onEdit={(id) => { setEditingEntryId(id); setActiveTab('new'); }} 
            onDelete={handleDeleteEntry} 
          />
        )}
        
        {activeTab === 'admin' && userIsAdmin && (
          <AdminPanel 
            settings={appState.settings} 
            updateSettings={(newSettings) => setAppState({ ...appState, settings: newSettings })} 
          />
        )}

        <div className="footer-note">
          Gross profit margin, not markup: price is derived as CTC &divide; (1 &minus; margin%), so the margin% shown is the share of the final price that is profit.
        </div>
      </main>
    </div>
  );
}