import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Society,
  Member,
  Contribution,
  Loan,
  LoanRepayment,
  DefaulterItem,
  PoolMetrics,
  MonthMetrics,
} from '../types';
import { storageService, AppStoreData } from '../services/storage';
import { getCurrentPeriod, getMonthName, WhatsAppMessagePayload, ReminderLanguage } from '../utils/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AppLanguage, TranslationKey, getTranslation } from '../i18n/translations';

interface SocietyContextType {
  society: Society;
  members: Member[];
  contributions: Contribution[];
  loans: Loan[];
  repayments: LoanRepayment[];
  selectedPeriod: { year: number; month: number; monthName: string };
  setSelectedPeriod: (period: { year: number; month: number; monthName: string }) => void;
  activeTab: 'home' | 'members' | 'loans' | 'manage';
  setActiveTab: (tab: 'home' | 'members' | 'loans' | 'manage') => void;
  
  // Computed
  poolMetrics: PoolMetrics;
  monthMetrics: MonthMetrics;
  defaulters: DefaulterItem[];

  // Helpers
  isMemberPaidInPeriod: (memberId: string, year: number, month: number) => boolean;
  getMemberContributionInPeriod: (memberId: string, year: number, month: number) => Contribution | undefined;
  getMemberActiveLoan: (memberId: string) => Loan | undefined;
  getMemberRepayments: (loanId: string) => LoanRepayment[];
  getMemberContributionHistory: (memberId: string) => Contribution[];

  // Mutations
  addMember: (data: Omit<Member, 'id' | 'society_id' | 'created_at' | 'updated_at'>) => Promise<Member>;
  updateMember: (id: string, data: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  logContribution: (data: Omit<Contribution, 'id' | 'society_id' | 'created_at'>) => Promise<Contribution>;
  disburseLoan: (data: Omit<Loan, 'id' | 'society_id' | 'remaining_balance' | 'status' | 'created_at' | 'updated_at'>) => Promise<Loan>;
  logRepayment: (data: Omit<LoanRepayment, 'id' | 'society_id' | 'created_at'>) => Promise<LoanRepayment>;
  updateSociety: (data: Partial<Society>) => Promise<void>;
  resetToSampleData: () => void;

  // Modals & UI Triggers
  createModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;
  createModalDefaultType: 'contribution' | 'loan' | 'repayment' | 'reminder' | null;
  openCreateModal: (type?: 'contribution' | 'loan' | 'repayment' | 'reminder') => void;
  selectedMemberForDetail: Member | null;
  setSelectedMemberForDetail: (member: Member | null) => void;
  qrModalOpen: boolean;
  setQrModalOpen: (open: boolean) => void;
  qrModalAmount?: number;
  qrModalNote?: string;
  openQrModal: (amount?: number, note?: string) => void;
  whatsAppModalOpen: boolean;
  setWhatsAppModalOpen: (open: boolean) => void;
  whatsAppPayload: WhatsAppMessagePayload | null;
  openWhatsAppModal: (payload: WhatsAppMessagePayload) => void;
  isAddMemberModalOpen: boolean;
  setIsAddMemberModalOpen: (open: boolean) => void;
  openAddMemberModal: () => void;
  closeAllModals: () => void;
  navigateToTab: (tab: 'home' | 'members' | 'loans' | 'manage') => void;
  openMemberDetail: (member: Member | null) => void;
  defaultReminderLang: ReminderLanguage;
  setDefaultReminderLang: (lang: ReminderLanguage) => void;
  appLanguage: AppLanguage;
  setAppLanguage: (lang: AppLanguage) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const SocietyContext = createContext<SocietyContextType | undefined>(undefined);

export const SocietyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppStoreData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod());
  const [activeTab, setActiveTab] = useState<'home' | 'members' | 'loans' | 'manage'>('home');

