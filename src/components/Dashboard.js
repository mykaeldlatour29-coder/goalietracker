import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { auth, db } from '../firebase';

const RED = '#CC1111';
const LINE = '#e0e0e0';

export default function Dashboard({ user }) {
  const nav = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [goalies, setGoalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ goalie: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [newGoalie, setNewGoalie] = useState('');
  const [tab, setTab] = useState('sessions');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const uid = user.uid;
    const sSnap = await getDocs(query(collection(db, 'sessions'), where('uid', '==', uid), orderBy('date', 'desc')));
    setSessions(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    const gSnap = await getDocs(query(collection(db, 'goalies'), where('uid', '==', uid), orderBy('name')));
    setGoalies(gSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const createSession = async () => {
    if (!form.goalie || !form.date) return;
    const ref = await addDoc(collection(db, 'sessions'), {
      uid: user.uid, goalie: form.goalie, date: form.date,
      notes: form.notes, shots: [], createdAt: new Date().toISOString()
    });
    setShowNew(false);
    setForm({ goalie: '', date: new Date().toISOString().split('T')[0], notes: '' });
    nav('/session/' + ref.id);
  };

  const addGoalie = async () => {
    if (!newGoalie.trim()) return;
    await addDoc(collection(db, 'goalies'), { uid: user.uid, name: newGoalie.trim() });
    setNewGoalie('');
    fetchAll();
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Supprimer cette séance ?')) return;
    await deleteDoc(doc(db, 'sessions', id));
    fetchAll();
  };

  const deleteGoalie = async (id) => {
    if (!window.confirm('Supprimer ce gardien ?')) return;
    await deleteDoc(doc(db, 'goalies', id));
    fetchAll();
  };

  const svPct = (s) => {
    const t = s.shots?.length || 0;
    if (!t) return '—';
    const saves = s.shots.filter(x => x.result === 'save').length;
    return ((saves / t) * 100).toFixed(1) + '%';
  };

  const goalCount = (s) => (s.shots || []).filter(x => x.result === 'goal').length;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: RED, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <rect x="1" y="8" width="20" height="13" rx="2" stroke="white" strokeWidth="1.8"/>
                <line x1="1" y1="8" x2="21" y2="8" stroke="white" strokeWidth="2"/>
                <line x1="8" y1="8" x2="8" y2="21" stroke="white" strokeWidth="1.3"/>
                <line x1="14" y1="8" x2="14" y2="21" stroke="white" strokeWidth="1.3"/>
                <line x1="1" y1="14" x2="21" y2="14" stroke="white" strokeWidth="1.3"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>Goalie Tracker</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#999' }}>{user.email}</span>
            <button onClick={() => signOut(auth)} style={{
              background: 'transparent', border: '1px solid #e0e0e0', borderRadius: 6,
              padding: '5px 12px', fontSize: 12, color: '#666', cursor: 'pointer'
            }}>Déconnexion</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#e0e0e0', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {['sessions', 'gardiens'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 18px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 500,
              background: tab === t ? RED : 'transparent',
              color: tab === t ? '#fff' : '#666', cursor: 'pointer'
            }}>{t === 'sessions' ? 'Séances' : 'Gardiens'}</button>
          ))}
        </div>

        {tab === 'sessions' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>Séances d'entraînement</div>
              <button onClick={() => setShowNew(true)} style={{
                background: RED, color: '#fff', border: 'none', borderRadius: 8,
                padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>+ Nouvelle séance</button>
            </div>

            {loading ? (
              <div style={{ color: '#999', fontSize: 13, padding: '2rem', textAlign: 'center' }}>Chargement...</div>
            ) : sessions.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🏒</div>
                <div style={{ color: '#999', fontSize: 14 }}>Aucune séance enregistrée.<br />Créez votre première séance pour commencer.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sessions.map(s => (
                  <div key={s.id} onClick={() => nav('/session/' + s.id)} style={{
                    background: '#fff', border: '1px solid ' + LINE, borderRadius: 12,
                    padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = RED}
                    onMouseLeave={e => e.currentTarget.style.borderColor = LINE}
                  >
                    <div style={{ width: 42, height: 42, background: '#f5f5f5', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: RED }}>{(s.shots || []).length}</div>
                      <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase' }}>tirs</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 3 }}>{s.goalie}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{new Date(s.date).toLocaleDateString('fr-CA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{svPct(s)}</div>
                        <div style={{ fontSize: 10, color: '#999' }}>SV%</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: goalCount(s) > 0 ? RED : '#999' }}>{goalCount(s)}</div>
                        <div style={{ fontSize: 10, color: '#999' }}>buts</div>
                      </div>
                      <button onClick={e => deleteSession(s.id, e)} style={{
                        background: 'transparent', border: '1px solid #e0e0e0', borderRadius: 6,
                        padding: '5px 10px', fontSize: 12, color: '#999', cursor: 'pointer'
                      }}>Suppr.</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'gardiens' && (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 16 }}>Gardiens</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input value={newGoalie} onChange={e => setNewGoalie(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addGoalie()}
                placeholder="Nom du gardien..." style={{
                  flex: 1, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8,
                  padding: '10px 14px', fontSize: 14, color: '#111', outline: 'none'
                }} />
              <button onClick={addGoalie} style={{
                background: RED, color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>Ajouter</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {goalies.map(g => {
                const gSessions = sessions.filter(s => s.goalie === g.name);
                const totalShots = gSessions.reduce((a, s) => a + (s.shots?.length || 0), 0);
                const totalSaves = gSessions.reduce((a, s) => a + (s.shots || []).filter(x => x.result === 'save').length, 0);
                const pct = totalShots > 0 ? ((totalSaves / totalShots) * 100).toFixed(1) + '%' : '—';
                return (
                  <div key={g.id} style={{
                    background: '#fff', border: '1px solid ' + LINE, borderRadius: 12,
                    padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 16
                  }}>
                    <div style={{
                      width: 42, height: 42, background: RED, borderRadius: 50,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0
                    }}>{g.name[0].toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#111', fontSize: 14 }}>{g.name}</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{gSessions.length} séance(s) — {totalShots} tirs</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{pct} <span style={{ fontSize: 11, color: '#999', fontWeight: 400 }}>SV%</span></div>
                    <button onClick={() => deleteGoalie(g.id)} style={{
                      background: 'transparent', border: '1px solid #e0e0e0', borderRadius: 6,
                      padding: '5px 10px', fontSize: 12, color: '#999', cursor: 'pointer'
                    }}>Suppr.</button>
                  </div>
                );
              })}
              {goalies.length === 0 && (
                <div style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: '2rem' }}>Aucun gardien enregistré.</div>
              )}
            </div>
          </>
        )}
      </div>

      {showNew && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100
        }} onClick={() => setShowNew(false)}>
          <div style={{
            background: '#fff', border: '1px solid #e0e0e0', borderRadius: 16,
            padding: '1.5rem', width: '100%', maxWidth: 420
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 20 }}>Nouvelle séance</div>

            <label style={{ display: 'block', fontSize: 11, color: '#999', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gardien</label>
            <select value={form.goalie} onChange={e => setForm({ ...form, goalie: e.target.value })} style={{
              width: '100%', background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: 8,
              padding: '10px 14px', fontSize: 14, color: form.goalie ? '#111' : '#999',
              marginBottom: 14, outline: 'none'
            }}>
              <option value="">Sélectionner un gardien...</option>
              {goalies.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>

            <label style={{ display: 'block', fontSize: 11, color: '#999', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{
              width: '100%', background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: 8,
              padding: '10px 14px', fontSize: 14, color: '#111', marginBottom: 14, outline: 'none'
            }} />

            <label style={{ display: 'block', fontSize: 11, color: '#999', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes (optionnel)</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Ex: Tirs de la pointe, forehand..." style={{
                width: '100%', background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: 8,
                padding: '10px 14px', fontSize: 14, color: '#111', marginBottom: 20, outline: 'none'
              }} />

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowNew(false)} style={{
                flex: 1, background: 'transparent', border: '1px solid #e0e0e0',
                borderRadius: 8, padding: 10, fontSize: 13, color: '#666', cursor: 'pointer'
              }}>Annuler</button>
              <button onClick={createSession} disabled={!form.goalie || !form.date} style={{
                flex: 2, background: RED, color: '#fff', border: 'none',
                borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600,
                cursor: form.goalie ? 'pointer' : 'not-allowed', opacity: form.goalie ? 1 : 0.5
              }}>Commencer la séance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
