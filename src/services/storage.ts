import { Society, Member, Contribution, Loan, LoanRepayment } from '../types';
import {
  SEED_SOCIETY,
  SEED_MEMBERS,
  SEED_CONTRIBUTIONS,
  SEED_LOANS,
  SEED_REPAYMENTS,
} from '../data/seedData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'qarz_e_hasan_society_store_v1';

export interface AppStoreData {
  society: Society;
  members: Member[];
  contributions: Contribution[];
  loans: Loan[];
  repayments: LoanRepayment[];
}

export const storageService = {
  /**
   * Load current store data
   */
  loadData: async (): Promise<AppStoreData> => {
    // 1. If Supabase configured, attempt remote fetch
    if (isSupabaseConfigured() && supabase) {
      try {
        const [socRes, memRes, contRes, loanRes, repRes] = await Promise.all([
          supabase.from('societies').select('*').limit(1).maybeSingle(),
          supabase.from('members').select('*').order('member_no'),
          supabase.from('contributions').select('*').order('payment_date', { ascending: false }),
          supabase.from('loans').select('*').order('created_at', { ascending: false }),
          supabase.from('loan_repayments').select('*').order('repayment_date', { ascending: false }),
        ]);

        if (socRes.data && memRes.data) {
          return {
            society: socRes.data as Society,
            members: (memRes.data || []) as Member[],
            contributions: (contRes.data || []) as Contribution[],
            loans: (loanRes.data || []) as Loan[],
            repayments: (repRes.data || []) as LoanRepayment[],
          };
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }

    // 2. Browser Local Storage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.society && Array.isArray(parsed.members)) {
          if (parsed.society.name && parsed.society.name.toLowerCase().includes('inquilab')) {
            parsed.society.name = parsed.society.name.replace(/inquilab\s*/gi, '').trim() || 'Qarz-e-Hasan Welfare Society';
            parsed.society.upi_id = (parsed.society.upi_id || '').replace(/inquilab\.?/gi, '');
            storageService.saveData(parsed);
          }
          return parsed as AppStoreData;
        }
      }
    } catch (err) {
      console.warn('Error reading local storage:', err);
    }

    // 3. Fallback to rich seed data
    const initialData: AppStoreData = {
      society: SEED_SOCIETY,
      members: SEED_MEMBERS,
      contributions: SEED_CONTRIBUTIONS,
      loans: SEED_LOANS,
      repayments: SEED_REPAYMENTS,
    };
    storageService.saveData(initialData);
    return initialData;
  },

  /**
   * Save store data
   */
  saveData: (data: AppStoreData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save to local storage:', err);
    }
  },

  /**
   * Reset store to initial sample data
   */
  resetToSampleData: (): AppStoreData => {
    const fresh: AppStoreData = {
      society: SEED_SOCIETY,
      members: SEED_MEMBERS,
      contributions: SEED_CONTRIBUTIONS,
      loans: SEED_LOANS,
      repayments: SEED_REPAYMENTS,
    };
    storageService.saveData(fresh);
    return fresh;
  },
};
