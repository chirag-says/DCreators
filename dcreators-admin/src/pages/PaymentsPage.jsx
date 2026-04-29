import { useState, useEffect } from 'react';
import { Search, IndianRupee } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ total: 0, advance: 0, balance: 0 });

  useEffect(() => { fetchPayments(); }, []);

  async function fetchPayments() {
    try {
      const { data } = await supabase
        .from('payments')
        .select('*, profiles!payments_payer_id_fkey(name, email)')
        .order('created_at', { ascending: false });
      
      const all = data || [];
      setPayments(all);
      setTotals({
        total: all.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0),
        advance: all.filter(p => p.payment_type === 'advance' && p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0),
        balance: all.filter(p => p.payment_type === 'balance' && p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0),
      });
    } catch {}
    finally { setLoading(false); }
  }

  const filtered = payments.filter(p =>
    !search ||
    p.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.payment_type?.toLowerCase().includes(search.toLowerCase())
  );

  const TYPE_BADGE = { advance: 'badge-info', balance: 'badge-success', shop_purchase: 'badge-warning' };
  const STATUS_BADGE = { completed: 'badge-success', pending: 'badge-warning', failed: 'badge-danger', refunded: 'badge-neutral' };

  return (
    <>
      <div className="top-bar">
        <h2>Payments</h2>
        <div className="top-bar-actions">
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <>
            {/* Revenue Cards */}
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <IndianRupee size={20} color="#10B981" />
                </div>
                <div className="stat-value">₹{totals.total.toLocaleString()}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <IndianRupee size={20} color="#3B82F6" />
                </div>
                <div className="stat-value">₹{totals.advance.toLocaleString()}</div>
                <div className="stat-label">Advance Payments</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>
                  <IndianRupee size={20} color="#8B5CF6" />
                </div>
                <div className="stat-value">₹{totals.balance.toLocaleString()}</div>
                <div className="stat-label">Balance Payments</div>
              </div>
            </div>

            <div className="data-table-wrap">
              <div className="data-table-header">
                <h3>Payment History ({filtered.length})</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Payer</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar">{p.profiles?.name?.charAt(0) || '?'}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.profiles?.name || 'Unknown'}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.profiles?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: 14 }}>₹{Number(p.amount).toLocaleString()}</td>
                      <td><span className={`badge ${TYPE_BADGE[p.payment_type] || 'badge-neutral'}`}>{p.payment_type}</span></td>
                      <td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-neutral'}`}>{p.status}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(p.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
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
