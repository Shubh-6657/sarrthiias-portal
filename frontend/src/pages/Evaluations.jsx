import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Evaluations() {
  const { user } = useAuth();
  const [pending, setPending]     = useState([]);
  const [evals, setEvals]         = useState([]);
  const [tab, setTab]             = useState('pending');
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [form, setForm] = useState({ score: '', strengths: '', weaknesses: '', suggestions: '' });

  const isEvaluator = ['admin','evaluator'].includes(user?.role);

  const load = () => {
    const calls = isEvaluator
      ? [api.get('/submissions/pending'), api.get('/evaluations')]
      : [Promise.resolve({ data: [] }), api.get('/evaluations')];
    Promise.all(calls)
      .then(([p, e]) => { setPending(Array.isArray(p.data) ? p.data : []); setEvals(Array.isArray(e.data) ? e.data : []); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submitEval = async e => {
    e.preventDefault();
    try {
      await api.post('/evaluations', { submissionId: selected._id, ...form, score: Number(form.score) });
      toast.success('Evaluation submitted!');
      setSelected(null);
      setForm({ score: '', strengths: '', weaknesses: '', suggestions: '' });
      load();
    } catch (err) { toast.error(err?.message || 'Failed'); }
  };

  if (loading) return <div className="center-spin"><div className="spin"></div></div>;

  return (
    <div>
      <div className="page-head"><div><h1 className="page-title">Evaluations</h1><p className="page-sub">{isEvaluator ? 'Review and evaluate submissions' : 'Your evaluation history'}</p></div></div>

      {isEvaluator && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['pending','history'].map(t => (
            <button key={t} className={`btn ${tab===t?'btn-primary':'btn-outline'}`} onClick={() => setTab(t)}>
              {t === 'pending' ? `⏳ Pending (${pending.length})` : `✅ History (${evals.length})`}
            </button>
          ))}
        </div>
      )}

      {(tab === 'pending' && isEvaluator) ? (
        <div className="card">
          <div className="card-head"><span className="card-title">Pending Submissions</span></div>
          {pending.length === 0 ? <div className="empty"><div className="empty-icon">🎉</div><p>All caught up! No pending submissions.</p></div> : (
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Task</th><th>Student</th><th>Submitted</th><th>Late</th><th>Action</th></tr></thead>
              <tbody>
                {pending.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.task?.title}</td>
                    <td>{s.student?.name}<div style={{fontSize:'0.75rem',color:'#6b7280'}}>{s.student?.email}</div></td>
                    <td style={{fontSize:'0.8rem',color:'#6b7280'}}>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>{s.isLate ? <span className="badge badge-red">Late</span> : <span className="badge badge-green">On Time</span>}</td>
                    <td><button className="btn btn-sm btn-primary" onClick={() => setSelected(s)}>Evaluate</button></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-head"><span className="card-title">Evaluation History</span></div>
          {evals.length === 0 ? <div className="empty"><div className="empty-icon">📝</div><p>No evaluations yet</p></div> : (
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Task</th><th>Student</th><th>Evaluator</th><th>Score</th><th>Feedback</th><th>Date</th></tr></thead>
              <tbody>
                {evals.map(e => (
                  <tr key={e._id}>
                    <td style={{ fontWeight: 600 }}>{e.task?.title || '—'}</td>
                    <td>{e.student?.name}</td>
                    <td>{e.evaluator?.name}</td>
                    <td>
                      <div className="score-circle" style={{width:40,height:40,background:e.score>=70?'#dcfce7':e.score>=50?'#fef9c3':'#fee2e2',color:e.score>=70?'#16a34a':e.score>=50?'#a16207':'#dc2626',fontSize:'0.9rem'}}>
                        {e.score}
                      </div>
                    </td>
                    <td style={{fontSize:'0.8rem'}}>
                      {e.strengths && <div style={{color:'#16a34a'}}>✅ {e.strengths?.slice(0,40)}</div>}
                      {e.weaknesses && <div style={{color:'#dc2626'}}>⚠ {e.weaknesses?.slice(0,40)}</div>}
                    </td>
                    <td style={{fontSize:'0.8rem',color:'#6b7280'}}>{new Date(e.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      )}

      {/* Evaluate Modal */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-head"><span className="modal-title">Evaluate Submission</span><button className="modal-close" onClick={() => setSelected(null)}>×</button></div>
            <form onSubmit={submitEval}>
              <div className="modal-body">
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{selected.task?.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 8 }}>By: {selected.student?.name}</div>
                  <div style={{ fontSize: '0.875rem', maxHeight: 120, overflowY: 'auto' }}>{selected.textResponse}</div>
                </div>
                <div className="form-group"><label className="form-label">Score (0–100) *</label><input className="form-input" type="number" min={0} max={100} required value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Strengths</label><textarea className="form-textarea" rows={2} value={form.strengths} onChange={e => setForm(f => ({ ...f, strengths: e.target.value }))} placeholder="What did the student do well?" /></div>
                <div className="form-group"><label className="form-label">Weaknesses</label><textarea className="form-textarea" rows={2} value={form.weaknesses} onChange={e => setForm(f => ({ ...f, weaknesses: e.target.value }))} placeholder="Areas that need improvement..." /></div>
                <div className="form-group"><label className="form-label">Suggestions</label><textarea className="form-textarea" rows={2} value={form.suggestions} onChange={e => setForm(f => ({ ...f, suggestions: e.target.value }))} placeholder="Actionable feedback..." /></div>
              </div>
              <div className="modal-foot"><button type="button" className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button><button type="submit" className="btn btn-primary">Submit Evaluation</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
