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
      setError(msgs[e.code] || 'Erreu
