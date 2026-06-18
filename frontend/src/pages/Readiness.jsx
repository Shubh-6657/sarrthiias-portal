import { useState } from 'react';
import api from '../services/api';

export default function Readiness() {
  const [form, setForm] = useState({ studyHours: '', mockTests: '', stage: 'Beginner', subject: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post('/ai/readiness', form);
      setResult(r.data);
    } catch { setResult({ score: 50, level: 'Moderate', recommendations: ['Keep studying consistently!', 'Attempt mock tests regularly.', 'Focus on NCERT foundation.'] }); }
    finally { setLoading(false); }
  };

  const scoreColor = s => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
  const scoreLabel = s => s >= 75 ? 'High Readiness 🚀' : s >= 50 ? 'Moderate Readiness 📈' : 'Needs More Prep 📚';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', fontFamily: 'Inter,sans-serif' }}>
      {/* Header */}
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🎯</span>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>SarrthiIAS</span>
        </div>
        <a href="/login" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: 600 }}>Login →</a>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 20px 60px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', borderRadius: 30, padding: '6px 18px', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600, marginBottom: 16 }}>FREE · AI-POWERED · INSTANT</div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginBottom: 12 }}>UPSC Readiness<br /><span style={{ color: '#fbbf24' }}>Analyzer</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>Get your personalized readiness score and study recommendations in seconds.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 28, maxWidth: result ? 900 : 480, margin: '0 auto' }}>
          {/* Form */}
          <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: 32, border: '1px solid rgba(255,255,255,0.15)' }}>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: 24 }}>Tell us about your prep</h2>
            <form onSubmit={analyze}>
              {[{label:'Daily Study Hours *',key:'studyHours',type:'number',ph:'e.g. 6'},{label:'Mock Tests Attempted *',key:'mockTests',type:'number',ph:'e.g. 10'}].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} required min="0" value={form[f.key]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              ))}
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Stage *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Beginner','Intermediate','Advanced'].map(s => (
                    <button key={s} type="button" onClick={() => setForm(p=>({...p,stage:s}))}
                      style={{ flex:1, padding:'10px', borderRadius:8, border:`1px solid ${form.stage===s?'#fbbf24':'rgba(255,255,255,0.2)'}`, background:form.stage===s?'rgba(251,191,36,0.2)':'rgba(255,255,255,0.07)', color:form.stage===s?'#fbbf24':'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:'0.8rem', fontWeight:form.stage===s?700:400 }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Focus Subject (optional)</label>
                <select value={form.subject} onChange={e => setForm(p=>({...p,subject:e.target.value}))}
                  style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.2)', background:'#1e1b4b', color:'rgba(255,255,255,0.8)', fontSize:'0.9rem', boxSizing:'border-box', outline:'none' }}>
                  <option value="">Select subject...</option>
                  {['General Studies','CSAT','History','Geography','Polity','Economy','Science & Tech','Environment'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading}
                style={{ width:'100%', padding:'13px', borderRadius:12, border:'none', background:loading?'rgba(255,255,255,0.2)':'linear-gradient(135deg,#f97316,#fbbf24)', color:'#fff', fontSize:'1rem', fontWeight:700, cursor:loading?'not-allowed':'pointer' }}>
                {loading ? '⏳ Analyzing...' : '🚀 Analyze My Readiness'}
              </button>
            </form>
          </div>

          {/* Result */}
          {result && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:20, padding:32, border:'1px solid rgba(255,255,255,0.15)', textAlign:'center' }}>
                <svg width="160" height="160" viewBox="0 0 160 160" style={{ margin: '0 auto 16px', display: 'block' }}>
                  <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                  <circle cx="80" cy="80" r="68" fill="none" stroke={scoreColor(result.score)} strokeWidth="12"
                    strokeDasharray={`${2*Math.PI*68*result.score/100} ${2*Math.PI*68}`}
                    strokeLinecap="round" transform="rotate(-90 80 80)" />
                  <text x="80" y="75" textAnchor="middle" fill={scoreColor(result.score)} fontSize="36" fontWeight="800">{result.score}</text>
                  <text x="80" y="98" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="13">/100</text>
                </svg>
                <h3 style={{ color: scoreColor(result.score), fontSize: '1.3rem', fontWeight: 800 }}>{scoreLabel(result.score)}</h3>
              </div>
              <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:20, padding:24, border:'1px solid rgba(255,255,255,0.15)' }}>
                <h3 style={{ color:'#fff', fontWeight:700, marginBottom:16 }}>📋 Recommendations</h3>
                {result.recommendations.map((r,i) => (
                  <div key={i} style={{ display:'flex', gap:10, marginBottom:12, alignItems:'flex-start' }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:'#f97316', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>{i+1}</div>
                    <p style={{ color:'rgba(255,255,255,0.85)', fontSize:'0.875rem', lineHeight:1.5 }}>{r}</p>
                  </div>
                ))}
                <div style={{ marginTop:20, textAlign:'center' }}>
                  <a href="/login" style={{ display:'inline-block', padding:'12px 28px', borderRadius:12, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', textDecoration:'none', fontWeight:700, fontSize:'0.9rem' }}>
                    Get Full Study Plan →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
