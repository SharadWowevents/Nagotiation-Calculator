import React, { useState } from 'react';
import { normalizedEmail } from '../assets/utils';

// Replace with your actual backend URL or use an environment variable
const API_URL = 'http://localhost:5000/api/auth/login';

export default function LoginForm({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: normalizedEmail(email), 
          code: code 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw the error message sent back from the backend (e.g., "Incorrect access code.")
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      // If the backend returns 200 OK, authentication is successful
      onLogin({ name: name.trim(), email: data.email });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Negotiation Calculator</h1>
        <p className="sub">Sign in with your approved work email and the team access code.</p>
        
        {error && <div className="error-msg">{error}</div>}
        
        <div className="field">
          <label>Your name</label>
          <input 
            required 
            value={name} 
            onChange={e => setName(e.target.value)} 
            disabled={isLoading} 
          />
        </div>
        <div className="field">
          <label>Work email</label>
          <input 
            type="email" 
            required 
            placeholder="you@wowevents.in" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            disabled={isLoading} 
          />
        </div>
        <div className="field">
          <label>Access code</label>
          <input 
            type="password" 
            required 
            value={code} 
            onChange={e => setCode(e.target.value)} 
            disabled={isLoading} 
          />
        </div>
        <button className="primary" type="submit" style={{ width: '100%' }} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}