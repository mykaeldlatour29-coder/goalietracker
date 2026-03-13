import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const RED = '#CC1111';
const G1 = '#ffffff';
const G2 = '#f8f8f8';
const G3 = '#e0e0e0';

const ZONES = {
  TL: { label: 'Haut gauche', rect: [34, 24, 73, 42] },
  TC: { label: 'Haut centre', rect: [107, 24, 66, 42] },
  TR: { label: 'Haut droit',  rect: [173, 24, 73, 42] },
  BL: { label: 'Bas gauche',  rect: [34, 66, 73, 42] },
  BC: { label: 'Bas centre',  rect: [107, 66, 66, 42] },
  BR: { label: 'Bas droit',   rect: [173, 66, 73, 42] },
};

function lerp(a, b, t) { return a + (b - a) * t; }
function zoneColor(ratio) {
  if (ratio <= 0) return '#f0f0f0';
  const r1=[29,158,117], r2=[250,180,50], r3=[204,17,17];
  let r, g, b;
  if (ratio < 0.5) {
    const t = ratio * 2;
    r = lerp(r1[0], r2[0], t); g = lerp(r1[1], r2[1], t); b = lerp(r1[2], r2[2], t);
  } else {
    const t = (ratio - 0.5) * 2;
    r = lerp(r2[0], r3[0], t); g = lerp(r2[1], r3[1], t); b = lerp(r2[2], r3[2], t);
  }
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

export default function Session({ user }) {
  const { id } = useParams();
  const nav = useNavigate();
  const rinkRef = useRef();

  const [session, setSession] = useState(null);
  const [shots, setShots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pRink, setPRink] = useState(null);
  const [pNet, setPNet] = useState(null);
  const [pResult, setPResult] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, 'sessions', id));
      if (!snap.exists()) { nav('/'); return; }
      const data = snap.data();
      if (data.uid !== user.uid) { nav('/'); return; }
      setSession(data);
      setShots(data.shots || []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const saveShots = async (newShots) => {
    setSaving(true);
    await updateDoc(doc(db, 'sessions', id), { shots: newShots });
    setSaving(false);
  };

  const handleRinkClick = (e) => {
    const svg = rinkRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 280;
    const y = ((e.clientY - rect.top) / rect.height) * 160;
    if (x < 5 || x > 275 || y < 5 || y > 155) return;
    setPRink({ x: Math.round(x), y: Math.round(y) });
    setPNet(null); setPResult(null);
  };

  const handleZoneClick = (zid) => {
    if (!pRink) return;
    setPNet(zid);
  };

  const handleResult = (r) => {
    if (!pRink || !pNet) return;
    setPResult(r);
  };

  const addShot = async () => {
    if (!pRink || !pNet || !pResult) return;
    const newShot = {
      id: Date.now(),
      rink: pRink,
      net: pNet,
      zoneLabel: ZONES[pNet].label,
      result: pResult,
      time: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [...shots, newShot];
    setShots(updated);
    await saveShots(updated);
    setPRink(null); setPNet(null); setPResult(null);
  };

  const deleteShot = async (sid) => {
    const updated = shots.filter(s => s.id !== sid);
    setShots(updated);
    await saveShots(updated);
  };

  const total = shots.length;
  const saves = shots.filter(s => s.result === 'save').length;
  const goals = total - saves;
  const svPct = total > 0 ? ((saves / total) * 100).toFixed(1) : null;

  const zoneStats = Object.fromEntries(Object.keys(ZONES).map(z => [z, { total: 0, goals: 0 }]));
  shots.forEach(s => { if (zoneStats[s.net]) { zoneStats[s.net].total++; if (s.result === 'goal') zoneStats[s.net].goals++; } });
  const maxZone = Math.max(1, ...Object.values(zoneStats).map(z => z.total));

  const step = !pRink ? 0 : !pNet ? 1 : !pResult ? 2 : 3;

  if (loading) return (
    <div style={{ height: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 13 }}>
      Chargement...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', height: 56, gap: 12 }}>
          <button onClick={() => nav('/')} style={{
            background: '#f0f0f0', border: 'none', borderRadius: 6,
            padding: '6px 12px', fontSize: 12, color: '#666', cursor: 'pointer'
          }}>← Retour</button>
          <div style={{ width: '1px', height: 20, background: '#e0e0e0' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{session?.goalie}</div>
            <div style={{ fontSize: 11, color: '#999' }}>{session?.date && new Date(session.date).toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          {session?.notes && <div style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>— {session.notes}</div>}
          <div style={{ marginLeft: 'auto', fontSize: 12, color: saving ? RED : '#99' }}>{saving ? 'Sauvegarde...' : 'Sauvegardé ✓'}</div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Tirs totaux', val: total, color: '#111' },
            { label: '% Arrêt', val: svPct !== null ? svPct + '%' : '—', color: svPct >= 90 ? '#1D9E75' : svPct >= 80 ? '#EF9F27' : svPct !== null ? RED : '#111' },
            { label: 'Arrêts', val: saves, color: '#1D9E75' },
            { label: 'Buts alloués', val: goals, color: goals > 0 ? RED : '#999' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color }}>{val}</div>
              <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: G1, border: '1px solid #e0e0e0', borderRadius: 14, padding: '1rem' }}>
            <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 3, height: 12, background: RED, borderRadius: 2, display: 'inline-block' }} />
              Enregistrer un tir
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? (step === 3 ? '#1D9E75' : RED) : i === step ? RED : '#e0e0e0' }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
              {step === 0 && 'Étape 1 — Cliquez sur la patinoire (origine)'}
              {step === 1 && 'Étape 2 — Cliquez sur le filet (destination)'}
              {step === 2 && 'Étape 3 — Résultat du tir'}
              {step === 3 && 'Prêt ! Cliquez sur Enregistrer'}
            </div>

            <div style={{ position: 'relative', marginBottom: 10 }}>
              <svg ref={rinkRef} viewBox="0 0 280 160" onClick={handleRinkClick}
                style={{ width: '100%', cursor: 'crosshair', border: '1px solid #e0e0e0', borderRadius: 8, display: 'block' }}>
                <rect x="2" y="2" width="276" height="156" rx="22" fill="#E8F4F8" stroke="#ccc" strokeWidth="1"/>
                <line x1="140" y1="2" x2="140" y2="158" stroke="#CC1111" strokeWidth="1.5" opacity="0.4"/>
                <line x1="93" y1="2" x2="93" y2="158" stroke="#2255AA" strokeWidth="1.5" opacity="0.5"/>
                <line x1="187" y1="2" x2="187" y2="158" stroke="#2255AA" strokeWidth="1.5" opacity="0.5"/>
                <circle cx="140" cy="80" r="28" fill="none" stroke="#CC1111" strokeWidth="1" opacity="0.25"/>
                <circle cx="140" cy="80" r="2" fill="#CC1111" opacity="0.4"/>
                {[[65,45],[65,115],[215,45],[215,115]].map(([cx,cy],i) => (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r="18" fill="none" stroke="#CC1111" strokeWidth="1" opacity="0.2"/>
                    <circle cx={cx} cy={cy} r="2" fill="#CC1111" opacity="0.4"/>
                  </g>
                ))}
                <rect x="2" y="62" width="10" height="36" fill="#fff" stroke="#999" strokeWidth="1" rx="2"/>
                <rect x="268" y="62" width="10" height="36" fill="#fff" stroke="#999" strokeWidth="1" rx="2"/>
                <path d="M12 62 Q30 62 30 80 Q30 98 12 98" fill="rgba(204,17,17,0.07)" stroke="#CC1111" strokeWidth="1"/>
                <path d="M268 62 Q250 62 250 80 Q250 98 268 98" fill="rgba(204,17,17,0.07)" stroke="#CC1111" strokeWidth="1"/>
                <text x="50" y="153" fontSize="7" fill="#2255AA" opacity="0.7" textAnchor="middle">Zone de tir</text>
                <text x="230" y="153" fontSize="7" fill="#2255AA" opacity="0.7" textAnchor="middle">Gardien défend</text>
                {shots.map(s => (
                  <circle key={s.id} cx={s.rink.x} cy={s.rink.y} r="4"
                    fill={s.result === 'goal' ? '#CC1111' : '#1D9E75'} stroke="#fff" strokeWidth="1" opacity="0.8"/>
                ))}
                {pRink && <circle cx={pRink.x} cy={pRink.y} r="5" fill="#FF8800" stroke="white" strokeWidth="1.5"/>}
              </svg>
            </div>

            <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>Destination du tir :</div>
            <svg viewBox="0 0 280 115" style={{ width: '100%', background: '#f8f8f8', borderRadius: 8, border: '1px solid #e0e0e0', display: 'block', marginBottom: 10 }}>
              <rect x="0" y="98" width="280" height="17" fill="#E8F4F8"/>
              <rect x="28" y="14" width="6" height="86" fill={RED} rx="2"/>
              <rect x="246" y="14" width="6" height="86" fill={RED} rx="2"/>
              <rect x="28" y="14" width="224" height="6" fill={RED} rx="2"/>
              <rect x="34" y="20" width="212" height="78" fill="rgba(255,255,255,0.8)" stroke="#ddd" strokeWidth="0.5"/>
              <line x1="107" y1="20" x2="107" y2="98" stroke="#ddd" strokeWidth="1" strokeDasharray="3,3"/>
              <line x1="173" y1="20" x2="173" y2="98" stroke="#ddd" strokeWidth="1" strokeDasharray="3,3"/>
              <line x1="34" y1="59" x2="246" y2="59" stroke="#ddd" strokeWidth="1" strokeDasharray="3,3"/>
              {Object.entries(ZONES).map(([zid, { rect: [rx, ry, rw, rh] }]) => {
                const isSelected = pNet === zid;
                const shotCount = shots.filter(s => s.net === zid).length;
                return (
                  <g key={zid}>
                    <rect x={rx} y={ry} width={rw} height={rh}
                      fill={isSelected ? 'rgba(204,17,17,0.2)' : 'transparent'}
                      style={{ cursor: pRink ? 'pointer' : 'default' }}
                      onClick={() => handleZoneClick(zid)}
                      onMouseEnter={e => { if (pRink) e.target.setAttribute('fill', 'rgba(204,17,17,0.15)'); }}
                      onMouseLeave={e => { if (!isSelected) e.target.setAttribute('fill', 'transparent'); }}
                    />
                    <text x={rx + rw/2} y={ry + rh/2 - 5} textAnchor="middle" fontSize="9" fill="#aaa" style={{ pointerEvents: 'none' }}>{zid}</text>
                    {shotCount > 0 && <text x={rx + rw/2} y={ry + rh/2 + 8} textAnchor="middle" fontSize="10" fill="#666" style={{ pointerEvents: 'none' }}>{shotCount}</text>}
                  </g>
                );
              })}
              {shots.map(s => {
                if (!ZONES[s.net]) return null;
                const [rx, ry, rw, rh] = ZONES[s.net].rect;
                const cx = rx + rw / 2 + (Math.sin(s.id) * 12);
                const cy = ry + rh / 2 + (Math.cos(s.id) * 8);
                return <circle key={s.id} cx={cx} cy={cy} r="4" fill={s.result === 'goal' ? RED : '#1D9E75'} stroke="#fff" strokeWidth="1" opacity="0.85"/>;
              })}
            </svg>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleResult('goal')} style={{
                flex: 1, padding: '9px', borderRadius: 8, border: '1px solid',
                fontSize: 13, fontWeight: 600, cursor: pRink && pNet ? 'pointer' : 'not-allowed',
                borderColor: pResult === 'goal' ? RED : '#e0e0e0',
                background: pResult === 'goal' ? RED : '#fff',
                color: pResult === 'goal' ? '#fff' : '#999',
                opacity: pRink && pNet ? 1 : 0.4
              }}>But</button>
              <button onClick={() => handleResult('save')} style={{
                flex: 1, padding: '9px', borderRadius: 8, border: '1px solid',
                fontSize: 13, fontWeight: 600, cursor: pRink && pNet ? 'pointer' : 'not-allowed',
                borderColor: pResult === 'save' ? '#1D9E75' : '#e0e0e0',
                background: pResult === 'save' ? '#1D9E75' : '#fff',
                color: pResult === 'save' ? '#fff' : '#999',
                opacity: pRink && pNet ? 1 : 0.4
              }}>Arrêt</button>
            </div>
            <button onClick={addShot} disabled={!pRink || !pNet || !pResult} style={{
              width: '100%', marginTop: 8, padding: '11px', borderRadius: 8,
              background: pRink && pNet && pResult ? RED : '#e0e0e0',
              color: pRink && pNet && pResult ? '#fff' : '#999',
              border: 'none', fontSize: 13, fontWeight: 700,
              cursor: pRink && pNet && pResult ? 'pointer' : 'not-allowed',
              textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>Enregistrer le tir</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: G1, border: '1px solid #e0e0e0', borderRadius: 14, padding: '1rem' }}>
              <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 3, height: 12, background: RED, borderRadius: 2, display: 'inline-block' }} />
                Zones du filet
              </div>
              <svg viewBox="0 0 280 100" style={{ width: '100%', background: '#f8f8f8', borderRadius: 8, display: 'block' }}>
                <rect x="28" y="4" width="6" height="76" fill={RED} rx="2"/>
                <rect x="246" y="4" width="6" height="76" fill={RED} rx="2"/>
                <rect x="28" y="4" width="224" height="5" fill={RED} rx="2"/>
                {Object.entries(ZONES).map(([zid, { rect: [rx, ry, rw, rh] }]) => {
                  const adj_ry = ry - 20;
                  const stat = zoneStats[zid];
                  const ratio = stat.total / maxZone;
                  const col = zoneColor(ratio);
                  const label = stat.total > 0 ? `${stat.goals}B/${stat.total}T` : '0';
                  return (
                    <g key={zid}>
                      <rect x={rx} y={adj_ry + 9} width={rw} height={rh} fill={col} rx="2"/>
                      <text x={rx + rw/2} y={adj_ry + 9 + rh/2 + 4} textAnchor="middle" fontSize="10"
                        fill={ratio > 0.3 ? '#fff' : '#999'} style={{ pointerEvents: 'none' }}>
                        {label}
                      </text>
                    </g>
                  );
                })}
                <text x="70" y="95" textAnchor="middle" fontSize="8" fill="#aaa">Gauche</text>
                <text x="140" y="95" textAnchor="middle" fontSize="8" fill="#aaa">Centre</text>
                <text x="210" y="95" textAnchor="middle" fontSize="8" fill="#aaa">Droite</text>
              </svg>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: '#aaa' }}>
                <span>Arrêt</span>
                <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'linear-gradient(to right, #1D9E75, #EF9F27, #CC1111)' }} />
                <span>But</span>
              </div>
            </div>

            <div style={{ background: G1, border: '1px solid #e0e0e0', borderRadius: 14, padding: '1rem', flex: 1 }}>
              <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 3, height: 12, background: RED, borderRadius: 2, display: 'inline-block' }} />
                Historique ({total} tir{total !== 1 ? 's' : ''})
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {shots.length === 0 ? (
                  <div style={{ color: '#ccc', fontSize: 13, textAlign: 'center', padding: '1.5rem' }}>Aucun tir enregistré.</div>
                ) : [...shots].reverse().map(s => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 0', borderBottom: '1px solid #f0f0f0', fontSize: 12
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.result === 'goal' ? RED : '#1D9E75', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: s.result === 'goal' ? RED : '#1D9E75', minWidth: 38 }}>
                      {s.result === 'goal' ? 'But' : 'Arrêt'}
                    </span>
                    <span style={{ color: '#999', flex: 1 }}>{s.zoneLabel}</span>
                    <span style={{ color: '#ccc', fontSize: 11 }}>{s.time}</span>
                    <button onClick={() => deleteShot(s.id)} style={{
                      background: 'transparent', border: 'none', color: '#ccc',
                      cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: '0 2px'
                    }}
                      onMouseEnter={e => e.target.style.color = RED}
                      onMouseLeave={e => e.target.style.color = '#ccc'}
                    >×</button>
                  </div>
                ))}
              </div>
            </div>

            {total > 0 && (
              <div style={{ background: G1, border: '1px solid #e0e0e0', borderRadius: 14, padding: '1rem' }}>
                <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 3, height: 12, background: RED, borderRadius: 2, display: 'inline-block' }} />
                  Détail par zone
                </div>
                {Object.entries(zoneStats).filter(([, z]) => z.total > 0).sort(([,a],[,b]) => b.goals/b.total - a.goals/a.total).map(([zid, z]) => {
                  const pct = Math.round((z.goals / z.total) * 100);
                  return (
                    <div key={zid} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: '#999', width: 80, flexShrink: 0 }}>{ZONES[zid].label}</span>
                      <div style={{ flex: 1, height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: pct + '%', height: '100%', background: pct > 50 ? RED : '#1D9E75', borderRadius: 3 }} />
                      </div>
                      <span style={{ color: pct > 50 ? RED : '#1D9E75', fontWeight: 600, width: 32, textAlign: 'right' }}>{pct}%</span>
                      <span style={{ color: '#ccc', width: 30 }}>{z.total}T</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
