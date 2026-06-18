import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Evaluations from './pages/Evaluations';
import Students from './pages/Students';
import Readiness from './pages/Readiness';
import { Users, Notifications, StudyPlans } from './pages/Others';

function Guard({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><div style={{ width:36, height:36, border:'3px solid #e5e7eb', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Routes>
        <Route path="/login"     element={<Login />} />
        <Route path="/readiness" element={<Readiness />} />
        <Route path="/" element={<Guard><Layout /></Guard>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<Guard><Dashboard /></Guard>} />
          <Route path="tasks"       element={<Guard><Tasks /></Guard>} />
          <Route path="evaluations" element={<Guard><Evaluations /></Guard>} />
          <Route path="students"    element={<Guard roles={['admin','mentor']}><Students /></Guard>} />
          <Route path="users"       element={<Guard roles={['admin']}><Users /></Guard>} />
          <Route path="notifications" element={<Guard><Notifications /></Guard>} />
          <Route path="study-plans" element={<Guard><StudyPlans /></Guard>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
