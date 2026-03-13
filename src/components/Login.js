import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(''); setLoading(true);
    try {
      if (isNew) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      const msgs = {
        'auth/user-not-found': 'Utilisateur introuvable.',
        'auth/wrong-password': 'Mot de passe incorrect.',
        'auth/email-already-in-use': 'Courriel déjà utilisé.',
        'auth/weak-password': 'Mot de passe trop faible (min. 6 caractères).',
        'auth/invalid-email': 'Adresse courriel invalide.',
        'auth/invalid-credential': 'Courriel ou mot de passe incorrect.',
      };
      setError(msgs[e.code] || 'Erreur: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 380, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
          <div style={{ width: 44, height: 44, background: '#CC1111', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="1" y="9" width="24" height="15" rx="2" stroke="white" strokeWidth="2"/>
              <line x1="1" y1="9" x2="25" y2="9" stroke="white" strokeWidth="2.5"/>
              <line x1="9" y1="9" x2="9" y2="24" stroke="white" strokeWidth="1.5"/>
              <line x1="17" y1="9" x2="17" y2="24" stroke="white" strokeWidth="1.5"/>
              <line x1="1" y1="17" x2="25" y2="17" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>Goalie Tracker</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Entraîneme
