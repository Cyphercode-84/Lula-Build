'use client';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Project, EstimateItem, Bid, Vendor } from './types';
import { initialData } from './data';

type Action =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_ESTIMATE_ITEM'; payload: EstimateItem }
  | { type: 'UPDATE_ESTIMATE_ITEM'; payload: EstimateItem }
  | { type: 'DELETE_ESTIMATE_ITEM'; payload: string }
  | { type: 'ADD_BID'; payload: Bid }
  | { type: 'UPDATE_BID'; payload: Bid }
  | { type: 'DELETE_BID'; payload: string }
  | { type: 'ADD_VENDOR'; payload: Vendor }
  | { type: 'UPDATE_VENDOR'; payload: Vendor }
  | { type: 'DELETE_VENDOR'; payload: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE': return action.payload;
    case 'ADD_PROJECT': return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT': return { ...state, projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PROJECT': return { ...state, projects: state.projects.filter(p => p.id !== action.payload) };
    case 'ADD_ESTIMATE_ITEM': return { ...state, estimateItems: [...state.estimateItems, action.payload] };
    case 'UPDATE_ESTIMATE_ITEM': return { ...state, estimateItems: state.estimateItems.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_ESTIMATE_ITEM': return { ...state, estimateItems: state.estimateItems.filter(e => e.id !== action.payload) };
    case 'ADD_BID': return { ...state, bids: [...state.bids, action.payload] };
    case 'UPDATE_BID': return { ...state, bids: state.bids.map(b => b.id === action.payload.id ? action.payload : b) };
    case 'DELETE_BID': return { ...state, bids: state.bids.filter(b => b.id !== action.payload) };
    case 'ADD_VENDOR': return { ...state, vendors: [...state.vendors, action.payload] };
    case 'UPDATE_VENDOR': return { ...state, vendors: state.vendors.map(v => v.id === action.payload.id ? action.payload : v) };
    case 'DELETE_VENDOR': return { ...state, vendors: state.vendors.filter(v => v.id !== action.payload) };
    default: return state;
  }
}

const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

const STORAGE_KEY = 'lulabuild_state';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialData);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(saved) });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
