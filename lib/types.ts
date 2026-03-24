export type ProjectStatus = 'planning' | 'bidding' | 'active' | 'completed' | 'on_hold';
export type BidStatus = 'draft' | 'submitted' | 'under_review' | 'won' | 'lost';
export type VendorType = 'subcontractor' | 'supplier' | 'consultant';
export type EstimateCategory = 'labor' | 'equipment' | 'materials' | 'subcontracts';

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  status: ProjectStatus;
  budget: number;
  startDate: string;
  endDate: string;
  location: string;
  createdAt: string;
}

export interface EstimateItem {
  id: string;
  projectId: string;
  category: EstimateCategory;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
  notes: string;
}

export interface Bid {
  id: string;
  projectId: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  status: BidStatus;
  dueDate: string;
  submittedDate: string;
  notes: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: VendorType;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  specialties: string[];
  createdAt: string;
}

export interface AppState {
  projects: Project[];
  estimateItems: EstimateItem[];
  bids: Bid[];
  vendors: Vendor[];
}
