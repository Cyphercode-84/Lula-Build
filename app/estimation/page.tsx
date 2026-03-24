'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/lib/store';
import { EstimateItem, EstimateCategory } from '@/lib/types';
import { genId } from '@/lib/data';

const CATEGORY_COLORS: Record<EstimateCategory, string> = {
  labor: 'bg-blue-100 text-blue-700',
  equipment: 'bg-amber-100 text-amber-700',
  materials: 'bg-green-100 text-green-700',
  subcontracts: 'bg-purple-100 text-purple-700',
};

const CATEGORY_BAR: Record<EstimateCategory, string> = {
  labor: 'bg-blue-500',
  equipment: 'bg-amber-500',
  materials: 'bg-green-500',
  subcontracts: 'bg-purple-500',
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(n);
}

const EMPTY_ITEM: Omit<EstimateItem, 'id' | 'projectId'> = {
  category: 'labor',
  description: '',
  quantity: 1,
  unit: 'days',
  rate: 0,
  total: 0,
  notes: '',
};

function ItemForm({ initial, onSave, onCancel }: {
  initial: Omit<EstimateItem, 'id' | 'projectId'>;
  onSave: (data: Omit<EstimateItem, 'id' | 'projectId'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => {
    setForm(f => {
      const updated = { ...f, [k]: v };
      if (k === 'quantity' || k === 'rate') {
        const q = k === 'quantity' ? (v as number) : f.quantity;
        const r = k === 'rate' ? (v as number) : f.rate;
        updated.total = Math.round(q * r * 100) / 100;
      }
      return updated;
    });
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
          <input required value={form.description} onChange={e => set('description', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value as EstimateCategory)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            {(['labor','equipment','materials','subcontracts'] as EstimateCategory[]).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
          <input value={form.unit} onChange={e => set('unit', e.target.value)}
            list="units-list"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <datalist id="units-list">
            {['days','hours','m²','m³','tons','units','lump sum','weeks','months'].map(u => <option key={u} value={u} />)}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
          <input type="number" min={0} step="any" value={form.quantity} onChange={e => set('quantity', Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rate (ZAR)</label>
          <input type="number" min={0} step="any" value={form.rate} onChange={e => set('rate', Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="col-span-2">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-slate-700">Line Total</span>
            <span className="text-lg font-bold text-slate-900">{fmt(form.total)}</span>
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <input value={form.notes} onChange={e => set('notes', e.target.value)}
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
          Save Item
        </button>
      </div>
    </form>
  );
}

export default function EstimationPage() {
  const { state, dispatch } = useStore();
  const [selectedProjectId, setSelectedProjectId] = useState(state.projects[0]?.id ?? '');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<EstimateItem | null>(null);
  const [filterCat, setFilterCat] = useState<EstimateCategory | ''>('');

  const project = state.projects.find(p => p.id === selectedProjectId);
  const items = state.estimateItems.filter(e =>
    e.projectId === selectedProjectId && (!filterCat || e.category === filterCat)
  );
  const allItems = state.estimateItems.filter(e => e.projectId === selectedProjectId);

  const totals = {
    labor: allItems.filter(e => e.category === 'labor').reduce((s, e) => s + e.total, 0),
    equipment: allItems.filter(e => e.category === 'equipment').reduce((s, e) => s + e.total, 0),
    materials: allItems.filter(e => e.category === 'materials').reduce((s, e) => s + e.total, 0),
    subcontracts: allItems.filter(e => e.category === 'subcontracts').reduce((s, e) => s + e.total, 0),
  };
  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);

  function handleAdd(data: Omit<EstimateItem, 'id' | 'projectId'>) {
    dispatch({ type: 'ADD_ESTIMATE_ITEM', payload: { ...data, id: genId(), projectId: selectedProjectId } });
    setAdding(false);
  }

  function handleUpdate(data: Omit<EstimateItem, 'id' | 'projectId'>) {
    if (!editing) return;
    dispatch({ type: 'UPDATE_ESTIMATE_ITEM', payload: { ...editing, ...data } });
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (confirm('Remove this line item?')) dispatch({ type: 'DELETE_ESTIMATE_ITEM', payload: id });
  }

  return (
    <AppLayout>
      {/* Project Selector */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Project</label>
          <select
            value={selectedProjectId}
            onChange={e => { setSelectedProjectId(e.target.value); setFilterCat(''); }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setAdding(true)}
            disabled={!selectedProjectId}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Line Item
          </button>
        </div>
      </div>

      {project ? (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Category summary cards */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(totals) as [EstimateCategory, number][]).map(([cat, val]) => (
              <button
                key={cat}
                onClick={() => setFilterCat(f => f === cat ? '' : cat)}
                className={`bg-white rounded-xl border p-4 text-left transition-all ${filterCat === cat ? 'border-teal-500 ring-2 ring-teal-200' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2 ${CATEGORY_COLORS[cat]}`}>{cat}</span>
                <p className="text-lg font-bold text-slate-900">{fmt(val)}</p>
                <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-1 rounded-full ${CATEGORY_BAR[cat]}`}
                    style={{ width: grandTotal > 0 ? `${(val / grandTotal) * 100}%` : '0%' }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {grandTotal > 0 ? `${Math.round((val / grandTotal) * 100)}%` : '0%'} of total
                </p>
              </button>
            ))}
          </div>

          {/* Items table */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">
                Line Items {filterCat && <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[filterCat]}`}>{filterCat}</span>}
              </h2>
              {filterCat && (
                <button onClick={() => setFilterCat('')} className="text-xs text-teal-600 hover:underline">Clear filter</button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Description</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Cat</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Qty</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Unit</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Rate</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-500">Total</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-slate-400">No items yet. Click "Add Line Item" to start.</td></tr>
                  ) : items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-900">{item.description}</p>
                        {item.notes && <p className="text-xs text-slate-400">{item.notes}</p>}
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category]}`}>{item.category}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-600 hidden sm:table-cell">{item.quantity.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{item.unit}</td>
                      <td className="px-4 py-3.5 text-right text-slate-600 hidden md:table-cell">{fmt(item.rate)}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-slate-900">{fmt(item.total)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditing(item)} className="p-1.5 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {items.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                      <td colSpan={5} className="px-4 py-3 font-semibold text-slate-700">Subtotal ({filterCat || 'all categories'})</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 text-base">
                        {fmt(items.reduce((s, e) => s + e.total, 0))}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Estimate Summary</h3>
              <div className="space-y-2.5">
                {(Object.entries(totals) as [EstimateCategory, number][]).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between text-sm">
                    <span className="text-slate-600 capitalize">{cat}</span>
                    <span className="font-medium">{fmt(val)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-2.5 flex justify-between font-bold">
                  <span className="text-slate-900">Grand Total</span>
                  <span className="text-teal-700">{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>

            {project.budget > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900 mb-3">vs Budget</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Budget</span>
                    <span className="font-medium">{fmt(project.budget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimate</span>
                    <span className="font-medium">{fmt(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <span className="text-slate-500">Variance</span>
                    <span className={`font-bold ${grandTotal > project.budget ? 'text-red-600' : 'text-green-600'}`}>
                      {grandTotal > project.budget ? '+' : ''}{fmt(grandTotal - project.budget)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${grandTotal > project.budget ? 'bg-red-500' : 'bg-teal-500'}`}
                    style={{ width: `${Math.min((grandTotal / project.budget) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {project.budget > 0 ? `${Math.round((grandTotal / project.budget) * 100)}% of budget used` : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          No projects found. Create a project first.
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAdding(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Add Line Item</h2>
              <button onClick={() => setAdding(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <ItemForm initial={EMPTY_ITEM} onSave={handleAdd} onCancel={() => setAdding(false)} />
            </div>
          </div>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Edit Line Item</h2>
              <button onClick={() => setEditing(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <ItemForm
                initial={{ category: editing.category, description: editing.description, quantity: editing.quantity, unit: editing.unit, rate: editing.rate, total: editing.total, notes: editing.notes }}
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
