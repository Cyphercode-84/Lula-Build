'use client';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/lib/store';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-slate-100 text-slate-700',
  bidding: 'bg-amber-100 text-amber-700',
  active: 'bg-teal-100 text-teal-700',
  completed: 'bg-green-100 text-green-700',
  on_hold: 'bg-red-100 text-red-700',
};

const BID_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(n);
}

export default function DashboardPage() {
  const { state } = useStore();

  const activeProjects = state.projects.filter(p => p.status === 'active').length;
  const totalBidValue = state.bids.reduce((s, b) => s + b.amount, 0);
  const wonBids = state.bids.filter(b => b.status === 'won').length;
  const winRate = state.bids.length ? Math.round((wonBids / state.bids.length) * 100) : 0;
  const totalEstValue = state.estimateItems.reduce((s, e) => s + e.total, 0);

  const recentProjects = [...state.projects]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const recentBids = [...state.bids]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const statusCounts = state.projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppLayout>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Projects', value: activeProjects, sub: `${state.projects.length} total`, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Total Bids', value: state.bids.length, sub: `${wonBids} won`, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Win Rate', value: `${winRate}%`, sub: `${wonBids} of ${state.bids.length} bids`, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Est. Value', value: fmt(totalEstValue), sub: 'across all projects', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
              <span className={`text-xs font-semibold ${card.color}`}>{card.label.toUpperCase()}</span>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Projects</h2>
            <Link href="/projects" className="text-xs text-teal-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentProjects.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.client} &middot; {p.location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-800">{fmt(p.budget)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          {/* Project Status Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Projects by Status</h2>
            <div className="space-y-2.5">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status]} w-20 text-center`}>
                    {status.replace('_', ' ')}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full"
                      style={{ width: `${(count / state.projects.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 w-4">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bids */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Bids</h2>
              <Link href="/bids" className="text-xs text-teal-600 hover:underline font-medium">View all</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentBids.map(b => (
                <div key={b.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-slate-900 truncate">{b.vendorName}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BID_COLORS[b.status]}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">{fmt(b.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
