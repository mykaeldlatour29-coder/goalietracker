import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Session from './components/Session';
import './index.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0D0D0D', flexDirection: 'column', gap: 16
    }}>
      <div style={{
        width: 48, height: 48, background: '#CC1111', borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="2" y="10" width="24" height="16" rx="2" stroke="white" strokeWidth="2"/>
          <line x1="2" y1="10" x2="26" y2="10" stroke="white" strokeWidth="2.5"/>
          <line x1="10" y1="10" x2="10" y2="26" stroke="white" strokeWidth="1.5"/>
          <line x1="18" y1="10" x2="18" y2="26" stroke="white" strokeWidth="1.5"/>
          <line x1="2" y1="18" x2="26" y2="18" stroke="white" strokeWidth="1.5"/>
        </svg>
      </div>
      <div style={{ color: '#555', fontSize: 13 }}>Chargement...</div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/session/:id" element={user ? <Session user={user} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
