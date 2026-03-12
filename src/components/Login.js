import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const s = {
  page: {
    minHeight: '100vh', background: '#0D0D0D',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
  },
  card: {
    background: '#161616', border: '0.5px solid #2A2A2A',
    borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 380
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem'
  },
  logoIcon: {
    width: 44, height: 44, background: '#CC1111', borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  logoTitle: { fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' },
  logoSub: { fontSize: 12, color: '#666', marginTop: 2 },
  label: { display: 'block', fontSize: 12, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: {
    width: '100%', background: '#1E1E1E', border: '0.5px solid #333',
    borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#fff',
    marginBottom: 14, outline: 'none'
  },
  btnPrimary: {
    width: '100%', background: '#CC1111', color: '#fff', border: 'none',
    borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', letterSpacing: '0.04em', marginTop: 4
  },
  btnSecondary: {
    width: '100%', background: 'transparent', color: '#666', border: '0.5px solid #333',
    borderRadius: 8, padding: '10px', fontSize: 13, cursor: 'pointer', marginTop: 8
  },
  error: {
    background: 'rgba(204,17,17,0.1)', border: '0.5px solid rgba(204,17,17,0.3)',
    borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#FF6666', marginBottom: 14
  },
  divider: { height: '0.5px', background: '#222', margin: '20px 0' }
};

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
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoIcon}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="1" y="9" width="24" height="15" rx="2" stroke="white" strokeWidth="2"/>
              <line x1="1" y1="9" x2="25" y2="9" stroke="white" strokeWidth="2.5"/>
              <line x1="9" y1="9" x2="9" y2="24" stroke="white" strokeWidth="1.5"/>
              <line x1="17" y1="9" x2="17" y2="24" stroke="white" strokeWidth="1.5"/>
              <line x1="1" y1="17" x2="25" y2="17" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <div style={s.logoTitle}>Goalie Tracker</div>
            <div style={s.logoSub}>Entraînement gardien de but</div>
          </div>
        </div>

        <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 20 }}>
          {isNew ? 'Créer un compte' : 'Connexion'}
        </div>

        {error && <div style={s.error}>{error}</div>}

        <label style={s.label}>Courriel</label>
        <input
          style={s.input} type="email" value={email} placeholder="coach@hockey.ca"
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle()}
        />
        <label style={s.label}>Mot de passe</label>
        <input
          style={s.input} type="password" value={password} placeholder="••••••••"
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle()}
        />

        <button style={s.btnPrimary} onClick={handle} disabled={loading}>
          {loading ? 'Chargement...' : isNew ? 'Créer le compte' : 'Se connecter'}
        </button>

        <div style={s.divider} />

        <button style={s.btnSecondary} onClick={() => { setIsNew(!isNew); setError(''); }}>
          {isNew ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
        </button>
      </div>
    </div>
  );
}
