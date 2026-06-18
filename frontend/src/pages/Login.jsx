import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const QUICK = [
  { label: 'Admin',     email: 'admin@sarrthiias.com',     pass: 'Admin@123',    color: '#ef4444' },
  { label: 'Mentor',    email: 'mentor@sarrthiias.com',    pass: 'Mentor@123',   color: '#6366f1' },
  { label: 'Evaluator', email: 'evaluator@sarrthiias.com', pass: 'Eval@123',     color: '#f59e0b' },
  { label: 'Student',   email: 'student@sarrthiias.com',   pass: 'Student@123',  color: '#10b981' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e, em, pw) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const user = await login(em || email, pw || password);
      toast.success(`Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎯</div>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800 }}>SarrthiIAS</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Student Performance Intelligence Portal</p>
        </div>

        {/* Form */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1.1rem' }}>Sign In</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick login */}
          <div style={{ marginTop: 24, borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Login (Demo)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {QUICK.map(q => (
                <button key={q.label} onClick={() => handleLogin(null, q.email, q.pass)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${q.color}`, background: `${q.color}10`, color: q.color, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
