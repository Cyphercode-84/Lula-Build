'use client';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/lib/store';
import { EstimateCategory, BidStatus } from '@/lib/types';

const CATEGORY_COLORS: Record<EstimateCategory, string> = {
  labor: 'bg-blue-500',
  equipment: 'bg-amber-500',
  materials: 'bg-green-500',
  subcontracts: 'bg-purple-500',
};

const BID_COLORS: Record<BidStatus, string> = {
  draft: 'bg-slate-300',
  submitted: 'bg-blue-500',
  under_review: 'bg-amber-500',
  won: 'bg-green-500',
  lost: 'bg-red-500',
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(n);
}

function HorizBar({ value, max, color, label, sub }: { value: number; max: number; color: string; label: string; sub?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-sm text-slate-600 truncate flex-shrink-0">{label}</div>
      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
        <div className={`h-3 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-slate-900">{fmt(value)}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { state } = useStore();

  // Cost by category
  const catTotals = (['labor','equipment','materials','subcontracts'] as EstimateCategory[]).map(cat => ({
    cat,
    value: state.estimateItems.filter(e => e.category === cat).reduce((s, e) => s + e.total, 0),
  }));
  const maxCat = Math.max(...catTotals.map(c => c.value), 1);
  const grandTotal = catTotals.reduce((s, c) => s + c.value, 0);

  // Cost by project
  const projectCosts = state.projects.map(p => ({
    project: p,
    cost: state.estimateItems.filter(e => e.projectId === p.id).reduce((s, e) => s + e.total, 0),
    itemCount: state.estimateItems.filter(e => e.projectId === p.id).length,
  })).sort((a, b) => b.cost - a.cost);
  const maxProjectCost = Math.max(...projectCosts.map(p => p.cost), 1);

  // Bid stats
  const bidStats = (['draft','submitted','under_review','won','lost'] as BidStatus[]).map(status => ({
    status,
    count: state.bids.filter(b => b.status === status).length,
    value: state.bids.filter(b => b.status === status).reduce((s, b) => s + b.amount, 0),
  }));
  const maxBidCount = Math.max(...bidStats.map(b => b.count), 1);

  // Top vendors by bid value
  const vendorBidMap = state.vendors.map(v => ({
    vendor: v,
    totalBid: state.bids.filter(b => b.vendorId === v.id).reduce((s, b) => s + b.amount, 0),
    bidCount: state.bids.filter(b => b.vendorId === v.id).length,
    wonBids: state.bids.filter(b => b.vendorId === v.id && b.status === 'won').length,
  })).filter(v => v.bidCount > 0).sort((a, b) => b.totalBid - a.totalBid);
  const maxVendorBid = Math.max(...vendorBidMap.map(v => v.totalBid), 1);

  // Budget utilisation
  const budgetUtil = state.projects.map(p => {
    const est = state.estimateItems.filter(e => e.projectId === p.id).reduce((s, e) => s + e.total, 0);
    return { project: p, est, pct: p.budget > 0 ? Math.round((est / p.budget) * 100) : 0 };
  }).filter(p => p.project.budget > 0).sort((a, b) => b.pct - a.pct);

  const wonRate = state.bids.length ? Math.round((state.bids.filter(b => b.status === 'won').length / state.bids.length) * 100) : 0;
  const totalBidValue = state.bids.reduce((s, b) => s + b.amount, 0);

  return (
    <AppLayout>
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Projects', value: state.projects.length },
          { label: 'Total Estimate Value', value: fmt(grandTotal) },
          { label: 'Total Bid Value', value: fmt(totalBidValue) },
          { label: 'Bid Win Rate', value: `${wonRate}%` },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{kpi.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cost by Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Cost Breakdown by Category</h2>
          <p className="text-xs text-slate-400 mb-4">All projects combined</p>
          <div className="space-y-3 mb-4">
            {catTotals.map(({ cat, value }) => (
              <HorizBar
                key={cat}
                label={cat}
                value={value}
                max={maxCat}
                color={CATEGORY_COLORS[cat]}
                sub={grandTotal > 0 ? `${Math.round((value / grandTotal) * 100)}%` : '0%'}
              />
            ))}
          </div>
          <div className="border-t border-slate-100 pt-3 flex justify-between font-semibold">
            <span className="text-slate-700">Grand Total</span>
            <span className="text-teal-700">{fmt(grandTotal)}</span>
          </div>
        </div>

        {/* Cost by Project */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Cost by Project</h2>
          <p className="text-xs text-slate-400 mb-4">Estimated total per project</p>
          <div className="space-y-3">
            {projectCosts.map(({ project, cost, itemCount }) => (
              <HorizBar
                key={project.id}
                label={project.name}
                value={cost}
                max={maxProjectCost}
                color="bg-teal-500"
                sub={`${itemCount} items`}
              />
            ))}
          </div>
        </div>

        {/* Bid Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Bid Pipeline</h2>
          <p className="text-xs text-slate-400 mb-4">Bids by status</p>
          <div className="space-y-3">
            {bidStats.filter(b => b.count > 0).map(({ status, count, value }) => (
              <div key={status} className="flex items-center gap-3">
                <div className="w-28 text-sm text-slate-600 capitalize flex-shrink-0">{status.replace('_', ' ')}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className={`h-3 rounded-full ${BID_COLORS[status]} transition-all`} style={{ width: `${(count / maxBidCount) * 100}%` }} />
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-900">{count}</p>
                  <p className="text-xs text-slate-400">{fmt(value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Vendors */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Top Vendors by Bid Value</h2>
          <p className="text-xs text-slate-400 mb-4">Vendors with active bids</p>
          {vendorBidMap.length === 0 ? (
            <p className="text-slate-400 text-sm">No bids on record</p>
          ) : (
            <div className="space-y-3">
              {vendorBidMap.map(({ vendor, totalBid, bidCount, wonBids }) => (
                <HorizBar
                  key={vendor.id}
                  label={vendor.name}
                  value={totalBid}
                  max={maxVendorBid}
                  color="bg-slate-500"
                  sub={`${wonBids}/${bidCount} won`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Budget utilisation table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Budget Utilisation</h2>
            <p className="text-xs text-slate-400 mt-0.5">Estimate vs approved budget per project</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Project</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 hidden md:table-cell">Client</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Budget</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Estimate</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Utilisation</th>
                <th className="px-5 py-3 hidden lg:table-cell" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgetUtil.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No data available</td></tr>
              ) : budgetUtil.map(({ project, est, pct }) => (
                <tr key={project.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{project.name}</td>
                  <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">{project.client}</td>
                  <td className="px-5 py-3.5 text-right text-slate-700">{fmt(project.budget)}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-slate-900">{fmt(est)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`font-bold ${pct > 100 ? 'text-red-600' : pct > 80 ? 'text-amber-600' : 'text-green-600'}`}>
                      {pct}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
