import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    try {
      const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
      setCategories(data || []);
    } catch {}
    finally { setLoading(false); }
  }

  async function addCategory() {
    if (!newName.trim()) return;
    const slug = newName.trim().toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase.from('categories').insert({
      name: newName.trim(),
      slug,
      icon_name: newIcon.trim() || null,
    }).select().single();
    if (!error && data) {
      setCategories(prev => [...prev, data]);
      setNewName('');
      setNewIcon('');
    }
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    await supabase.from('categories').delete().eq('id', id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }

  async function saveEdit(id) {
    if (!editName.trim()) return;
    await supabase.from('categories').update({ name: editName.trim() }).eq('id', id);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName.trim() } : c));
    setEditId(null);
  }

  return (
    <>
      <div className="top-bar">
        <h2>Categories</h2>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <>
            {/* Add New Category */}
            <div className="data-table-wrap" style={{ marginBottom: 24 }}>
              <div className="data-table-header">
                <h3>Add New Category</h3>
              </div>
              <div style={{ padding: 20, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Category Name *</label>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Photography"
                    style={{
                      width: '100%', padding: '10px 14px', background: 'var(--bg-primary)',
                      border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)',
                      fontSize: 14, fontFamily: 'Inter',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Icon Name</label>
                  <input
                    value={newIcon}
                    onChange={e => setNewIcon(e.target.value)}
                    placeholder="e.g. camera"
                    style={{
                      width: '100%', padding: '10px 14px', background: 'var(--bg-primary)',
                      border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)',
                      fontSize: 14, fontFamily: 'Inter',
                    }}
                  />
                </div>
                <button className="btn btn-primary" onClick={addCategory} style={{ height: 42 }}>
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="data-table-wrap">
              <div className="data-table-header">
                <h3>All Categories ({categories.length})</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Icon</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td>
                        {editId === cat.id ? (
                          <input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            style={{
                              padding: '6px 10px', background: 'var(--bg-primary)',
                              border: '1px solid var(--accent)', borderRadius: 6,
                              color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Inter',
                            }}
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && saveEdit(cat.id)}
                          />
                        ) : (
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{cat.name}</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.slug}</td>
                      <td style={{ fontSize: 13 }}>{cat.icon_name || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {editId === cat.id ? (
                            <>
                              <button className="btn btn-sm btn-success" onClick={() => saveEdit(cat.id)}><Check size={14} /></button>
                              <button className="btn btn-sm btn-outline" onClick={() => setEditId(null)}><X size={14} /></button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-sm btn-outline" onClick={() => { setEditId(cat.id); setEditName(cat.name); }}>
                                <Edit2 size={14} />
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => deleteCategory(cat.id)}>
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
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
