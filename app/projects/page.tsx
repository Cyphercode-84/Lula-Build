'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/lib/store';
import { Project, ProjectStatus } from '@/lib/types';
import { genId } from '@/lib/data';

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-slate-100 text-slate-700',
  bidding: 'bg-amber-100 text-amber-700',
  active: 'bg-teal-100 text-teal-700',
  completed: 'bg-green-100 text-green-700',
  on_hold: 'bg-red-100 text-red-700',
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(n);
}

const EMPTY: Omit<Project, 'id' | 'createdAt'> = {
  name: '', client: '', description: '', status: 'planning', budget: 0,
  startDate: '', endDate: '', location: '',
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

function ProjectForm({ initial, onSave, onCancel }: {
  initial: Omit<Project, 'id' | 'createdAt'>;
  onSave: (data: Omit<Project, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Project Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
          <input required value={form.client} onChange={e => set('client', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value as ProjectStatus)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            {(['planning','bidding','active','completed','on_hold'] as ProjectStatus[]).map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Budget (ZAR)</label>
          <input type="number" min={0} value={form.budget} onChange={e => set('budget', Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
          <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
          <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
          <input value={form.location} onChange={e => set('location', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
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
          Save Project
        </button>
      </div>
    </form>
  );
}

export default function ProjectsPage() {
  const { state, dispatch } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [detail, setDetail] = useState<Project | null>(null);

  const filtered = state.projects.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function handleCreate(data: Omit<Project, 'id' | 'createdAt'>) {
    dispatch({ type: 'ADD_PROJECT', payload: { ...data, id: genId(), createdAt: new Date().toISOString().slice(0, 10) } });
    setCreating(false);
  }

  function handleUpdate(data: Omit<Project, 'id' | 'createdAt'>) {
    if (!editing) return;
    dispatch({ type: 'UPDATE_PROJECT', payload: { ...editing, ...data } });
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (confirm('Delete this project?')) {
      dispatch({ type: 'DELETE_PROJECT', payload: id });
      if (detail?.id === id) setDetail(null);
    }
  }

  const projectEstimates = detail ? state.estimateItems.filter(e => e.projectId === detail.id) : [];
  const projectBids = detail ? state.bids.filter(b => b.projectId === detail.id) : [];
  const totalEst = projectEstimates.reduce((s, e) => s + e.total, 0);

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main list */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="flex-1 min-w-[180px] px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All statuses</option>
              {['planning','bidding','active','completed','on_hold'].map(s => (
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
              New Project
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Project</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Budget</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400">No projects found</td></tr>
                ) : filtered.map(p => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50 cursor-pointer ${detail?.id === p.id ? 'bg-teal-50' : ''}`}
                    onClick={() => setDetail(detail?.id === p.id ? null : p)}
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.location}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 hidden md:table-cell">{p.client}</td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-800 hidden sm:table-cell">
                      {fmt(p.budget)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setEditing(p)}
                          className="p-1.5 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-2">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Detail panel */}
        {detail && (
          <div className="lg:w-80 bg-white rounded-xl border border-slate-200 p-5 h-fit space-y-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900 leading-tight">{detail.name}</h3>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[detail.status]}`}>
              {detail.status.replace('_', ' ')}
            </span>

            {detail.description && <p className="text-sm text-slate-600">{detail.description}</p>}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Client</span><span className="font-medium">{detail.client}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Budget</span><span className="font-semibold text-slate-900">{fmt(detail.budget)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="font-medium">{detail.location || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Start</span><span className="font-medium">{detail.startDate || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">End</span><span className="font-medium">{detail.endDate || '—'}</span></div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Estimate Summary</p>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">{projectEstimates.length} line items</span>
                <span className="font-semibold">{fmt(totalEst)}</span>
              </div>
              {totalEst > 0 && (
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${totalEst > detail.budget ? 'bg-red-500' : 'bg-teal-500'}`}
                    style={{ width: `${Math.min((totalEst / detail.budget) * 100, 100)}%` }}
                  />
                </div>
              )}
              {totalEst > detail.budget && detail.budget > 0 && (
                <p className="text-xs text-red-600 mt-1">Estimate exceeds budget by {fmt(totalEst - detail.budget)}</p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Bids ({projectBids.length})</p>
              {projectBids.length === 0 ? <p className="text-xs text-slate-400">No bids yet</p> : (
                <div className="space-y-1">
                  {projectBids.map(b => (
                    <div key={b.id} className="flex justify-between text-xs">
                      <span className="text-slate-600 truncate">{b.vendorName}</span>
                      <span className="font-medium ml-2">{fmt(b.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {creating && (
        <Modal title="New Project" onClose={() => setCreating(false)}>
          <ProjectForm initial={EMPTY} onSave={handleCreate} onCancel={() => setCreating(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit Project" onClose={() => setEditing(null)}>
          <ProjectForm
            initial={{ name: editing.name, client: editing.client, description: editing.description, status: editing.status, budget: editing.budget, startDate: editing.startDate, endDate: editing.endDate, location: editing.location }}
            onSave={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </AppLayout>
  );
}