  // App UI language setting (en, hi, mr)
  const [appLanguage, setAppLanguageState] = useState<AppLanguage>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('society_app_language');
      if (stored === 'en' || stored === 'hi' || stored === 'mr') {
        return stored;
      }
    }
    return 'en';
  });

  const setAppLanguage = (lang: AppLanguage) => {
    setAppLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('society_app_language', lang);
    }
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    return getTranslation(appLanguage, key, fallback);
  };

  // Reminder language setting
  const [defaultReminderLang, setDefaultReminderLangState] = useState<ReminderLanguage>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('society_reminder_lang');
      if (stored === 'en' || stored === 'ur' || stored === 'hi' || stored === 'mr') {
        return stored;
      }
    }
    return 'en';
  });

  const setDefaultReminderLang = (lang: ReminderLanguage) => {
    setDefaultReminderLangState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('society_reminder_lang', lang);
    }
    if (data?.society) {
      const updatedSociety = { ...data.society, default_reminder_lang: lang };
      const updatedData = { ...data, society: updatedSociety };
      persist(updatedData);
    }
  };

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalDefaultType, setCreateModalDefaultType] = useState<'contribution' | 'loan' | 'repayment' | 'reminder' | null>(null);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<Member | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalAmount, setQrModalAmount] = useState<number | undefined>(undefined);
  const [qrModalNote, setQrModalNote] = useState<string | undefined>(undefined);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [whatsAppPayload, setWhatsAppPayload] = useState<WhatsAppMessagePayload | null>(null);

  // Initial load
  useEffect(() => {
    storageService.loadData().then(loaded => setData(loaded));
  }, []);

  const persist = (updated: AppStoreData) => {
    setData(updated);
    storageService.saveData(updated);
  };

  const closeAllModals = () => {
    setCreateModalOpen(false);
    setSelectedMemberForDetail(null);
    setIsAddMemberModalOpen(false);
    setQrModalOpen(false);
    setWhatsAppModalOpen(false);
  };

  const navigateToTab = (targetTab: 'home' | 'members' | 'loans' | 'manage') => {
    closeAllModals();
    if (targetTab === activeTab) return;

    if (typeof window !== 'undefined') {
      if (targetTab === 'home') {
        window.history.replaceState({ screen: 'home' }, '', '');
      } else {
        if (activeTab === 'home') {
          window.history.pushState({ screen: targetTab }, '', '');
        } else {
          // Replace state so jumping between secondary tabs doesn't chain history
          window.history.replaceState({ screen: targetTab }, '', '');
        }
      }
    }
    setActiveTab(targetTab);
  };

  const openCreateModal = (type: 'contribution' | 'loan' | 'repayment' | 'reminder' = 'contribution') => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'create', screen: activeTab }, '', '');
    }
    setCreateModalDefaultType(type);
    setCreateModalOpen(true);
  };

  const openQrModal = (amount?: number, note?: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'qr', screen: activeTab }, '', '');
    }
    setQrModalAmount(amount);
    setQrModalNote(note);
    setQrModalOpen(true);
  };

  const openWhatsAppModal = (payload: WhatsAppMessagePayload) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'whatsapp', screen: activeTab }, '', '');
    }
    setWhatsAppPayload(payload);
    setWhatsAppModalOpen(true);
  };

  const openAddMemberModal = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'add-member', screen: activeTab }, '', '');
    }
    setIsAddMemberModalOpen(true);
  };

  const openMemberDetail = (member: Member | null) => {
    if (member && typeof window !== 'undefined') {
      window.history.pushState({ modal: 'member-detail', screen: activeTab }, '', '');
    }
    setSelectedMemberForDetail(member);
  };

  // Hardware Back Button & Browser History Handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Establish root state on load
    if (!window.history.state || !window.history.state.screen) {
      window.history.replaceState({ screen: 'home' }, '', '');
    }

    const handlePopState = () => {
      // 1. If any modal is open: close it and show Home
      const isAnyModalOpen =
        createModalOpen ||
        qrModalOpen ||
        whatsAppModalOpen ||
        Boolean(selectedMemberForDetail) ||
        isAddMemberModalOpen;

      if (isAnyModalOpen) {
        closeAllModals();
        setActiveTab('home');
        window.history.replaceState({ screen: 'home' }, '', '');
        return;
      }

      // 2. If on any non-home tab: go to Home immediately
      if (activeTab !== 'home') {
        setActiveTab('home');
        window.history.replaceState({ screen: 'home' }, '', '');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    activeTab,
    createModalOpen,
    qrModalOpen,
    whatsAppModalOpen,
    selectedMemberForDetail,
    isAddMemberModalOpen,
  ]);

  // Helper getters
  const isMemberPaidInPeriod = (memberId: string, year: number, month: number): boolean => {
    if (!data) return false;
    return data.contributions.some(
      c => c.member_id === memberId && c.period_year === year && c.period_month === month
    );
  };

  const getMemberContributionInPeriod = (memberId: string, year: number, month: number): Contribution | undefined => {
    if (!data) return undefined;
    return data.contributions.find(
      c => c.member_id === memberId && c.period_year === year && c.period_month === month
    );
  };

  const getMemberActiveLoan = (memberId: string): Loan | undefined => {
    if (!data) return undefined;
    return data.loans.find(l => l.member_id === memberId && l.status === 'active');
  };

  const getMemberRepayments = (loanId: string): LoanRepayment[] => {
    if (!data) return [];
    return data.repayments.filter(r => r.loan_id === loanId);
  };

  const getMemberContributionHistory = (memberId: string): Contribution[] => {
    if (!data) return [];
    return data.contributions
      .filter(c => c.member_id === memberId)
      .sort((a, b) => (b.period_year * 100 + b.period_month) - (a.period_year * 100 + a.period_month));
  };

  // Computed Pool Metrics
  const poolMetrics = useMemo<PoolMetrics>(() => {
    if (!data) {
      return {
        openingBalance: 0,
        totalContributions: 0,
        totalDisbursedLoans: 0,
        totalRepayments: 0,
        availablePoolBalance: 0,
        activeLoansCount: 0,
        totalActiveLoanBalance: 0,
        totalMembersCount: 0,
        activeMembersCount: 0,
      };
    }

    const openingBalance = Number(data.society.opening_balance) || 0;
    const totalContributions = data.contributions.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const totalDisbursedLoans = data.loans.reduce((acc, l) => acc + (Number(l.principal_amount) || 0), 0);
    const totalRepayments = data.repayments.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

    const availablePoolBalance = openingBalance + totalContributions + totalRepayments - totalDisbursedLoans;

    const activeLoans = data.loans.filter(l => l.status === 'active');
    const totalActiveLoanBalance = activeLoans.reduce((acc, l) => acc + (Number(l.remaining_balance) || 0), 0);
    const activeMembersCount = data.members.filter(m => m.status === 'active').length;

    return {
      openingBalance,
      totalContributions,
      totalDisbursedLoans,
      totalRepayments,
      availablePoolBalance,
      activeLoansCount: activeLoans.length,
      totalActiveLoanBalance,
      totalMembersCount: data.members.length,
      activeMembersCount,
    };
  }, [data]);

  // Computed Month Metrics
  const monthMetrics = useMemo<MonthMetrics>(() => {
    if (!data) {
      return {
        year: selectedPeriod.year,
        month: selectedPeriod.month,
        monthName: selectedPeriod.monthName,
        expectedCollection: 0,
        collectedAmount: 0,
        pendingAmount: 0,
        paidMembersCount: 0,
        unpaidMembersCount: 0,
        collectionPercentage: 0,
      };
    }

    const activeMembers = data.members.filter(m => m.status === 'active');
    const expectedCollection = activeMembers.reduce((acc, m) => acc + (Number(m.monthly_share) || 0), 0);

    const periodContributions = data.contributions.filter(
      c => c.period_year === selectedPeriod.year && c.period_month === selectedPeriod.month
    );
    const collectedAmount = periodContributions.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const pendingAmount = Math.max(0, expectedCollection - collectedAmount);

    const paidMemberIds = new Set(periodContributions.map(c => c.member_id));
    const paidMembersCount = activeMembers.filter(m => paidMemberIds.has(m.id)).length;
    const unpaidMembersCount = Math.max(0, activeMembers.length - paidMembersCount);
    const collectionPercentage = expectedCollection > 0 ? Math.round((collectedAmount / expectedCollection) * 100) : 100;

    return {
      year: selectedPeriod.year,
      month: selectedPeriod.month,
      monthName: selectedPeriod.monthName,
      expectedCollection,
      collectedAmount,
      pendingAmount,
      paidMembersCount,
      unpaidMembersCount,
      collectionPercentage,
    };
  }, [data, selectedPeriod]);

  // Computed Defaulters list
  const defaulters = useMemo<DefaulterItem[]>(() => {
    if (!data) return [];

    const list: DefaulterItem[] = [];
    const activeMembers = data.members.filter(m => m.status === 'active');
    const currentPeriod = getCurrentPeriod();

    activeMembers.forEach(member => {
      // 1. Check contribution arrears
      let missedMonths = 0;
      let contributionDue = 0;

      // Check current month & last month
      const currentPaid = isMemberPaidInPeriod(member.id, currentPeriod.year, currentPeriod.month);
      if (!currentPaid) {
        missedMonths += 1;
        contributionDue += Number(member.monthly_share) || 0;
      }

      // Check previous month
      const prevMonth = currentPeriod.month === 1 ? 12 : currentPeriod.month - 1;
      const prevYear = currentPeriod.month === 1 ? currentPeriod.year - 1 : currentPeriod.year;
      const prevPaid = isMemberPaidInPeriod(member.id, prevYear, prevMonth);
      if (!prevPaid) {
        missedMonths += 1;
        contributionDue += Number(member.monthly_share) || 0;
      }

      // 2. Check loan repayment arrears
      const activeLoan = getMemberActiveLoan(member.id);
      let loanDue = 0;
      if (activeLoan && activeLoan.remaining_balance > 0) {
        // Has member made a repayment this month?
        const repaymentsThisMonth = data.repayments.filter(r => {
          if (r.loan_id !== activeLoan.id) return false;
          const d = new Date(r.repayment_date);
          return d.getFullYear() === currentPeriod.year && (d.getMonth() + 1) === currentPeriod.month;
        });
        if (repaymentsThisMonth.length === 0) {
          loanDue = Math.min(activeLoan.monthly_installment, activeLoan.remaining_balance);
        }
      }

      if (missedMonths > 0 || loanDue > 0) {
        let type: 'contribution' | 'loan' | 'both' = 'contribution';
        if (missedMonths > 0 && loanDue > 0) type = 'both';
        else if (loanDue > 0) type = 'loan';

        list.push({
          member,
          type,
          contributionMonthsOverdue: missedMonths,
          contributionAmountDue: contributionDue,
          loanOverdueAmount: loanDue,
          totalDue: contributionDue + loanDue,
          activeLoan,
          severityDays: (missedMonths * 30) + (loanDue > 0 ? 15 : 0),
        });
      }
    });

    // Sort by highest total due first
    return list.sort((a, b) => b.totalDue - a.totalDue);
  }, [data]);

  // Mutations
  const addMember = async (memberData: Omit<Member, 'id' | 'society_id' | 'created_at' | 'updated_at'>): Promise<Member> => {
    if (!data) throw new Error('Data not initialized');

    const newMember: Member = {
      ...memberData,
      id: `mem-${Date.now()}`,
      society_id: data.society.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated: AppStoreData = {
      ...data,
      members: [newMember, ...data.members],
    };

    persist(updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('members').insert([newMember]);
      } catch (err) {
        console.error('Supabase member sync error:', err);
      }
    }

    return newMember;
  };

  const updateMember = async (id: string, memberData: Partial<Member>): Promise<void> => {
    if (!data) return;
    const updatedMembers = data.members.map(m =>
      m.id === id ? { ...m, ...memberData, updated_at: new Date().toISOString() } : m
    );
    const updated: AppStoreData = { ...data, members: updatedMembers };
    persist(updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('members').update(memberData).eq('id', id);
      } catch (err) {
        console.error('Supabase update member error:', err);
      }
    }
  };

  const deleteMember = async (id: string): Promise<void> => {
    if (!data) return;
    const updatedMembers = data.members.filter(m => m.id !== id);
    const updated: AppStoreData = { ...data, members: updatedMembers };
    persist(updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('members').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete member error:', err);
      }
    }
  };

  const logContribution = async (contData: Omit<Contribution, 'id' | 'society_id' | 'created_at'>): Promise<Contribution> => {
    if (!data) throw new Error('Data not initialized');

    // Remove any previous contribution for same member and period to prevent duplicate
    const filtered = data.contributions.filter(
      c => !(c.member_id === contData.member_id && c.period_year === contData.period_year && c.period_month === contData.period_month)
    );

    const newContribution: Contribution = {
      ...contData,
      id: `c-${Date.now()}`,
      society_id: data.society.id,
      created_at: new Date().toISOString(),
    };

    const updated: AppStoreData = {
      ...data,
      contributions: [newContribution, ...filtered],
    };
    persist(updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('contributions').upsert([newContribution]);
      } catch (err) {
        console.error('Supabase log contribution error:', err);
      }
    }

    return newContribution;
  };

  const disburseLoan = async (loanData: Omit<Loan, 'id' | 'society_id' | 'remaining_balance' | 'status' | 'created_at' | 'updated_at'>): Promise<Loan> => {
    if (!data) throw new Error('Data not initialized');

    const newLoan: Loan = {
      ...loanData,
      id: `loan-${Date.now()}`,
      society_id: data.society.id,
      remaining_balance: loanData.principal_amount,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated: AppStoreData = {
      ...data,
      loans: [newLoan, ...data.loans],
    };
    persist(updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('loans').insert([newLoan]);
      } catch (err) {
        console.error('Supabase disburse loan error:', err);
      }
    }

    return newLoan;
  };

  const logRepayment = async (repData: Omit<LoanRepayment, 'id' | 'society_id' | 'created_at'>): Promise<LoanRepayment> => {
    if (!data) throw new Error('Data not initialized');

    const newRepayment: LoanRepayment = {
      ...repData,
      id: `rep-${Date.now()}`,
      society_id: data.society.id,
      created_at: new Date().toISOString(),
    };

    // Update remaining balance on loan
    const targetLoan = data.loans.find(l => l.id === repData.loan_id);
    const updatedLoans = data.loans.map(loan => {
      if (loan.id === repData.loan_id) {
        const newBalance = Math.max(0, loan.remaining_balance - repData.amount);
        return {
          ...loan,
          remaining_balance: newBalance,
          status: newBalance <= 0 ? ('closed' as const) : ('active' as const),
          updated_at: new Date().toISOString(),
        };
      }
      return loan;
    });

    const updated: AppStoreData = {
      ...data,
      loans: updatedLoans,
      repayments: [newRepayment, ...data.repayments],
    };
    persist(updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('loan_repayments').insert([newRepayment]);
        if (targetLoan) {
          const newBal = Math.max(0, targetLoan.remaining_balance - repData.amount);
          await supabase.from('loans').update({
            remaining_balance: newBal,
            status: newBal <= 0 ? 'closed' : 'active',
          }).eq('id', targetLoan.id);
        }
      } catch (err) {
        console.error('Supabase repayment error:', err);
      }
    }

    return newRepayment;
  };

  const updateSociety = async (socData: Partial<Society>): Promise<void> => {
    if (!data) return;
    const updatedSociety: Society = {
      ...data.society,
      ...socData,
      updated_at: new Date().toISOString(),
    };
    const updated: AppStoreData = { ...data, society: updatedSociety };
    persist(updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('societies').update(socData).eq('id', updatedSociety.id);
      } catch (err) {
        console.error('Supabase update society error:', err);
      }
    }
  };

  const resetToSampleData = () => {
    const fresh = storageService.resetToSampleData();
    setData(fresh);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-forest-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600 font-medium tracking-wide">Loading Qarz-e-Hasan Society...</p>
        </div>
      </div>
    );
  }

  return (
    <SocietyContext.Provider
      value={{
        society: data.society,
        members: data.members,
        contributions: data.contributions,
        loans: data.loans,
        repayments: data.repayments,
        selectedPeriod,
        setSelectedPeriod,
        activeTab,
        setActiveTab,
        poolMetrics,
        monthMetrics,
        defaulters,
        isMemberPaidInPeriod,
        getMemberContributionInPeriod,
        getMemberActiveLoan,
        getMemberRepayments,
        getMemberContributionHistory,
        addMember,
        updateMember,
        deleteMember,
        logContribution,
        disburseLoan,
        logRepayment,
        updateSociety,
        resetToSampleData,
        createModalOpen,
        setCreateModalOpen,
        createModalDefaultType,
        openCreateModal,
        selectedMemberForDetail,
        setSelectedMemberForDetail,
        qrModalOpen,
        setQrModalOpen,
        qrModalAmount,
        qrModalNote,
        openQrModal,
        whatsAppModalOpen,
        setWhatsAppModalOpen,
        whatsAppPayload,
        openWhatsAppModal,
        isAddMemberModalOpen,
        setIsAddMemberModalOpen,
        openAddMemberModal,
        closeAllModals,
        navigateToTab,
        openMemberDetail,
        defaultReminderLang,
        setDefaultReminderLang,
        appLanguage,
        setAppLanguage,
        t,
      }}
    >
      {children}
    </SocietyContext.Provider>
  );
};

export const useSociety = (): SocietyContextType => {
  const context = useContext(SocietyContext);
  if (!context) {
    throw new Error('useSociety must be used within a SocietyProvider');
  }
  return context;
};
