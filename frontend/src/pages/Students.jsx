import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '', targetYear: '', notes: '', role: 'student' });

  const isAdmin = user?.role === 'admin';

  const load = () => {
    const endpoint = isAdmin ? `/users?role=student&search=${search}` : `/users/my-students?search=${search}`;
    api.get(endpoint).then(r => setStudents(Array.isArray(r.data) ? r.data : [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const createStudent = async e => {
    e.preventDefault();
    try {
      await api.post('/users', { ...form, role: 'student' });
      toast.success('Student created!');
      setShowModal(false);
      setForm({ name: '', email: '', password: '', mobile: '', targetYear: '', notes: '', role: 'student' });
      load();
    } catch (err) { toast.error(err?.message || 'Failed'); }
  };

  const statusColor = s => ({ Excellent: '#10b981', Good: '#6366f1', 'Needs Attention': '#f59e0b', Critical: '#ef4444' }[s] || '#6366f1');

  return (
    <div>
      <div className="page-head">
        <div><h1 className="page-title">Students</h1><p className="page-sub">{isAdmin ? 'Manage all students' : 'Your assigned students'}</p></div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Student</button>}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="search-bar">🔍 <input placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{students.length} students</span>
        </div>
        {loading ? <div className="center-spin" style={{ height: 200 }}><div className="spin"></div></div> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Name</th><th>Mobile</th><th>Target Year</th><th>Avg Score</th><th>Tests</th><th>Status</th></tr></thead>
            <tbody>
              {students.length === 0 ? <tr><td colSpan={6}><div className="empty"><div className="empty-icon">👨‍🎓</div><p>No students found</p></div></td></tr>
                : students.map(s => (
                <tr key={s._id}>
                  <td><div style={{ fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.email}</div></td>
                  <td>{s.mobile || '—'}</td>
                  <td>{s.targetYear || '—'}</td>
                  <td><strong>{s.stats?.averageScore || 0}%</strong></td>
                  <td>{s.stats?.testsAttempted || 0}</td>
                  <td><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: `${statusColor(s.stats?.performanceStatus)}20`, color: statusColor(s.stats?.performanceStatus) }}>{s.stats?.performanceStatus || 'Good'}</span></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head"><span className="modal-title">Add New Student</span><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={createStudent}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Mobile</label><input className="form-input" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Target Year</label><input className="form-input" type="number" value={form.targetYear} onChange={e => setForm(f => ({ ...f, targetYear: e.target.value }))} /></div>
                </div>
                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              </div>
              <div className="modal-foot"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Student</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
