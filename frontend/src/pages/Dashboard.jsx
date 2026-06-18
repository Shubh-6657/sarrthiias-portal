import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const C = ['#10b981','#6366f1','#f59e0b','#ef4444'];

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-icon" style={{ background: `${color}20`, fontSize: 22 }}>{icon}</div>
      <div><div className="stat-val">{value ?? 0}</div><div className="stat-lbl">{label}</div></div>
    </div>
  );
}

// ─── Admin Dashboard ───────────────────────────────────────────────
function AdminDash() {
  const [stats, setStats]   = useState({});
  const [perf, setPerf]     = useState([]);
  const [score, setScore]   = useState([]);
  const [tasks, setTasks]   = useState([]);
  const [top, setTop]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/perf'),
      api.get('/admin/score-trend'),
      api.get('/admin/task-trend'),
      api.get('/admin/top-students'),
    ]).then(([s, p, sc, t, tp]) => {
      setStats(s.data);
      const dist = p.data?.distribution || {};
      setPerf(Object.entries(dist).map(([name, value]) => ({ name, value })));
      setScore((sc.data?.trend || []).map(d => ({ date: d.date, score: d.score })));
      // group task trend by date
      const map = {};
      (t.data?.trend || []).forEach(d => {
        if (!map[d.date]) map[d.date] = { date: d.date, Pending: 0, Submitted: 0, Evaluated: 0 };
        map[d.date][d.status] = (map[d.date][d.status] || 0) + 1;
      });
      setTasks(Object.values(map).slice(-14));
      setTop(tp.data?.students || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center-spin"><div className="spin"></div><p>Loading dashboard...</p></div>;

  return (
    <div>
      <div className="page-head"><div><h1 className="page-title">Admin Dashboard</h1><p className="page-sub">System-wide overview</p></div></div>
      <div className="charts-grid">
        <StatCard icon="👨‍🎓" label="Total Students"        value={stats.totalStudents}        color="#6366f1" />
        <StatCard icon="✅"   label="Active Students"       value={stats.activeStudents}       color="#10b981" />
        <StatCard icon="👨‍🏫" label="Total Mentors"         value={stats.totalMentors}         color="#3b82f6" />
        <StatCard icon="📝"   label="Total Evaluators"      value={stats.totalEvaluators}      color="#f59e0b" />
        <StatCard icon="⏳"   label="Pending Evaluations"   value={stats.pendingEvaluations}   color="#ef4444" />
        <StatCard icon="🏆"   label="Completed Evaluations" value={stats.completedEvaluations} color="#10b981" />
      </div>

      <div style={{ marginTop: 28 }} className="charts-grid">
        <div className="card">
          <div className="card-head"><span className="card-title">Performance Distribution</span></div>
            {perf.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={perf}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    innerRadius={45}
                  >
                {perf.map((e, i) => (
                <Cell key={i} fill={C[i % C.length]} />
              ))}
            </Pie>
        <Tooltip
          formatter={(value, name) => [`${value} students`, name]}
          contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: '0.75rem', color: '#374151' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty"><div className="empty-icon">📊</div><p>No student data yet</p></div>}
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title">Evaluation Score Trend</span></div>
          {score.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={score}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{fontSize:11}} /><YAxis domain={[0,100]} /><Tooltip />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} name="Score" />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="empty"><div className="empty-icon">📈</div><p>No evaluations yet</p></div>}
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Task Status Trend</span></div>
          {tasks.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={tasks}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{fontSize:10}} /><YAxis /><Tooltip /><Legend />
                <Bar dataKey="Evaluated" fill="#10b981" /><Bar dataKey="Submitted" fill="#6366f1" /><Bar dataKey="Pending" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty"><div className="empty-icon">✅</div><p>No tasks yet</p></div>}
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">🏆 Top Students</span></div>
          <div className="card-body">
            {top.length === 0 ? <div className="empty"><div className="empty-icon">🏆</div><p>No students yet</p></div>
              : top.map((s, i) => (
              <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? '#f59e0b' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{i+1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.stats?.testsAttempted || 0} tests</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#6366f1' }}>{s.stats?.averageScore || 0}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mentor Dashboard ──────────────────────────────────────────────
function MentorDash() {
  const [students, setStudents] = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([api.get('/users/my-students'), api.get('/tasks')])
      .then(([s, t]) => { setStudents(Array.isArray(s.data) ? s.data : []); setTasks(Array.isArray(t.data) ? t.data : []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center-spin"><div className="spin"></div></div>;
  const statusColor = s => ({ Excellent:'#10b981', Good:'#6366f1', 'Needs Attention':'#f59e0b', Critical:'#ef4444' }[s] || '#6b7280');

  return (
    <div>
      <div className="page-head">
        <div><h1 className="page-title">Mentor Dashboard</h1><p className="page-sub">Monitor your students</p></div>
        <a href="/tasks" className="btn btn-primary">+ Assign Task</a>
      </div>
      <div className="stats-grid">
        <StatCard icon="👨‍🎓" label="My Students"    value={students.length} color="#6366f1" />
        <StatCard icon="📋"   label="Tasks Assigned"  value={tasks.length} color="#10b981" />
        <StatCard icon="⏳"   label="Pending Review"  value={tasks.filter(t=>t.status==='Submitted').length} color="#f59e0b" />
        <StatCard icon="⚠️"   label="Need Attention"  value={students.filter(s=>['Critical','Needs Attention'].includes(s.stats?.performanceStatus)).length} color="#ef4444" />
      </div>
      <div className="card">
        <div className="card-head"><span className="card-title">My Students</span></div>
        {students.length === 0 ? <div className="empty"><div className="empty-icon">👨‍🎓</div><p>No students assigned yet</p></div> : (
          <table className="table">
            <thead><tr><th>Name</th><th>Avg Score</th><th>Tests</th><th>Status</th><th>Last Evaluated</th></tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id}>
                  <td><div style={{fontWeight:600}}>{s.name}</div><div style={{fontSize:'0.75rem',color:'#6b7280'}}>{s.email}</div></td>
                  <td><strong>{s.stats?.averageScore || 0}%</strong></td>
                  <td>{s.stats?.testsAttempted || 0}</td>
                  <td><span style={{padding:'3px 10px',borderRadius:20,fontSize:'0.75rem',fontWeight:600,background:`${statusColor(s.stats?.performanceStatus)}20`,color:statusColor(s.stats?.performanceStatus)}}>{s.stats?.performanceStatus||'Good'}</span></td>
                  <td style={{color:'#6b7280',fontSize:'0.8rem'}}>{s.stats?.lastEvaluationDate?new Date(s.stats.lastEvaluationDate).toLocaleDateString():'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Evaluator Dashboard ───────────────────────────────────────────
function EvaluatorDash() {
  const [pending, setPending]     = useState([]);
  const [evals, setEvals]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([api.get('/submissions/pending'), api.get('/evaluations')])
      .then(([p, e]) => { setPending(Array.isArray(p.data) ? p.data : []); setEvals(Array.isArray(e.data) ? e.data : []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center-spin"><div className="spin"></div></div>;
  const avg = evals.length ? (evals.reduce((a,e)=>a+e.score,0)/evals.length).toFixed(1) : 0;

  return (
    <div>
      <div className="page-head">
        <div><h1 className="page-title">Evaluator Dashboard</h1><p className="page-sub">Review submissions</p></div>
        <a href="/evaluations" className="btn btn-primary">Go to Evaluations</a>
      </div>
      <div className="stats-grid">
        <StatCard icon="⏳" label="Pending"          value={pending.length} color="#f59e0b" />
        <StatCard icon="✅" label="Completed"         value={evals.length}   color="#10b981" />
        <StatCard icon="⭐" label="Avg Score Given"   value={avg}            color="#6366f1" />
        <StatCard icon="⚠️" label="Late Submissions"  value={pending.filter(s=>s.isLate).length} color="#ef4444" />
      </div>
      <div className="charts-grid">
        <div className="card">
          <div className="card-head"><span className="card-title">Pending Submissions</span></div>
          <div className="card-body">
            {pending.length===0?<div className="empty"><div className="empty-icon">🎉</div><p>All caught up!</p></div>
              :pending.slice(0,6).map(s=>(
              <div key={s._id} style={{padding:'10px 0',borderBottom:'1px solid #e5e7eb'}}>
                <div style={{fontWeight:600,fontSize:'0.875rem'}}>{s.task?.title}</div>
                <div style={{fontSize:'0.75rem',color:'#6b7280',marginTop:2}}>{s.student?.name} · {new Date(s.createdAt).toLocaleDateString()}{s.isLate&&<span style={{color:'#ef4444',marginLeft:6}}>⚠ Late</span>}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title">Recent Evaluations</span></div>
          <div className="card-body">
            {evals.length===0?<div className="empty"><div className="empty-icon">📝</div><p>No evaluations yet</p></div>
              :evals.slice(0,6).map(e=>(
              <div key={e._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #e5e7eb'}}>
                <div><div style={{fontWeight:600,fontSize:'0.875rem'}}>{e.student?.name}</div><div style={{fontSize:'0.75rem',color:'#6b7280'}}>{e.task?.title}</div></div>
                <div className="score-circle" style={{background:e.score>=70?'#dcfce7':e.score>=50?'#fef9c3':'#fee2e2',color:e.score>=70?'#16a34a':e.score>=50?'#a16207':'#dc2626'}}>{e.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Student Dashboard ─────────────────────────────────────────────
function StudentDash() {
  const { user } = useAuth();
  const [tasks, setTasks]   = useState([]);
  const [evals, setEvals]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/tasks'), api.get('/evaluations')])
      .then(([t, e]) => { setTasks(Array.isArray(t.data) ? t.data : []); setEvals(Array.isArray(e.data) ? e.data : []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center-spin"><div className="spin"></div></div>;
  const statusColor = s => ({ Excellent:'#10b981', Good:'#6366f1', 'Needs Attention':'#f59e0b', Critical:'#ef4444' }[s] || '#6366f1');

  return (
    <div>
      <div className="page-head"><div><h1 className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</h1><p className="page-sub">Your UPSC preparation overview</p></div></div>
      <div className="stats-grid">
        <StatCard icon="🏆" label="Performance"     value={user?.stats?.performanceStatus||'Good'} color={statusColor(user?.stats?.performanceStatus)} />
        <StatCard icon="📊" label="Average Score"   value={`${user?.stats?.averageScore||0}%`}    color="#6366f1" />
        <StatCard icon="📝" label="Tests Attempted" value={user?.stats?.testsAttempted||0}         color="#10b981" />
        <StatCard icon="📋" label="Pending Tasks"   value={tasks.filter(t=>t.status==='Pending').length} color="#f59e0b" />
      </div>
      <div className="charts-grid">
        <div className="card">
          <div className="card-head"><span className="card-title">Recent Tasks</span><a href="/tasks" className="btn btn-sm btn-outline">View All</a></div>
          <div className="card-body">
            {tasks.length===0?<div className="empty"><div className="empty-icon">📋</div><p>No tasks assigned yet</p></div>
              :tasks.slice(0,5).map(t=>(
              <div key={t._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #e5e7eb'}}>
                <div><div style={{fontWeight:600,fontSize:'0.875rem'}}>{t.title}</div><div style={{fontSize:'0.75rem',color:'#6b7280'}}>Due: {new Date(t.dueDate).toLocaleDateString()}</div></div>
                <span className={`badge badge-${t.priority==='High'?'red':t.priority==='Medium'?'yellow':'green'}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title">Recent Evaluations</span><a href="/evaluations" className="btn btn-sm btn-outline">View All</a></div>
          <div className="card-body">
            {evals.length===0?<div className="empty"><div className="empty-icon">📝</div><p>No evaluations yet</p></div>
              :evals.slice(0,5).map(e=>(
              <div key={e._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #e5e7eb'}}>
                <div><div style={{fontWeight:600,fontSize:'0.875rem'}}>{e.task?.title||'Task'}</div><div style={{fontSize:'0.75rem',color:'#6b7280'}}>{e.evaluator?.name}</div></div>
                <div className="score-circle" style={{width:40,height:40,background:e.score>=70?'#dcfce7':e.score>=50?'#fef9c3':'#fee2e2',color:e.score>=70?'#16a34a':e.score>=50?'#a16207':'#dc2626',fontSize:'0.9rem'}}>{e.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'admin')     return <AdminDash />;
  if (user?.role === 'mentor')    return <MentorDash />;
  if (user?.role === 'evaluator') return <EvaluatorDash />;
  return <StudentDash />;
}
