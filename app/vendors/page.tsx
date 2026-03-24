'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/lib/store';
import { Vendor, VendorType } from '@/lib/types';
import { genId } from '@/lib/data';

const TYPE_COLORS: Record<VendorType, string> = {
  subcontractor: 'bg-blue-100 text-blue-700',
  supplier: 'bg-green-100 text-green-700',
  consultant: 'bg-purple-100 text-purple-700',
};

const EMPTY: Omit<Vendor, 'id' | 'createdAt'> = {
  name: '', type: 'subcontractor', contactName: '', email: '', phone: '',
  address: '', rating: 3, specialties: [],
};

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`${onChange ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <svg className={`w-4 h-4 ${n <= rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function VendorForm({ initial, onSave, onCancel }: {
  initial: Omit<Vendor, 'id' | 'createdAt'>;
  onSave: (data: Omit<Vendor, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...initial, specialtiesText: initial.specialties.join(', ') });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { specialtiesText, ...rest } = form;
    onSave({ ...rest, specialties: specialtiesText.split(',').map(s => s.trim()).filter(Boolean) });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value as VendorType)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            {(['subcontractor','supplier','consultant'] as VendorType[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
          <div className="py-2">
            <StarRating rating={form.rating} onChange={r => set('rating', r)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
          <input value={form.contactName} onChange={e => set('contactName', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
          <input value={form.address} onChange={e => set('address', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Specialties (comma separated)</label>
          <input value={form.specialtiesText} onChange={e => set('specialtiesText', e.target.value)}
            placeholder="e.g. Concrete, Rebar, Formwork"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
          Save Vendor
        </button>
      </div>
    </form>
  );
}

export default function VendorsPage() {
  const { state, dispatch } = useStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [selected, setSelected] = useState<Vendor | null>(null);

  const filtered = state.vendors.filter(v => {
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.contactName.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || v.type === filterType;
    return matchSearch && matchType;
  });

  function handleCreate(data: Omit<Vendor, 'id' | 'createdAt'>) {
    dispatch({ type: 'ADD_VENDOR', payload: { ...data, id: genId(), createdAt: new Date().toISOString().slice(0, 10) } });
    setCreating(false);
  }

  function handleUpdate(data: Omit<Vendor, 'id' | 'createdAt'>) {
    if (!editing) return;
    dispatch({ type: 'UPDATE_VENDOR', payload: { ...editing, ...data } });
    setEditing(null);
    setSelected(prev => prev?.id === editing.id ? { ...editing, ...data } : prev);
  }

  function handleDelete(id: string) {
    if (confirm('Delete this vendor?')) {
      dispatch({ type: 'DELETE_VENDOR', payload: id });
      if (selected?.id === id) setSelected(null);
    }
  }

  const vendorBids = selected ? state.bids.filter(b => b.vendorId === selected.id) : [];

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search vendors..."
              className="flex-1 min-w-[180px] px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All types</option>
              {(['subcontractor','supplier','consultant'] as VendorType[]).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={() => setCreating(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Vendor
            </button>
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <div className="sm:col-span-2 xl:col-span-3 text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
                No vendors found
              </div>
            ) : filtered.map(v => (
              <div
                key={v.id}
                onClick={() => setSelected(s => s?.id === v.id ? null : v)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${
                  selected?.id === v.id ? 'border-teal-500 ring-2 ring-teal-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-slate-600">{v.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setEditing(v)} className="p-1.5 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-slate-900 text-sm">{v.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{v.contactName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[v.type]}`}>{v.type}</span>
                  <StarRating rating={v.rating} />
                </div>
                {v.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {v.specialties.slice(0, 3).map(s => (
                      <span key={s} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                    {v.specialties.length > 3 && (
                      <span className="text-xs text-slate-400">+{v.specialties.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">{filtered.length} vendor{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="lg:w-72 bg-white rounded-xl border border-slate-200 p-5 h-fit space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <span className="text-base font-bold text-slate-600">{selected.name.slice(0, 2).toUpperCase()}</span>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">{selected.name}</h3>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${TYPE_COLORS[selected.type]}`}>{selected.type}</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="text-slate-700">{selected.contactName || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="text-slate-700 text-xs break-all">{selected.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span className="text-slate-700">{selected.phone || '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-slate-700 text-xs">{selected.address || '—'}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Rating</p>
              <StarRating rating={selected.rating} />
            </div>

            {selected.specialties.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Specialties</p>
                <div className="flex flex-wrap gap-1">
                  {selected.specialties.map(s => (
                    <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Bid History ({vendorBids.length})</p>
              {vendorBids.length === 0 ? <p className="text-xs text-slate-400">No bids on record</p> : (
                <div className="space-y-1.5">
                  {vendorBids.map(b => {
                    const proj = state.projects.find(p => p.id === b.projectId);
                    return (
                      <div key={b.id} className="text-xs">
                        <p className="text-slate-600 truncate">{proj?.name ?? 'Unknown'}</p>
                        <p className="font-medium text-slate-800">R {b.amount.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCreating(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Add Vendor</h2>
              <button onClick={() => setCreating(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <VendorForm initial={EMPTY} onSave={handleCreate} onCancel={() => setCreating(false)} />
            </div>
          </div>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Edit Vendor</h2>
              <button onClick={() => setEditing(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <VendorForm
                initial={{ name: editing.name, type: editing.type, contactName: editing.contactName, email: editing.email, phone: editing.phone, address: editing.address, rating: editing.rating, specialties: editing.specialties }}
                onSave={handleUpdate}
                onCancel={() => setEditing(null)}
              />
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
