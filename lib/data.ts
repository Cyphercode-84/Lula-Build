import { AppState } from './types';

export const initialData: AppState = {
  projects: [
    {
      id: 'proj-001',
      name: 'Harbor Bridge Rehabilitation',
      client: 'City Infrastructure Dept',
      description: 'Full rehabilitation of the main harbor bridge including structural repairs and surface treatment.',
      status: 'active',
      budget: 4500000,
      startDate: '2025-01-15',
      endDate: '2025-12-30',
      location: 'Cape Town, SA',
      createdAt: '2024-11-20',
    },
    {
      id: 'proj-002',
      name: 'Westside Shopping Centre',
      client: 'Westside Properties Ltd',
      description: 'Construction of new 50,000 sqm retail and commercial complex.',
      status: 'bidding',
      budget: 12000000,
      startDate: '2025-03-01',
      endDate: '2026-06-30',
      location: 'Johannesburg, SA',
      createdAt: '2024-12-05',
    },
    {
      id: 'proj-003',
      name: 'Residential Estate Phase 2',
      client: 'Greenway Homes',
      description: 'Phase 2 of residential estate development - 120 units.',
      status: 'planning',
      budget: 8500000,
      startDate: '2025-06-01',
      endDate: '2026-12-31',
      location: 'Pretoria, SA',
      createdAt: '2025-01-10',
    },
    {
      id: 'proj-004',
      name: 'Industrial Warehouse Complex',
      client: 'LogiTech SA',
      description: 'Construction of 3-unit industrial warehouse complex with admin block.',
      status: 'completed',
      budget: 3200000,
      startDate: '2024-03-01',
      endDate: '2024-11-30',
      location: 'Durban, SA',
      createdAt: '2024-01-15',
    },
  ],
  estimateItems: [
    { id: 'est-001', projectId: 'proj-001', category: 'labor', description: 'Structural engineers (team of 4)', quantity: 240, unit: 'days', rate: 850, total: 204000, notes: '' },
    { id: 'est-002', projectId: 'proj-001', category: 'equipment', description: 'Crane hire (50t)', quantity: 120, unit: 'days', rate: 4500, total: 540000, notes: 'Including operator' },
    { id: 'est-003', projectId: 'proj-001', category: 'materials', description: 'Structural steel (grade 350W)', quantity: 85, unit: 'tons', rate: 18500, total: 1572500, notes: '' },
    { id: 'est-004', projectId: 'proj-001', category: 'subcontracts', description: 'Waterproofing specialist', quantity: 1, unit: 'lump sum', rate: 380000, total: 380000, notes: '' },
    { id: 'est-005', projectId: 'proj-002', category: 'labor', description: 'Site labor force (20 workers)', quantity: 365, unit: 'days', rate: 4200, total: 1533000, notes: '' },
    { id: 'est-006', projectId: 'proj-002', category: 'materials', description: 'Concrete (30MPa)', quantity: 2400, unit: 'm³', rate: 1850, total: 4440000, notes: '' },
    { id: 'est-007', projectId: 'proj-002', category: 'subcontracts', description: 'Electrical installation', quantity: 1, unit: 'lump sum', rate: 1200000, total: 1200000, notes: '' },
    { id: 'est-008', projectId: 'proj-003', category: 'labor', description: 'Construction crew (15 workers)', quantity: 400, unit: 'days', rate: 3200, total: 1280000, notes: '' },
    { id: 'est-009', projectId: 'proj-003', category: 'materials', description: 'Bricks and mortar', quantity: 450000, unit: 'units', rate: 2.8, total: 1260000, notes: '' },
  ],
  bids: [
    { id: 'bid-001', projectId: 'proj-001', vendorId: 'vend-001', vendorName: 'SteelTech SA', amount: 1650000, status: 'submitted', dueDate: '2025-02-15', submittedDate: '2025-01-28', notes: 'Includes delivery', createdAt: '2025-01-10' },
    { id: 'bid-002', projectId: 'proj-001', vendorId: 'vend-002', vendorName: 'Cape Cranes Ltd', amount: 498000, status: 'won', dueDate: '2025-01-31', submittedDate: '2025-01-20', notes: 'Best price - awarded', createdAt: '2025-01-05' },
    { id: 'bid-003', projectId: 'proj-002', vendorId: 'vend-003', vendorName: 'PowerPro Electrical', amount: 1150000, status: 'under_review', dueDate: '2025-03-10', submittedDate: '', notes: '', createdAt: '2025-01-25' },
    { id: 'bid-004', projectId: 'proj-002', vendorId: 'vend-004', vendorName: 'Bolt Electrical', amount: 1280000, status: 'under_review', dueDate: '2025-03-10', submittedDate: '', notes: 'Includes maintenance contract', createdAt: '2025-01-26' },
    { id: 'bid-005', projectId: 'proj-003', vendorId: 'vend-005', vendorName: 'Greenway Concrete', amount: 890000, status: 'draft', dueDate: '2025-04-01', submittedDate: '', notes: '', createdAt: '2025-02-01' },
  ],
  vendors: [
    { id: 'vend-001', name: 'SteelTech SA', type: 'supplier', contactName: 'James Morrison', email: 'jmorrison@steeltech.co.za', phone: '+27 21 555 0101', address: '15 Industrial Way, Cape Town', rating: 4, specialties: ['Structural Steel', 'Rebar', 'Steel Fabrication'], createdAt: '2023-05-10' },
    { id: 'vend-002', name: 'Cape Cranes Ltd', type: 'subcontractor', contactName: 'Sarah van den Berg', email: 's.vandenberg@capecranes.co.za', phone: '+27 21 555 0202', address: '78 Harbour Road, Cape Town', rating: 5, specialties: ['Crane Hire', 'Lifting Solutions', 'Heavy Equipment'], createdAt: '2023-03-15' },
    { id: 'vend-003', name: 'PowerPro Electrical', type: 'subcontractor', contactName: 'Thabo Nkosi', email: 'thabo@powerpro.co.za', phone: '+27 11 555 0303', address: '22 Commerce St, Johannesburg', rating: 4, specialties: ['Industrial Electrical', 'LV/MV Systems', 'Automation'], createdAt: '2023-08-22' },
    { id: 'vend-004', name: 'Bolt Electrical', type: 'subcontractor', contactName: 'Michael Chen', email: 'm.chen@boltelectrical.co.za', phone: '+27 11 555 0404', address: '56 Electron Ave, Johannesburg', rating: 3, specialties: ['Commercial Electrical', 'Lighting', 'BMS'], createdAt: '2023-11-05' },
    { id: 'vend-005', name: 'Greenway Concrete', type: 'supplier', contactName: 'Patricia Dlamini', email: 'p.dlamini@greenwayconcrete.co.za', phone: '+27 12 555 0505', address: '100 Quarry Road, Pretoria', rating: 4, specialties: ['Ready-mix Concrete', 'Pre-cast Elements', 'Block Paving'], createdAt: '2024-01-20' },
    { id: 'vend-006', name: 'Foundation Experts', type: 'subcontractor', contactName: 'Ravi Pillay', email: 'ravi@foundationexperts.co.za', phone: '+27 31 555 0606', address: '34 Marine Drive, Durban', rating: 5, specialties: ['Piling', 'Ground Engineering', 'Geotechnical'], createdAt: '2022-09-12' },
  ],
};

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
