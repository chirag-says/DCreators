import { useState, useEffect } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const STATUS_BADGE = {
  pending: 'badge-warning', accepted: 'badge-info', advance_paid: 'badge-info',
  in_progress: 'badge-info', review_1: 'badge-info', review_2: 'badge-info',
  final_review: 'badge-warning', approved: 'badge-success', completed: 'badge-success',
  cancelled: 'badge-danger', rejected: 'badge-danger', expired: 'badge-neutral',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    try {
      const { data } = await supabase
        .from('projects')
        .select('*, profiles!projects_client_id_fkey(name, email), consultant_profiles(display_name)')
        .order('created_at', { ascending: false });
      setProjects(data || []);
    } catch {}
    finally { setLoading(false); }
  }

  const filtered = projects.filter(p => {
    const matchSearch = !search || 
      p.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.assignment_type?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ['all', ...new Set(projects.map(p => p.status))];

  return (
    <>
      <div className="top-bar">
        <h2>Projects</h2>
        <div className="top-bar-actions">
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)',
              borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'Inter',
            }}
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="data-table-wrap">
            <div className="data-table-header">
              <h3>All Projects ({filtered.length})</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Consultant</th>
                  <th>Type</th>
                  <th>Budget</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{p.profiles?.name || '—'}</td>
                    <td style={{ fontSize: 13 }}>{p.consultant_profiles?.display_name || '—'}</td>
                    <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{p.assignment_type}</td>
                    <td style={{ fontSize: 13 }}>₹{Number(p.budget).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${p.progress_percent || 0}%`, height: '100%', background: '#10B981', borderRadius: 3 }}></div>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 30 }}>{p.progress_percent || 0}%</span>
                      </div>
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-neutral'}`}>{p.status?.replace('_', ' ')}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => setSelected(p)}><Eye size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Project Details</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="field"><div className="field-label">Client</div><div className="field-value">{selected.profiles?.name} ({selected.profiles?.email})</div></div>
              <div className="field"><div className="field-label">Consultant</div><div className="field-value">{selected.consultant_profiles?.display_name || '—'}</div></div>
              <div className="field"><div className="field-label">Type</div><div className="field-value" style={{ textTransform: 'capitalize' }}>{selected.assignment_type}</div></div>
              <div className="field"><div className="field-label">Brief</div><div className="field-value">{selected.assignment_brief}</div></div>
              <div className="field"><div className="field-label">Budget</div><div className="field-value">₹{Number(selected.budget).toLocaleString()}</div></div>
              {selected.final_offer && <div className="field"><div className="field-label">Final Offer</div><div className="field-value">₹{Number(selected.final_offer).toLocaleString()}</div></div>}
              <div className="field"><div className="field-label">Deadline</div><div className="field-value">{selected.deadline || 'Not set'}</div></div>
              <div className="field"><div className="field-label">Status</div><div className="field-value"><span className={`badge ${STATUS_BADGE[selected.status]}`}>{selected.status?.replace('_', ' ')}</span></div></div>
              <div className="field"><div className="field-label">Progress</div><div className="field-value">{selected.progress_percent || 0}%</div></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
