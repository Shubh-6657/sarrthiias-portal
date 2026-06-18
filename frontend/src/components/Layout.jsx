import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const NAV = {
  admin:     [{ to:'/dashboard',    icon:'📊', label:'Dashboard'        },
              { to:'/students',     icon:'👨‍🎓', label:'Students'        },
              { to:'/users',        icon:'👥', label:'Users'             },
              { to:'/tasks',        icon:'📋', label:'Tasks'             },
              { to:'/evaluations',  icon:'📝', label:'Evaluations'       },
              { to:'/study-plans',  icon:'🤖', label:'AI Study Plans'    },
              { to:'/notifications',icon:'🔔', label:'Notifications'     }],
  mentor:    [{ to:'/dashboard',    icon:'📊', label:'Dashboard'        },
              { to:'/students',     icon:'👨‍🎓', label:'My Students'     },
              { to:'/tasks',        icon:'📋', label:'Tasks'             },
              { to:'/study-plans',  icon:'🤖', label:'AI Study Plans'   },
              { to:'/notifications',icon:'🔔', label:'Notifications'    }],
  evaluator: [{ to:'/dashboard',    icon:'📊', label:'Dashboard'        },
              { to:'/evaluations',  icon:'📝', label:'Evaluations'       },
              { to:'/notifications',icon:'🔔', label:'Notifications'    }],
  student:   [{ to:'/dashboard',    icon:'📊', label:'Dashboard'        },
              { to:'/tasks',        icon:'📋', label:'My Tasks'          },
              { to:'/evaluations',  icon:'📝', label:'My Evaluations'    },
              { to:'/study-plans',  icon:'🤖', label:'AI Study Plan'    },
              { to:'/notifications',icon:'🔔', label:'Notifications'    }],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [unread, setUnread] = useState(0);
  const [open, setOpen]     = useState(false);   // mobile sidebar

  // Close sidebar on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Fetch unread count
  useEffect(() => {
    const fetch = () =>
      api.get('/notifications').then(r => setUnread(r.data?.unreadCount || 0)).catch(() => {});
    fetch();
    const t = setInterval(fetch, 30000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const links    = NAV[user?.role] || [];
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="layout">

      {/* ── Mobile hamburger ── */}
      <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
        <span /><span /><span />
      </button>

      {/* ── Backdrop for mobile ── */}
      <div className={`overlay-bg${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      {/* ── Sidebar ── */}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <h1>🎯 SarrthiIAS</h1>
          <p>Intelligence Portal</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">{user?.role?.toUpperCase()} PANEL</div>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span style={{ fontSize: '1rem' }}>{l.icon}</span>
              <span>{l.label}</span>
              {l.label === 'Notifications' && unread > 0 &&
                <span className="nav-badge">{unread > 99 ? '99+' : unread}</span>}
            </NavLink>
          ))}

          <div className="nav-label" style={{ marginTop: 8 }}>PUBLIC</div>
          <a href="/readiness" target="_blank" rel="noreferrer" className="nav-link">
            <span>🧭</span><span>Readiness Analyzer</span>
          </a>
        </nav>

        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main">
        <div className="main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
