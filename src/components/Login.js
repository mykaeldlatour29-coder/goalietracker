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
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Entraînement gardien de but</div>
          </div>
        </div>

        <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 20 }}>
          {isNew ? 'Créer un compte' : 'Connexion'}
        </div>

        {error && <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#CC1111', marginBottom: 14 }}>{error}</div>}

        <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Courriel</label>
        <input
          style={{ width: '100%', background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#111', marginBottom: 14, outline: 'none' }}
          type="email" value={email} placeholder="coach@hockey.ca"
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle()}
        />
        <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mot de passe</label>
        <input
          style={{ width: '100%', background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#111', marginBottom: 14, outline: 'none' }}
          type="password" value={password} placeholder="••••••••"
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle()}
        />

        <button style={{ width: '100%', background: '#CC1111', color: '#fff', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
          onClick={handle} disabled={loading}>
          {loading ? 'Chargement...' : isNew ? 'Créer le compte' : 'Se connecter'}
        </button>

        <div style={{ height: '1px', background: '#eee', margin: '20px 0' }} />

        <button style={{ width: '100%', background: 'transparent', color: '#999', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px', fontSize: 13, cursor: 'pointer' }}
          onClick={() => { setIsNew(!isNew); setError(''); }}>
          {isNew ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
        </button>
      </div>
    </div>
  );
}
