import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchConsultants(); }, []);

  async function fetchConsultants() {
    try {
      const { data } = await supabase
        .from('consultant_profiles')
        .select('*, profiles!consultant_profiles_user_id_fkey(name, email, phone)')
        .order('created_at', { ascending: false });
      setConsultants(data || []);
    } catch {}
    finally { setLoading(false); }
  }

  async function toggleApproval(id, current) {
    await supabase.from('consultant_profiles').update({ is_approved: !current }).eq('id', id);
    setConsultants(prev => prev.map(c => c.id === id ? { ...c, is_approved: !current } : c));
    if (selected?.id === id) setSelected(prev => ({ ...prev, is_approved: !current }));
  }

  const filtered = consultants.filter(c =>
    c.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="top-bar">
        <h2>Consultant Management</h2>
        <div className="top-bar-actions">
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input placeholder="Search consultants..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="data-table-wrap">
            <div className="data-table-header">
              <h3>All Consultants ({filtered.length})</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-warning">{consultants.filter(c => !c.is_approved).length} Pending</span>
                <span className="badge badge-success">{consultants.filter(c => c.is_approved).length} Approved</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Consultant</th>
                  <th>Category</th>
                  <th>Experience</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar">
                          {c.avatar_url ? <img src={c.avatar_url} alt="" /> : c.display_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.display_name || c.profiles?.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.profiles?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{c.category || '—'}</td>
                    <td style={{ fontSize: 13 }}>{c.experience || '—'}</td>
                    <td style={{ fontSize: 13 }}>₹{Number(c.price_per_project || 0).toLocaleString()}</td>
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
                        >
                          {c.is_approved ? <><XCircle size={14} /> Revoke</> : <><CheckCircle size={14} /> Approve</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Consultant Profile</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div className="avatar" style={{ width: 56, height: 56, fontSize: 22 }}>
                  {selected.avatar_url ? <img src={selected.avatar_url} alt="" /> : selected.display_name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{selected.display_name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selected.profiles?.email}</div>
                </div>
              </div>
              <div className="field"><div className="field-label">Category</div><div className="field-value" style={{ textTransform: 'capitalize' }}>{selected.category}</div></div>
              <div className="field"><div className="field-label">Skills</div><div className="field-value">{selected.skills?.join(', ') || '—'}</div></div>
              <div className="field"><div className="field-label">Experience</div><div className="field-value">{selected.experience}</div></div>
              <div className="field"><div className="field-label">Price per Project</div><div className="field-value">₹{Number(selected.price_per_project || 0).toLocaleString()}</div></div>
              <div className="field"><div className="field-label">Bio</div><div className="field-value">{selected.bio || '—'}</div></div>
              <div className="field"><div className="field-label">Status</div>
                <div className="field-value">
                  {selected.is_approved ? <span className="badge badge-success">Approved</span> : <span className="badge badge-warning">Pending Approval</span>}
                </div>
              </div>
              {selected.portfolio_images?.length > 0 && (
                <div className="field">
                  <div className="field-label">Portfolio</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {selected.portfolio_images.map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                    ))}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                <button
                  className={`btn ${selected.is_approved ? 'btn-danger' : 'btn-success'}`}
                  onClick={() => toggleApproval(selected.id, selected.is_approved)}
                  style={{ flex: 1 }}
                >
                  {selected.is_approved ? 'Revoke Approval' : 'Approve Consultant'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
