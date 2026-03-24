'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/lib/store';
import { Bid, BidStatus } from '@/lib/types';
import { genId } from '@/lib/data';

const BID_COLORS: Record<BidStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(n);
}

const EMPTY: Omit<Bid, 'id' | 'createdAt'> = {
  projectId: '',
  vendorId: '',
  vendorName: '',
  amount: 0,
  status: 'draft',
  dueDate: '',
  submittedDate: '',
  notes: '',
};

function BidForm({ initial, projects, vendors, onSave, onCancel }: {
  initial: Omit<Bid, 'id' | 'createdAt'>;
  projects: { id: string; name: string }[];
  vendors: { id: string; name: string }[];
  onSave: (data: Omit<Bid, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }));

  function handleVendorChange(vendorId: string) {
    const v = vendors.find(v => v.id === vendorId);
    setForm(f => ({ ...f, vendorId, vendorName: v?.name ?? '' }));
  }

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Project *</label>
          <select required value={form.projectId} onChange={e => set('projectId', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select project...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Vendor *</label>
          <select required value={form.vendorId} onChange={e => handleVendorChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select vendor...</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Bid Amount (ZAR) *</label>
          <input required type="number" min={0} value={form.amount} onChange={e => set('amount', Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value as BidStatus)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            {(['draft','submitted','under_review','won','lost'] as BidStatus[]).map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
          <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Submitted Date</label>
          <input type="date" value={form.submittedDate} onChange={e => set('submittedDate', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
          Save Bid
        </button>
      </div>
    </form>
  );
}

export default function BidsPage() {
  const { state, dispatch } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Bid | null>(null);

  const filtered = state.bids.filter(b => {
    const matchSearch = !search || b.vendorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || b.status === filterStatus;
    const matchProject = !filterProject || b.projectId === filterProject;
    return matchSearch && matchStatus && matchProject;
  });

  const stats = {
    total: state.bids.length,
    won: state.bids.filter(b => b.status === 'won').length,
    pending: state.bids.filter(b => ['submitted','under_review'].includes(b.status)).length,
    totalValue: state.bids.reduce((s, b) => s + b.amount, 0),
  };

  function handleCreate(data: Omit<Bid, 'id' | 'createdAt'>) {
    dispatch({ type: 'ADD_BID', payload: { ...data, id: genId(), createdAt: new Date().toISOString().slice(0, 10) } });
    setCreating(false);
  }

  function handleUpdate(data: Omit<Bid, 'id' | 'createdAt'>) {
    if (!editing) return;
    dispatch({ type: 'UPDATE_BID', payload: { ...editing, ...data } });
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (confirm('Delete this bid?')) dispatch({ type: 'DELETE_BID', payload: id });
  }

  function handleStatusChange(bid: Bid, status: BidStatus) {
    dispatch({ type: 'UPDATE_BID', payload: { ...bid, status } });
  }

  return (
    <AppLayout>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Bids', value: stats.total, color: 'text-slate-800' },
          { label: 'Won', value: stats.won, color: 'text-green-600' },
          { label: 'Pending Review', value: stats.pending, color: 'text-amber-600' },
          { label: 'Total Bid Value', value: fmt(stats.totalValue), color: 'text-teal-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search vendor..."
          className="flex-1 min-w-[150px] px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        />
        <select
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All projects</option>
          {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All statuses</option>
          {(['draft','submitted','under_review','won','lost'] as BidStatus[]).map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Bid
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Vendor</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Project</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Due</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">No bids found</td></tr>
            ) : filtered.map(bid => {
              const project = state.projects.find(p => p.id === bid.projectId);
              return (
                <tr key={bid.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-900">{bid.vendorName}</p>
                    {bid.notes && <p className="text-xs text-slate-400 truncate max-w-[200px]">{bid.notes}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 hidden md:table-cell text-xs">{project?.name ?? '—'}</td>
                  <td className="px-4 py-3.5">
                    <select
                      value={bid.status}
                      onChange={e => handleStatusChange(bid, e.target.value as BidStatus)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none ${BID_COLORS[bid.status]}`}
                    >
                      {(['draft','submitted','under_review','won','lost'] as BidStatus[]).map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-900">{fmt(bid.amount)}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs hidden lg:table-cell">{bid.dueDate || '—'}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditing(bid)} className="p-1.5 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(bid.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bid comparison for a project */}
      {filterProject && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Bid Comparison — {state.projects.find(p => p.id === filterProject)?.name}</h2>
          <div className="space-y-3">
            {state.bids
              .filter(b => b.projectId === filterProject)
              .sort((a, b) => a.amount - b.amount)
              .map((bid, i) => {
                const max = Math.max(...state.bids.filter(b => b.projectId === filterProject).map(b => b.amount));
                return (
                  <div key={bid.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                    <span className="text-sm font-medium text-slate-800 w-40 truncate">{bid.vendorName}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${i === 0 ? 'bg-teal-500' : 'bg-slate-300'}`}
                        style={{ width: `${(bid.amount / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 w-28 text-right">{fmt(bid.amount)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BID_COLORS[bid.status]} flex-shrink-0`}>
                      {bid.status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCreating(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">New Bid</h2>
              <button onClick={() => setCreating(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <BidForm initial={EMPTY} projects={state.projects} vendors={state.vendors} onSave={handleCreate} onCancel={() => setCreating(false)} />
            </div>
          </div>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Edit Bid</h2>
              <button onClick={() => setEditing(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <BidForm
                initial={{ projectId: editing.projectId, vendorId: editing.vendorId, vendorName: editing.vendorName, amount: editing.amount, status: editing.status, dueDate: editing.dueDate, submittedDate: editing.submittedDate, notes: editing.notes }}
                projects={state.projects}
                vendors={state.vendors}
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
