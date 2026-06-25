import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, X, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [actionLoading, setActionLoading] = useState(null); // id being acted on

  useEffect(() => { fetchConsultants(); }, []);

  async function fetchConsultants() {
    try {
      const { data, error } = await supabase
        .from('consultant_profiles')
        .select('*, profiles!consultant_profiles_user_id_fkey(name, email, phone)')
        .order('created_at', { ascending: false });
      if (error) console.error('Fetch error:', error.message);
      setConsultants(data || []);
    } catch {}
    finally { setLoading(false); }
  }

  async function toggleApproval(id, current) {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('consultant_profiles')
        .update({ is_approved: !current })
        .eq('id', id);
      if (error) {
        console.error('Toggle error:', error.message);
        return;
      }
      setConsultants(prev => prev.map(c => c.id === id ? { ...c, is_approved: !current } : c));
      if (selected?.id === id) setSelected(prev => ({ ...prev, is_approved: !current }));
    } finally {
      setActionLoading(null);
    }
  }

  async function toggleActive(id, current) {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('consultant_profiles')
        .update({ is_active: !current })
        .eq('id', id);
      if (error) {
        console.error('Toggle active error:', error.message);
        return;
      }
      setConsultants(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
      if (selected?.id === id) setSelected(prev => ({ ...prev, is_active: !current }));
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCount = consultants.filter(c => !c.is_approved).length;
  const approvedCount = consultants.filter(c => c.is_approved).length;

  const filtered = consultants.filter(c => {
    const matchesSearch =
      c.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'pending' ? !c.is_approved :
      c.is_approved;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <div className="top-bar">
        <h2>Consultant Management</h2>
        <div className="top-bar-actions">
          <div className="search-box">
            <Search size={16} color="#9CA3AF" />
            <input placeholder="Search by name, email, code..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <>
            {/* Pending Approvals Alert Banner */}
            {pendingCount > 0 && (
              <div className="approval-banner">
                <div className="approval-banner-icon">
                  <AlertTriangle size={20} />
                </div>
                <div className="approval-banner-text">
                  <strong>{pendingCount} consultant{pendingCount > 1 ? 's' : ''} pending approval</strong>
                  <span>New registrations need your review before they become visible to clients.</span>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => setFilter('pending')}>
                  Review Now
                </button>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All <span className="tab-count">{consultants.length}</span>
              </button>
              <button
                className={`filter-tab pending ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                <Clock size={14} /> Pending <span className="tab-count warning">{pendingCount}</span>
              </button>
              <button
                className={`filter-tab approved ${filter === 'approved' ? 'active' : ''}`}
                onClick={() => setFilter('approved')}
              >
                <ShieldCheck size={14} /> Approved <span className="tab-count success">{approvedCount}</span>
              </button>
            </div>

            {/* Consultants Table */}
            <div className="data-table-wrap">
              <div className="data-table-header">
                <h3>
                  {filter === 'pending' ? 'Pending Approvals' :
                   filter === 'approved' ? 'Approved Consultants' :
                   'All Consultants'} ({filtered.length})
                </h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Consultant</th>
                    <th>Code</th>
                    <th>Category</th>
                    <th>Experience</th>
                    <th>Expertise</th>
                    <th>Base Price</th>
                    <th>Visibility</th>
                    <th>Approval</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <div className="empty-state">
                          {filter === 'pending'
                            ? '🎉 No pending approvals — all caught up!'
                            : 'No consultants found'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map(c => (
                      <tr key={c.id} className={!c.is_approved ? 'pending-row' : ''}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar">
                              {c.avatar_url ? <img src={c.avatar_url} alt="" /> : c.display_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{c.display_name || c.profiles?.name}</div>
                              <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.profiles?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="code-badge">{c.code || '—'}</span></td>
                        <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{c.category || '—'}</td>
                        <td style={{ fontSize: 13 }}>{c.experience || '—'}</td>
                        <td style={{ fontSize: 13, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.expertise || '—'}</td>
                        <td style={{ fontSize: 13 }}>{c.base_price ? `₹${Number(c.base_price).toLocaleString()}` : '—'}</td>
                        <td>
                          {c.is_active
                            ? <span className="badge badge-success">Active</span>
                            : <span className="badge badge-neutral">Inactive</span>
                          }
                        </td>
                        <td>
                          {c.is_approved
                            ? <span className="badge badge-success">Approved</span>
                            : <span className="badge badge-warning">Pending</span>
                          }
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-sm btn-outline" onClick={() => setSelected(c)}>
                              <Eye size={14} /> View
                            </button>
                            <button
                              className={`btn btn-sm ${c.is_approved ? 'btn-danger' : 'btn-success'}`}
                              onClick={() => toggleApproval(c.id, c.is_approved)}
                              disabled={actionLoading === c.id}
                            >
                              {actionLoading === c.id ? '...' :
                                c.is_approved ? <><XCircle size={14} /> Revoke</> : <><CheckCircle size={14} /> Approve</>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3>Consultant Profile</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              {/* Profile Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div className="avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
                  {selected.avatar_url ? <img src={selected.avatar_url} alt="" /> : selected.display_name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{selected.display_name}</div>
                  <div style={{ fontSize: 13, color: '#9CA3AF' }}>{selected.profiles?.email}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <span className="code-badge">{selected.code || '—'}</span>
                    {selected.is_approved
                      ? <span className="badge badge-success">Approved</span>
                      : <span className="badge badge-warning">Pending Approval</span>
                    }
                    {selected.is_active
                      ? <span className="badge badge-success">Active</span>
                      : <span className="badge badge-neutral">Inactive</span>
                    }
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="detail-grid">
                <div className="field">
                  <div className="field-label">Category</div>
                  <div className="field-value" style={{ textTransform: 'capitalize' }}>{selected.category || '—'}</div>
                </div>
                <div className="field">
                  <div className="field-label">Experience</div>
                  <div className="field-value">{selected.experience || '—'}</div>
                </div>
                <div className="field">
                  <div className="field-label">Expertise / Skills</div>
                  <div className="field-value">{selected.expertise || '—'}</div>
                </div>
                <div className="field">
                  <div className="field-label">Base Price</div>
                  <div className="field-value">{selected.base_price ? `₹${Number(selected.base_price).toLocaleString()}` : 'Not set'}</div>
                </div>
                <div className="field">
                  <div className="field-label">Subtitle</div>
                  <div className="field-value">{selected.subtitle || '—'}</div>
                </div>
                <div className="field">
                  <div className="field-label">Phone</div>
                  <div className="field-value">{selected.profiles?.phone || '—'}</div>
                </div>
              </div>

              <div className="field" style={{ marginTop: 16 }}>
                <div className="field-label">Bio</div>
                <div className="field-value">{selected.bio || 'No bio provided'}</div>
              </div>

              <div className="field" style={{ marginTop: 16 }}>
                <div className="field-label">Registered</div>
                <div className="field-value">{selected.created_at ? new Date(selected.created_at).toLocaleString('en-IN') : '—'}</div>
              </div>

              {/* Portfolio Images */}
              {selected.portfolio_images?.length > 0 && (
                <div className="field" style={{ marginTop: 16 }}>
                  <div className="field-label">Portfolio ({selected.portfolio_images.length} images)</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {selected.portfolio_images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                        <img src={img} alt="" style={{ width: 90, height: 90, borderRadius: 8, objectFit: 'cover', border: '1px solid #E5E7EB', cursor: 'pointer', transition: 'transform 0.15s' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                <button
                  className={`btn ${selected.is_approved ? 'btn-danger' : 'btn-success'}`}
                  onClick={() => toggleApproval(selected.id, selected.is_approved)}
                  disabled={actionLoading === selected.id}
                  style={{ flex: 1 }}
                >
                  {actionLoading === selected.id ? 'Processing...' :
                    selected.is_approved ? '✕ Revoke Approval' : '✓ Approve Consultant'}
                </button>
                <button
                  className={`btn ${selected.is_active ? 'btn-outline' : 'btn-primary'}`}
                  onClick={() => toggleActive(selected.id, selected.is_active)}
                  disabled={actionLoading === selected.id}
                  style={{ flex: 1 }}
                >
                  {selected.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
