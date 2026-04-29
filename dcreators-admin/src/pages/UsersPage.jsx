import { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      console.log('[Admin] Users fetch result:', { data, error });
      if (error) console.error('[Admin] Users fetch error:', error.message);
      setUsers(data || []);
    } catch (e) { console.error('[Admin] Users exception:', e); }
    finally { setLoading(false); }
  }

  async function toggleBan(userId, currentBanned) {
    await supabase.from('profiles').update({ is_banned: !currentBanned }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !currentBanned } : u));
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="top-bar">
        <h2>User Management</h2>
        <div className="top-bar-actions">
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="data-table-wrap">
            <div className="data-table-header">
              <h3>All Users ({filtered.length})</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Consultant</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar">
                          {user.avatar_url ? <img src={user.avatar_url} alt="" /> : user.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{user.phone || '—'}</td>
                    <td>
                      {user.has_consultant_profile
                        ? <span className="badge badge-info">Yes</span>
                        : <span className="badge badge-neutral">No</span>
                      }
                    </td>
                    <td>
                      {user.is_banned
                        ? <span className="badge badge-danger">Banned</span>
                        : <span className="badge badge-success">Active</span>
                      }
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(user.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${user.is_banned ? 'btn-success' : 'btn-danger'}`}
                        onClick={() => toggleBan(user.id, user.is_banned)}
                      >
                        {user.is_banned ? <><CheckCircle size={14} /> Unban</> : <><Ban size={14} /> Ban</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
