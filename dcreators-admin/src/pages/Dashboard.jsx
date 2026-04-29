import { useState, useEffect } from 'react';
import { Users, Briefcase, FolderKanban, CreditCard, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, consultants: 0, projects: 0, revenue: 0, pending: 0, active: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    try {
      const [usersRes, consultantsRes, projectsRes, paymentsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('consultant_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id, status', { count: 'exact' }),
        supabase.from('payments').select('amount').eq('status', 'completed'),
      ]);

      const revenue = paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const pending = projectsRes.data?.filter(p => p.status === 'pending').length || 0;
      const active = projectsRes.data?.filter(p => ['in_progress', 'review_1', 'review_2', 'final_review'].includes(p.status)).length || 0;

      setStats({
        users: usersRes.count || 0,
        consultants: consultantsRes.count || 0,
        projects: projectsRes.count || 0,
        revenue,
        pending,
        active,
      });

      // Fetch recent projects
      const { data: recent } = await supabase
        .from('projects')
        .select('*, profiles!projects_client_id_fkey(name, email)')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentProjects(recent || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const STAT_CARDS = [
    { label: 'Total Users', value: stats.users, icon: Users, color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
    { label: 'Consultants', value: stats.consultants, icon: Briefcase, color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
    { label: 'Total Projects', value: stats.projects, icon: FolderKanban, color: '#E03A5F', bg: 'rgba(224,58,95,0.15)' },
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: CreditCard, color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
    { label: 'Pending Projects', value: stats.pending, icon: Activity, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
    { label: 'Active Projects', value: stats.active, icon: TrendingUp, color: '#06B6D4', bg: 'rgba(6,182,212,0.15)' },
  ];

  const STATUS_BADGE = {
    pending: 'badge-warning', accepted: 'badge-info', in_progress: 'badge-info',
    review_1: 'badge-info', review_2: 'badge-info', final_review: 'badge-warning',
    approved: 'badge-success', completed: 'badge-success', cancelled: 'badge-danger',
  };

  return (
    <>
      <div className="top-bar">
        <h2>Dashboard</h2>
        <div className="top-bar-actions">
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <>
            <div className="stat-grid">
              {STAT_CARDS.map(card => (
                <div className="stat-card" key={card.label}>
                  <div className="stat-icon" style={{ background: card.bg }}>
                    <card.icon size={20} color={card.color} />
                  </div>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-label">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="data-table-wrap">
              <div className="data-table-header">
                <h3>Recent Projects</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar">{p.profiles?.name?.charAt(0) || '?'}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.profiles?.name || 'Unknown'}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.profiles?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{p.assignment_type}</td>
                      <td>₹{Number(p.budget).toLocaleString()}</td>
                      <td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-neutral'}`}>{p.status?.replace('_', ' ')}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
