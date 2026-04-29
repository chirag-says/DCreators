import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, FolderKanban, CreditCard, Tag, Bell, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ConsultantsPage from './pages/ConsultantsPage';
import ProjectsPage from './pages/ProjectsPage';
import PaymentsPage from './pages/PaymentsPage';
import CategoriesPage from './pages/CategoriesPage';
import './index.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/consultants', label: 'Consultants', icon: Briefcase },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/categories', label: 'Categories', icon: Tag },
];

export default function App() {
  return (
    <BrowserRouter>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E03A5F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800, fontSize: 16 }}>D</div>
          <div>
            <h1>DCreators</h1>
            <span>Admin Panel</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px' }}>
            <div className="avatar">A</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Admin</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Super Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/consultants" element={<ConsultantsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
