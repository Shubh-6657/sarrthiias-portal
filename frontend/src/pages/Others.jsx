// Users.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export function Users() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'mentor', mobile: '' });

  const load = () => api.get('/users').then(r => setUsers(Array.isArray(r.data) ? r.data : [])).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const create = async e => {
    e.preventDefault();
    try { await api.post('/users', form); toast.success('User created!'); setShowModal(false); load(); }
    catch (err) { toast.error(err?.message || 'Failed'); }
  };

  const roleColor = r => ({ admin:'#ef4444', mentor:'#6366f1', evaluator:'#f59e0b', student:'#10b981' }[r]||'#6b7280');

  return (
    <div>
      <div className="page-head"><div><h1 className="page-title">User Management</h1></div><button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add User</button></div>
      <div className="card">
        {loading ? <div className="center-spin" style={{height:200}}><div className="spin"></div></div> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Name</th><th>Role</th><th>Mobile</th><th>Created</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><div style={{fontWeight:600}}>{u.name}</div><div style={{fontSize:'0.75rem',color:'#6b7280'}}>{u.email}</div></td>
                  <td><span style={{padding:'3px 10px',borderRadius:20,fontSize:'0.75rem',fontWeight:600,background:`${roleColor(u.role)}20`,color:roleColor(u.role)}}>{u.role}</span></td>
                  <td>{u.mobile||'—'}</td>
                  <td style={{fontSize:'0.8rem',color:'#6b7280'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head"><span className="modal-title">Create User</span><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={create}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Name *</label><input className="form-input" required value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></div>
                  <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" required value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} /></div>
                  <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" required value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} /></div>
                  <div className="form-group"><label className="form-label">Role</label>
                    <select className="form-select" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>
                      {['admin','mentor','evaluator','student'].map(r=><option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Mobile</label><input className="form-input" value={form.mobile} onChange={e => setForm(f=>({...f,mobile:e.target.value}))} /></div>
                </div>
              </div>
              <div className="modal-foot"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Notifications.jsx
export function Notifications() {
  const [notifs, setNotifs]   = useState([]);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/notifications').then(r => { setNotifs(r.data?.notifications||[]); setUnread(r.data?.unreadCount||0); }).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markAll = async () => { await api.patch('/notifications/read-all'); load(); toast.success('All marked read'); };
  const markOne = async id => { await api.patch(`/notifications/${id}/read`); load(); };

  const typeIcon = t => ({ TASK_ASSIGNED:'📋', EVALUATION_SUBMITTED:'📝', TASK_EVALUATED:'✅', SUBMISSION_RECEIVED:'📩', DEADLINE_APPROACHING:'⏰' }[t]||'🔔');

  return (
    <div>
      <div className="page-head">
        <div><h1 className="page-title">Notifications</h1><p className="page-sub">{unread} unread</p></div>
        {unread > 0 && <button className="btn btn-outline" onClick={markAll}>✓ Mark all read</button>}
      </div>
      <div className="card">
        {loading ? <div className="center-spin" style={{height:200}}><div className="spin"></div></div>
          : notifs.length === 0 ? <div className="empty"><div className="empty-icon">🔔</div><p>No notifications</p></div>
          : notifs.map(n => (
          <div key={n._id} onClick={() => !n.isRead && markOne(n._id)} style={{ display:'flex', gap:14, padding:'16px 20px', borderBottom:'1px solid #e5e7eb', background: n.isRead?'#fff':'#f5f3ff', cursor: n.isRead?'default':'pointer' }}>
            <div style={{ fontSize: 24 }}>{typeIcon(n.type)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontWeight: n.isRead ? 500 : 700 }}>{n.title}</span>
                {!n.isRead && <span style={{ width:8, height:8, borderRadius:'50%', background:'#6366f1', flexShrink:0, marginTop:6 }}></span>}
              </div>
              <p style={{ fontSize:'0.875rem', color:'#6b7280', marginTop:2 }}>{n.message}</p>
              <p style={{ fontSize:'0.75rem', color:'#9ca3af', marginTop:4 }}>{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// StudyPlans.jsx
export function StudyPlans() {
  const [plans, setPlans]     = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');

  const load = () => api.get('/ai/study-plans').then(r => setPlans(Array.isArray(r.data) ? r.data : [])).catch(console.error).finally(() => setLoading(false));
  useEffect(() => {
    load();
    api.get('/users/my-students').then(r => setStudents(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const body = selectedStudent ? { studentId: selectedStudent } : {};
      await api.post('/ai/study-plan', body);
      toast.success('Study plan generated!');
      load();
    } catch (err) { toast.error(err?.message || 'Failed'); }
    finally { setGenerating(false); }
  };

  return (
    <div>
      <div className="page-head">
        <div><h1 className="page-title">AI Study Plans</h1><p className="page-sub">AI-generated weekly study plans</p></div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {students.length > 0 && (
            <select className="form-select" style={{ width: 200 }} value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
              <option value="">My Plan</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          )}
          <button className="btn btn-primary" onClick={generate} disabled={generating}>{generating ? '⏳ Generating...' : '🤖 Generate Plan'}</button>
        </div>
      </div>
      {loading ? <div className="center-spin"><div className="spin"></div></div>
        : plans.length === 0 ? <div className="empty" style={{marginTop:40}}><div className="empty-icon">🤖</div><p>No study plans yet. Click "Generate Plan" to create one!</p></div>
        : plans.map(p => (
        <div key={p._id} className="card">
          <div className="card-head">
            <div><span className="card-title">📅 Week of {new Date(p.weekStartDate).toLocaleDateString()}</span><div style={{fontSize:'0.8rem',color:'#6b7280',marginTop:2}}>For: {p.student?.name}</div></div>
          </div>
          <div className="card-body">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <div style={{background:'#f0fdf4',borderRadius:8,padding:12}}>
                <div style={{fontWeight:600,color:'#16a34a',marginBottom:6}}>🎯 Focus Areas</div>
                {(p.plan?.focusAreas||[]).map((f,i)=><div key={i} style={{fontSize:'0.875rem',marginBottom:3}}>• {f}</div>)}
              </div>
              <div style={{background:'#eff6ff',borderRadius:8,padding:12}}>
                <div style={{fontWeight:600,color:'#1d4ed8',marginBottom:6}}>⏱ Study Schedule</div>
                <div style={{fontSize:'0.875rem'}}>Hours/day: <strong>{p.plan?.suggestedStudyHours}</strong></div>
                <div style={{fontSize:'0.875rem'}}>Answers: <strong>{p.plan?.answerWritingTargets}</strong></div>
              </div>
            </div>
            {p.plan?.revisionStrategy && <div style={{background:'#fef9c3',borderRadius:8,padding:12,marginBottom:12}}><span style={{fontWeight:600,color:'#a16207'}}>📖 Revision: </span>{p.plan.revisionStrategy}</div>}
            {p.plan?.detailedPlan && <div style={{background:'#f9fafb',borderRadius:8,padding:12,fontSize:'0.875rem',lineHeight:1.6}}>{p.plan.detailedPlan}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
