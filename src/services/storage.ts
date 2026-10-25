import { Society, Member, Contribution, Loan, LoanRepayment, MonthlyLedger, AuthUser } from '../types';
import {
  SEED_SOCIETY,
  SEED_MEMBERS,
  SEED_CONTRIBUTIONS,
  SEED_LOANS,
  SEED_REPAYMENTS,
  SEED_OCTOBER_LEDGER,
} from '../data/seedData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'albadr_society_store_v2';
const AUTH_KEY = 'albadr_current_auth_user';

export interface AppStoreData {
  society: Society;
  members: Member[];
  contributions: Contribution[];
  loans: Loan[];
  repayments: LoanRepayment[];
  ledgers: MonthlyLedger[];
  adminPassword: string;
}

export const storageService = {
  /**
   * Load current store data
   */
  loadData: async (): Promise<AppStoreData> => {
    // 1. If Supabase is configured, attempt remote fetch
    if (isSupabaseConfigured() && supabase) {
      try {
        const [socRes, memRes, ledRes, authRes, loanRes] = await Promise.all([
          supabase.from('society_profile').select('*').limit(1).maybeSingle(),
          supabase.from('society_members').select('*').order('account_no'),
          supabase.from('monthly_ledgers').select('*, ledger_entries(*)').order('period_year', { ascending: false }),
          supabase.from('app_auth_users').select('*').eq('role', 'admin').limit(1).maybeSingle(),
          supabase.from('society_loans').select('*'),
        ]);

        if (socRes.data && memRes.data && memRes.data.length > 0) {
          const members: Member[] = memRes.data.map((m: any) => ({
            id: m.id || `mem-${m.account_no}`,
            society_id: 'soc-albadr-01',
            account_no: m.account_no,
            member_no: String(m.account_no),
            name: m.name_mr || m.name_en,
            name_mr: m.name_mr,
            name_en: m.name_en,
            phone: m.phone || `98000000${m.account_no < 10 ? '0' + m.account_no : m.account_no}`,
            password: m.password || '1234',
            monthly_share: Number(m.monthly_share) || 300,
            cumulative_shares: Number(m.cumulative_shares) || 0,
            join_date: '2024-01-01',
            status: m.status || 'active',
            address: 'सोलापूर (Solapur)',
            notes: `अकौंट नं. ${m.account_no}`,
            created_at: m.created_at || new Date().toISOString(),
            updated_at: m.updated_at || new Date().toISOString(),
          }));

          const remoteLedgers: MonthlyLedger[] = (ledRes.data || []).map((l: any) => ({
            id: l.id,
            period_year: l.period_year,
            period_month: l.period_month,
            period_label: l.period_label || `${l.period_month}-${l.period_year}`,
            previous_balance: Number(l.previous_balance) || 0,
            total_shares_collected: Number(l.total_shares_collected) || 0,
            total_installments_collected: Number(l.total_installments_collected) || 0,
            total_gross_collected: Number(l.total_gross_collected) || 0,
            total_cash_available: Number(l.total_cash_available) || 0,
            loan_disbursed_account_no: l.loan_disbursed_account_no,
            loan_disbursed_amount: Number(l.loan_disbursed_amount) || 0,
            closing_balance: Number(l.closing_balance) || 0,
            is_finalized: Boolean(l.is_finalized),
            entries: (l.ledger_entries || []).map((e: any) => ({
              account_no: e.account_no,
              name_mr: e.name_mr,
              name_en: e.name_en,
              monthly_share: Number(e.monthly_share) || 300,
              cumulative_shares: Number(e.cumulative_shares) || 0,
              loan_approved: Number(e.loan_approved) || 0,
              loan_installment: Number(e.loan_installment) || 0,
              loan_balance_remaining: Number(e.loan_balance_remaining) || 0,
              fine: Number(e.fine) || 0,
              total_amount: Number(e.total_amount) || 300,
              is_paid: Boolean(e.is_paid),
            })),
          }));

          const remoteSociety: Society = {
            id: socRes.data.id || 'soc-albadr-01',
            name: socRes.data.name_en || 'Al-Badr Bilasudi Co-Op Society, Solapur',
            name_en: socRes.data.name_en || 'Al-Badr Bilasudi Co-Op Society, Solapur',
            name_mr: (socRes.data.name_mr || 'अल-बदर बिलासुदी को.ऑप. सोसायटी, सोलापूर.').replace(/बिलासौदी/g, 'बिलासुदी'),
            upi_id: socRes.data.upi_id || 'albadr.society@okaxis',
            currency: 'INR',
            opening_balance: Number(socRes.data.cash_balance) || 26820,
            contact_phone: socRes.data.contact_phone || '9800000000',
            address: (socRes.data.address || 'Bilasudi, Solapur, Maharashtra').replace(/बिलासौदी/g, 'बिलासुदी'),
            default_reminder_lang: 'en',
            created_at: socRes.data.created_at || new Date().toISOString(),
            updated_at: socRes.data.updated_at || new Date().toISOString(),
          };

          // Dynamically map loans from society_loans if available
          const remoteLoans: Loan[] = (loanRes.data && loanRes.data.length > 0)
            ? loanRes.data.map((l: any, idx: number) => {
                const mem = members.find((m) => m.account_no === l.account_no);
                return {
                  id: l.id || `loan-${l.account_no}`,
                  society_id: 'soc-albadr-01',
                  member_id: mem?.id || `mem-${l.account_no}`,
                  loan_no: `L-2024-${String(idx + 1).padStart(3, '0')}`,
                  principal_amount: Number(l.principal_amount),
                  remaining_balance: Number(l.remaining_balance),
                  monthly_installment: Number(l.monthly_installment),
                  duration_months: Math.ceil(Number(l.principal_amount) / (Number(l.monthly_installment) || 4000)),
                  disbursed_date: l.disbursed_period || '2024-10-01',
                  purpose: 'Interest-free member loan',
                  status: (l.status || (Number(l.remaining_balance) > 0 ? 'active' : 'closed')) as any,
                  created_at: l.created_at || new Date().toISOString(),
                  updated_at: l.updated_at || new Date().toISOString(),
                };
              })
            : SEED_LOANS;

          // Dynamically synthesize contributions and repayments from remoteLedgers
          const remoteContributions: Contribution[] = [];
          const remoteRepayments: LoanRepayment[] = [];

          if (remoteLedgers.length > 0) {
            remoteLedgers.forEach((ledger) => {
              (ledger.entries || []).forEach((entry) => {
                const mem = members.find((m) => m.account_no === entry.account_no);
                if (!mem) return;
                if (entry.is_paid && entry.monthly_share > 0) {
                  remoteContributions.push({
                    id: `c-${ledger.period_year}-${ledger.period_month}-${entry.account_no}`,
                    society_id: 'soc-albadr-01',
                    member_id: mem.id,
                    amount: entry.monthly_share,
                    period_month: ledger.period_month,
                    period_year: ledger.period_year,
                    payment_date: `${ledger.period_year}-${String(ledger.period_month).padStart(2, '0')}-05`,
                    payment_method: 'cash',
                    created_at: new Date().toISOString(),
                  });
                }
                if (entry.is_paid && entry.loan_installment > 0) {
                  const loan = remoteLoans.find((l) => l.member_id === mem.id);
                  remoteRepayments.push({
                    id: `r-${ledger.period_year}-${ledger.period_month}-${entry.account_no}`,
                    society_id: 'soc-albadr-01',
                    loan_id: loan?.id || `loan-${entry.account_no}`,
                    member_id: mem.id,
                    amount: entry.loan_installment,
                    repayment_date: `${ledger.period_year}-${String(ledger.period_month).padStart(2, '0')}-05`,
                    payment_method: 'cash',
                    created_at: new Date().toISOString(),
                  });
                }
              });
            });
          }

          const store: AppStoreData = {
            society: remoteSociety,
            members: members,
            contributions: remoteContributions.length > 0 ? remoteContributions : SEED_CONTRIBUTIONS,
            loans: remoteLoans,
            repayments: remoteRepayments.length > 0 ? remoteRepayments : SEED_REPAYMENTS,
            ledgers: remoteLedgers.length > 0 ? remoteLedgers : [SEED_OCTOBER_LEDGER],
            adminPassword: authRes.data?.password || 'admin321',
          };
          storageService.saveData(store);
          return store;
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
        if (parsed.society && Array.isArray(parsed.members) && parsed.members.length >= 40) {
          if (parsed.society.name) {
            parsed.society.name = parsed.society.name.replace(/बिलासौदी/g, 'बिलासुदी').replace(/Bilasoudi/gi, 'Bilasudi');
          }
          if (parsed.society.name_mr) {
            parsed.society.name_mr = parsed.society.name_mr.replace(/बिलासौदी/g, 'बिलासुदी').replace(/Bilasoudi/gi, 'Bilasudi');
          } else {
            parsed.society.name_mr = 'अल-बदर बिलासुदी को.ऑप. सोसायटी, सोलापूर.';
          }
          if (parsed.society.name_en) {
            parsed.society.name_en = parsed.society.name_en.replace(/Bilasoudi/gi, 'Bilasudi');
          } else {
            parsed.society.name_en = 'Al-Badr Bilasudi Co-Op Society, Solapur';
          }
          if (parsed.society.address) {
            parsed.society.address = parsed.society.address.replace(/बिलासौदी/g, 'बिलासुदी').replace(/Bilasoudi/gi, 'Bilasudi');
          }
          return {
            society: parsed.society,
            members: parsed.members,
            contributions: parsed.contributions || SEED_CONTRIBUTIONS,
            loans: parsed.loans || SEED_LOANS,
            repayments: parsed.repayments || SEED_REPAYMENTS,
            ledgers: parsed.ledgers && parsed.ledgers.length > 0 ? parsed.ledgers : [SEED_OCTOBER_LEDGER],
            adminPassword: parsed.adminPassword || 'admin321',
          };
        }
      }
    } catch (err) {
      console.warn('Error reading local storage:', err);
    }

    // 3. Fallback to rich seed data (with 40 members and October ledger)
    const initialData: AppStoreData = {
      society: SEED_SOCIETY,
      members: SEED_MEMBERS,
      contributions: SEED_CONTRIBUTIONS,
      loans: SEED_LOANS,
      repayments: SEED_REPAYMENTS,
      ledgers: [SEED_OCTOBER_LEDGER],
      adminPassword: 'admin321',
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
   * Get logged in user from localStorage
   */
  getCurrentUser: (): AuthUser | null => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Set logged in user
   */
  setCurrentUser: (user: AuthUser | null) => {
    try {
      if (user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch (err) {
      console.error('Failed to set current user:', err);
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
      ledgers: [SEED_OCTOBER_LEDGER],
      adminPassword: 'admin321',
    };
    storageService.saveData(fresh);
    return fresh;
  },

  /**
   * Remote Supabase Sync Helpers (Graceful fallback)
   */
  syncMember: async (member: Member) => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      await supabase.from('society_members').upsert({
        id: member.id.startsWith('mem-') ? undefined : member.id,
        account_no: member.account_no,
        name_mr: member.name_mr || member.name,
        name_en: member.name_en || member.name,
        phone: member.phone,
        password: member.password || '1234',
        monthly_share: member.monthly_share,
        cumulative_shares: member.cumulative_shares || 0,
        status: member.status === 'suspended' ? 'inactive' : member.status,
      }, { onConflict: 'account_no' });

      // Also upsert to app_auth_users
      await supabase.from('app_auth_users').upsert({
        role: 'member',
        account_no: member.account_no,
        phone: member.phone,
        password: member.password || '1234',
        full_name: member.name,
        is_active: member.status === 'active',
      }, { onConflict: 'phone' });
    } catch (err) {
      console.warn('Supabase syncMember failed:', err);
    }
  },

  deleteMember: async (_id: string, accountNo: number, phone?: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      await supabase.from('society_members').delete().eq('account_no', accountNo);
      if (phone) {
        await supabase.from('app_auth_users').delete().eq('phone', phone);
      }
    } catch (err) {
      console.warn('Supabase deleteMember failed:', err);
    }
  },

  syncAdminPassword: async (password: string, phone: string = '9800000000') => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      await supabase.from('app_auth_users').upsert({
        role: 'admin',
        account_no: 0,
        phone: phone,
        password: password,
        full_name: 'सेक्रेटरी / ॲडमिन',
      }, { onConflict: 'phone' });
    } catch (err) {
      console.warn('Supabase syncAdminPassword failed:', err);
    }
  },

  syncMemberPassword: async (accountNo: number, password: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      await supabase.from('society_members').update({ password }).eq('account_no', accountNo);
      await supabase.from('app_auth_users').update({ password }).eq('account_no', accountNo);
    } catch (err) {
      console.warn('Supabase syncMemberPassword failed:', err);
    }
  },

  syncSocietyProfile: async (society: Partial<Society>) => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      await supabase.from('society_profile').update({
        name_mr: society.name,
        upi_id: society.upi_id,
        contact_phone: society.contact_phone,
        address: society.address,
        cash_balance: society.opening_balance,
        updated_at: new Date().toISOString(),
      }).neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (err) {
      console.warn('Supabase syncSocietyProfile failed:', err);
    }
  },

  syncLedger: async (ledger: MonthlyLedger) => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { data: ledgerRow, error } = await supabase.from('monthly_ledgers').upsert({
        id: ledger.id.startsWith('ledger-') ? undefined : ledger.id,
        period_year: ledger.period_year,
        period_month: ledger.period_month,
        period_label: ledger.period_label,
        previous_balance: ledger.previous_balance,
        total_shares_collected: ledger.total_shares_collected,
        total_installments_collected: ledger.total_installments_collected,
        total_gross_collected: ledger.total_gross_collected,
        total_cash_available: ledger.total_cash_available,
        loan_disbursed_account_no: ledger.loan_disbursed_account_no,
        loan_disbursed_amount: ledger.loan_disbursed_amount,
        closing_balance: ledger.closing_balance,
        is_finalized: ledger.is_finalized,
      }, { onConflict: 'period_year,period_month' }).select().single();

      if (error || !ledgerRow) return;

      const entriesToInsert = ledger.entries.map((e) => ({
        ledger_id: ledgerRow.id,
        account_no: e.account_no,
        name_mr: e.name_mr,
        name_en: e.name_en,
        monthly_share: e.monthly_share,
        cumulative_shares: e.cumulative_shares,
        loan_approved: e.loan_approved,
        loan_installment: e.loan_installment,
        loan_balance_remaining: e.loan_balance_remaining,
        fine: e.fine,
        total_amount: e.total_amount,
        is_paid: e.is_paid,
      }));

      await supabase.from('ledger_entries').upsert(entriesToInsert, { onConflict: 'ledger_id,account_no' });
    } catch (err) {
      console.warn('Supabase syncLedger failed:', err);
    }
  },

  syncPushSubscription: async (sub: { user_identifier: string; endpoint: string; p256dh: string; auth: string; platform: string }) => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      await supabase.from('push_subscriptions').upsert(sub, { onConflict: 'endpoint' });
    } catch (err) {
      console.warn('Supabase syncPushSubscription failed:', err);
    }
  },
};
