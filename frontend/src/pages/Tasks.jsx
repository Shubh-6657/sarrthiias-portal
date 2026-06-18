import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSubmit, setShowSubmit] = useState(null);
  const [submitText, setSubmitText] = useState('');
  const [filter, setFilter]     = useState({ status: '', priority: '', search: '' });
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'Medium', assignedTo: '' });

  const canAssign = ['admin','mentor'].includes(user?.role);

  const load = () => {
    const q = new URLSearchParams(filter).toString();
    api.get(`/tasks?${q}`).then(r => setTasks(Array.isArray(r.data) ? r.data : [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);
  useEffect(() => {
    if (canAssign) api.get('/users/my-students').then(r => setStudents(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const createTask = async e => {
    e.preventDefault();
    try {
      await api.post('/tasks', form);
      toast.success('Task assigned!');
      setShowModal(false);
      setForm({ title: '', description: '', dueDate: '', priority: 'Medium', assignedTo: '' });
      load();
    } catch (err) { toast.error(err?.message || 'Failed'); }
  };

  const submitTask = async e => {
    e.preventDefault();
    try {
      await api.post('/submissions', { taskId: showSubmit._id, textResponse: submitText });
      toast.success('Submitted!');
      setShowSubmit(null);
      setSubmitText('');
      load();
    } catch (err) { toast.error(err?.message || 'Failed'); }
  };

  const statusBadge = s => {
    const m = { Pending: 'badge-yellow', Submitted: 'badge-blue', Evaluated: 'badge-green', Missed: 'badge-red' };
    return <span className={`badge ${m[s]||'badge-gray'}`}>{s}</span>;
  };
  const priBadge = p => <span className={`badge badge-${p==='High'?'red':p==='Medium'?'yellow':'green'}`}>{p}</span>;

  return (
    <div>
      <div className="page-head">
        <div><h1 className="page-title">Tasks</h1><p className="page-sub">Manage and track all tasks</p></div>
        {canAssign && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Assign Task</button>}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-head" style={{ gap: 10 }}>
          <div className="search-bar">
            🔍 <input placeholder="Search tasks..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
          </div>
          <select className="form-select" style={{ width: 140 }} value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            {['Pending','Submitted','Evaluated','Missed'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ width: 140 }} value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}>
            <option value="">All Priority</option>
            {['Low','Medium','High'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        {loading ? <div className="center-spin" style={{ height: 200 }}><div className="spin"></div></div> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Title</th><th>Assigned To</th><th>Due Date</th><th>Priority</th><th>Status</th>{user?.role==='student'&&<th>Action</th>}</tr></thead>
            <tbody>
              {tasks.length === 0 ? <tr><td colSpan={6}><div className="empty"><div className="empty-icon">📋</div><p>No tasks found</p></div></td></tr>
                : tasks.map(t => (
                <tr key={t._id}>
                  <td><div style={{fontWeight:600}}>{t.title}</div><div style={{fontSize:'0.75rem',color:'#6b7280'}}>{t.description?.slice(0,60)}...</div></td>
                  <td>{t.assignedTo?.name || '—'}</td>
                  <td style={{fontSize:'0.875rem'}}>{new Date(t.dueDate).toLocaleDateString()}</td>
                  <td>{priBadge(t.priority)}</td>
                  <td>{statusBadge(t.status)}</td>
                  {user?.role==='student' && <td>
                    {t.status==='Pending' && <button className="btn btn-sm btn-primary" onClick={() => setShowSubmit(t)}>Submit</button>}
                  </td>}
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head"><span className="modal-title">Assign New Task</span><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={createTask}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Title *</label><input className="form-input" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Description *</label><textarea className="form-textarea" required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Due Date *</label><input className="form-input" type="date" required value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Priority</label>
                    <select className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                      {['Low','Medium','High'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Assign To *</label>
                  <select className="form-select" required value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                    <option value="">Select student...</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-foot"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Assign Task</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Task Modal */}
      {showSubmit && (
        <div className="overlay" onClick={() => setShowSubmit(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head"><span className="modal-title">Submit: {showSubmit.title}</span><button className="modal-close" onClick={() => setShowSubmit(null)}>×</button></div>
            <form onSubmit={submitTask}>
              <div className="modal-body">
                <div style={{background:'#f9fafb',borderRadius:8,padding:12,marginBottom:16,fontSize:'0.875rem',color:'#6b7280'}}>{showSubmit.description}</div>
                <div className="form-group"><label className="form-label">Your Answer *</label><textarea className="form-textarea" required rows={6} placeholder="Write your answer here..." value={submitText} onChange={e => setSubmitText(e.target.value)} /></div>
              </div>
              <div className="modal-foot"><button type="button" className="btn btn-outline" onClick={() => setShowSubmit(null)}>Cancel</button><button type="submit" className="btn btn-primary">Submit Answer</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
