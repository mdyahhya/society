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
  MonthlyLedger,
  LedgerEntry,
  AuthUser,
} from '../types';
import { storageService, AppStoreData } from '../services/storage';
import { pushNotificationService } from '../services/pushNotification';
import { getCurrentPeriod, getMonthName, WhatsAppMessagePayload, ReminderLanguage } from '../utils/formatters';
import { isSupabaseConfigured } from '../lib/supabase';
import { AppLanguage, TranslationKey, getTranslation } from '../i18n/translations';

export type NavigationTab = 'home' | 'members' | 'register' | 'loans' | 'manage';

interface SocietyContextType {
  society: Society;
  members: Member[];
  contributions: Contribution[];
  loans: Loan[];
  repayments: LoanRepayment[];
  ledgers: MonthlyLedger[];
  activeLedger: MonthlyLedger | null;
  selectedPeriod: { year: number; month: number; monthName: string };
  setSelectedPeriod: (period: { year: number; month: number; monthName: string }) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Auth state
  currentUser: AuthUser | null;
  isAdmin: boolean;
  isMember: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  changeAdminPassword: (newPassword: string) => Promise<void>;
  changeMemberPassword: (accountNo: number, newPassword: string) => Promise<void>;

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

  // Digital Register Operations
  toggleLedgerEntryPaid: (accountNo: number) => Promise<void>;
  updateLedgerEntry: (accountNo: number, updates: Partial<LedgerEntry>) => Promise<void>;
  addNewLedgerMonth: (year: number, month: number, label: string) => Promise<void>;
  updateLedgerDisbursal: (accountNo: number, amount: number) => Promise<void>;

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
  navigateToTab: (tab: NavigationTab) => void;
  openMemberDetail: (member: Member | null) => void;

  // New Modals (Auth, Password, Push, Install)
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isPasswordModalOpen: boolean;
  setIsPasswordModalOpen: (open: boolean) => void;
  passwordModalTarget: { type: 'admin' | 'member'; member?: Member } | null;
  openPasswordModal: (target: { type: 'admin' | 'member'; member?: Member }) => void;
  isBroadcastModalOpen: boolean;
  setIsBroadcastModalOpen: (open: boolean) => void;
  isPwaInstallModalOpen: boolean;
  setIsPwaInstallModalOpen: (open: boolean) => void;

  // Push & PWA
  canInstallPwa: boolean;
  triggerPwaInstall: () => void;
  isPushSubscribed: boolean;
  subscribeToPushNotifications: () => Promise<boolean>;
  sendBroadcastPush: (title: string, body: string, url?: string) => Promise<{ success: boolean; message: string }>;
  sendDueReminders: () => Promise<{ count: number }>;

  // Refresh & Supabase Cloud Sync
  isRefreshing: boolean;
  refreshData: () => Promise<boolean>;

  // Language & i18n
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
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  // Auth User state (default: Admin for convenience or saved user)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    return storageService.getCurrentUser() || {
      role: 'admin',
      account_no: 0,
      phone: '9800000000',
      full_name: 'Secretary / Admin',
      name_mr: 'सेक्रेटरी / ॲडमिन',
      name_en: 'Secretary / Admin',
    };
  });

  const isAdmin = currentUser?.role === 'admin';
  const isMember = currentUser?.role === 'member';

  // App UI language setting (en, hi, mr, ur) - DEFAULT IS ENGLISH
  const [appLanguage, setAppLanguageState] = useState<AppLanguage>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('society_app_language_pref') || localStorage.getItem('society_app_language_v2');
      if (stored === 'en' || stored === 'ur' || stored === 'hi' || stored === 'mr') {
        return stored as AppLanguage;
      }
    }
    return 'en'; // Default to English as requested
  });

  const setAppLanguage = (lang: AppLanguage) => {
    setAppLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('society_app_language_pref', lang);
      localStorage.setItem('society_app_language_v2', lang);
      localStorage.setItem('society_app_language', lang);
    }
  };

  const t = (key: TranslationKey | string, fallback?: string): string => {
    return getTranslation(appLanguage, key as any, fallback);
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

  // New Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordModalTarget, setPasswordModalTarget] = useState<{ type: 'admin' | 'member'; member?: Member } | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isPwaInstallModalOpen, setIsPwaInstallModalOpen] = useState(false);

  // PWA & Push states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper to sanitize society name across all data objects
  const sanitizeLoadedData = (loaded: AppStoreData): AppStoreData => {
    if (loaded && loaded.society) {
      if (loaded.society.name) {
        loaded.society.name = loaded.society.name.replace(/बिलासौदी/g, 'बिलासुदी').replace(/Bilasoudi/gi, 'Bilasudi');
      }
      if (loaded.society.name_mr) {
        loaded.society.name_mr = loaded.society.name_mr.replace(/बिलासौदी/g, 'बिलासुदी').replace(/Bilasoudi/gi, 'Bilasudi');
      } else {
        loaded.society.name_mr = 'अल-बदर बिलासुदी को.ऑप. सोसायटी, सोलापूर.';
      }
      if (loaded.society.name_en) {
        loaded.society.name_en = loaded.society.name_en.replace(/Bilasoudi/gi, 'Bilasudi');
      } else {
        loaded.society.name_en = 'Al-Badr Bilasudi Co-Op Society, Solapur';
      }
      if (loaded.society.address) {
        loaded.society.address = loaded.society.address.replace(/बिलासौदी/g, 'बिलासुदी').replace(/Bilasoudi/gi, 'Bilasudi');
      }
    }
    return loaded;
  };

  // Explicit refresh from Supabase / Storage
  const refreshData = async (): Promise<boolean> => {
    setIsRefreshing(true);
    try {
      const loaded = await storageService.loadData();
      const sanitized = sanitizeLoadedData(loaded);
      setData(sanitized);
      return true;
    } catch (err) {
      console.warn('Failed to refresh data:', err);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    storageService.loadData().then((loaded) => {
      setData(sanitizeLoadedData(loaded));
    });
    pushNotificationService.isSubscribed().then((sub) => setIsPushSubscribed(sub));

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Auto-refresh fresh data every time tab/page is opened
  useEffect(() => {
    if (data) {
      storageService.loadData().then((loaded) => {
        setData(sanitizeLoadedData(loaded));
      }).catch(() => {});
    }
  }, [activeTab]);

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
    setIsLoginModalOpen(false);
    setIsPasswordModalOpen(false);
    setIsBroadcastModalOpen(false);
    setIsPwaInstallModalOpen(false);
  };

  const navigateToTab = (targetTab: NavigationTab) => {
    closeAllModals();
    if (targetTab === activeTab) return;

    if (typeof window !== 'undefined') {
      if (targetTab === 'home') {
        window.history.replaceState({ screen: 'home' }, '', '');
      } else {
        window.history.replaceState({ screen: targetTab }, '', '');
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

  const openPasswordModal = (target: { type: 'admin' | 'member'; member?: Member }) => {
    setPasswordModalTarget(target);
    setIsPasswordModalOpen(true);
  };

  const triggerPwaInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setCanInstallPwa(false);
      });
    } else {
      setIsPwaInstallModalOpen(true);
    }
  };

  const subscribeToPushNotifications = async (): Promise<boolean> => {
    try {
      const userIdent = isAdmin ? 'admin' : isMember ? `acc-${currentUser?.account_no}` : 'guest';
      const success = await pushNotificationService.subscribe(userIdent);
      setIsPushSubscribed(success);
      return success;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const sendBroadcastPush = async (title: string, body: string, url: string = '/'): Promise<{ success: boolean; message: string }> => {
    return await pushNotificationService.sendBroadcast({ title, body, url });
  };

  // Hardware Back Button
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.history.state || !window.history.state.screen) {
      window.history.replaceState({ screen: 'home' }, '', '');
    }

    const handlePopState = () => {
      const isAnyModalOpen =
        createModalOpen ||
        qrModalOpen ||
        whatsAppModalOpen ||
        Boolean(selectedMemberForDetail) ||
        isAddMemberModalOpen ||
        isLoginModalOpen ||
        isPasswordModalOpen ||
        isBroadcastModalOpen ||
        isPwaInstallModalOpen;

      if (isAnyModalOpen) {
        closeAllModals();
        return;
      }

      if (activeTab !== 'home') {
        setActiveTab('home');
        window.history.replaceState({ screen: 'home' }, '', '');
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
    isLoginModalOpen,
    isPasswordModalOpen,
    isBroadcastModalOpen,
    isPwaInstallModalOpen,
  ]);

  // Auth Operations
  const login = async (identifier: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!data) return { success: false, message: 'डेटा लोड झालेला नाही.' };

    const cleanIdent = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Check Admin Login
    const adminPass = data.adminPassword || 'admin321';
    if (cleanIdent === 'admin' || cleanIdent === '9800000000' || cleanIdent === data.society.contact_phone) {
      if (cleanPass === adminPass) {
        const adminUser: AuthUser = {
          role: 'admin',
          account_no: 0,
          phone: data.society.contact_phone || '9800000000',
          full_name: 'सेक्रेटरी / ॲडमिन',
          name_mr: 'सेक्रेटरी / ॲडमिन',
          name_en: 'Secretary / Admin',
        };
        setCurrentUser(adminUser);
        storageService.setCurrentUser(adminUser);
        setIsLoginModalOpen(false);
        return { success: true };
      }
      return { success: false, message: 'चुकीचा ॲडमिन पासवर्ड.' };
    }

    // 2. Check Member Login (by Account No or Phone)
    const accNum = parseInt(cleanIdent, 10);
    const matchedMember = data.members.find((m) =>
      (!isNaN(accNum) && m.account_no === accNum) ||
      m.phone === cleanIdent ||
      m.member_no.toLowerCase() === cleanIdent
    );

    if (matchedMember) {
      const memberPass = matchedMember.password || '1234';
      if (cleanPass === memberPass) {
        const memUser: AuthUser = {
          role: 'member',
          account_no: matchedMember.account_no,
          phone: matchedMember.phone,
          full_name: matchedMember.name,
          name_mr: matchedMember.name_mr,
          name_en: matchedMember.name_en,
        };
        setCurrentUser(memUser);
        storageService.setCurrentUser(memUser);
        setIsLoginModalOpen(false);
        return { success: true };
      }
      return { success: false, message: 'चुकीचा पासवर्ड / पिन. (डिफॉल्ट पिन: 1234)' };
    }

    return { success: false, message: 'अकौंट नंबर किंवा फोन नंबर सापडला नाही.' };
  };

  const logout = () => {
    setCurrentUser(null);
    storageService.setCurrentUser(null);
  };

  const changeAdminPassword = async (newPassword: string): Promise<void> => {
    if (!data) return;
    const updated: AppStoreData = { ...data, adminPassword: newPassword };
    persist(updated);
    await storageService.syncAdminPassword(newPassword, data.society.contact_phone);
  };

  const changeMemberPassword = async (accountNo: number, newPassword: string): Promise<void> => {
    if (!data) return;
    const updatedMembers = data.members.map((m) =>
      m.account_no === accountNo ? { ...m, password: newPassword, updated_at: new Date().toISOString() } : m
    );
    const updated: AppStoreData = { ...data, members: updatedMembers };
    persist(updated);
    await storageService.syncMemberPassword(accountNo, newPassword);
  };

  // Helper getters
  const isMemberPaidInPeriod = (memberId: string, year: number, month: number): boolean => {
    if (!data) return false;
    return data.contributions.some(
      (c) => c.member_id === memberId && c.period_year === year && c.period_month === month
    );
  };

  const getMemberContributionInPeriod = (memberId: string, year: number, month: number): Contribution | undefined => {
    if (!data) return undefined;
    return data.contributions.find(
      (c) => c.member_id === memberId && c.period_year === year && c.period_month === month
    );
  };

  const getMemberActiveLoan = (memberId: string): Loan | undefined => {
    if (!data) return undefined;
    return data.loans.find((l) => l.member_id === memberId && l.status === 'active');
  };

  const getMemberRepayments = (loanId: string): LoanRepayment[] => {
    if (!data) return [];
    return data.repayments.filter((r) => r.loan_id === loanId);
  };

  const getMemberContributionHistory = (memberId: string): Contribution[] => {
    if (!data) return [];
    return data.contributions
      .filter((c) => c.member_id === memberId)
      .sort((a, b) => b.period_year * 100 + b.period_month - (a.period_year * 100 + a.period_month));
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

    const activeLoans = data.loans.filter((l) => l.status === 'active');
    const totalActiveLoanBalance = activeLoans.reduce((acc, l) => acc + (Number(l.remaining_balance) || 0), 0);
    const activeMembersCount = data.members.filter((m) => m.status === 'active').length;

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

    const activeMembers = data.members.filter((m) => m.status === 'active');
    const expectedCollection = activeMembers.reduce((acc, m) => acc + (Number(m.monthly_share) || 0), 0);

    const periodContributions = data.contributions.filter(
      (c) => c.period_year === selectedPeriod.year && c.period_month === selectedPeriod.month
    );
    const collectedAmount = periodContributions.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const pendingAmount = Math.max(0, expectedCollection - collectedAmount);

    const paidMemberIds = new Set(periodContributions.map((c) => c.member_id));
    const paidMembersCount = activeMembers.filter((m) => paidMemberIds.has(m.id)).length;
    const unpaidMembersCount = Math.max(0, activeMembers.length - paidMembersCount);
    const collectionPercentage =
      expectedCollection > 0 ? Math.round((collectedAmount / expectedCollection) * 100) : 100;

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
    const activeMembers = data.members.filter((m) => m.status === 'active');

    activeMembers.forEach((member) => {
      let isDue = false;
      let contributionDue = 0;
      let loanDue = 0;
      let severityDays = 0;
      let type: 'contribution' | 'loan' | 'both' = 'contribution';

      // Check current month share
      const isPaid = data.contributions.some(
        (c) =>
          c.member_id === member.id &&
          c.period_year === selectedPeriod.year &&
          c.period_month === selectedPeriod.month
      );

      if (!isPaid) {
        isDue = true;
        contributionDue = member.monthly_share;
        severityDays = Math.max(severityDays, 15);
      }

      // Check active loan
      const activeLoan = data.loans.find((l) => l.member_id === member.id && l.status === 'active');
      if (activeLoan && activeLoan.remaining_balance > 0) {
        loanDue = Math.min(activeLoan.monthly_installment, activeLoan.remaining_balance);
        isDue = true;
        severityDays = Math.max(severityDays, 25);
      }

      if (contributionDue > 0 && loanDue > 0) {
        type = 'both';
      } else if (loanDue > 0) {
        type = 'loan';
      }

      if (isDue) {
        list.push({
          member,
          type,
          contributionMonthsOverdue: contributionDue > 0 ? 1 : 0,
          contributionAmountDue: contributionDue,
          loanOverdueAmount: loanDue,
          totalDue: contributionDue + loanDue,
          activeLoan,
          severityDays,
        });
      }
    });

    return list.sort((a, b) => b.totalDue - a.totalDue);
  }, [data, selectedPeriod]);

  // Digital Register active ledger
  const activeLedger = useMemo<MonthlyLedger | null>(() => {
    if (!data || !data.ledgers || data.ledgers.length === 0) return null;
    return (
      data.ledgers.find(
        (l) => l.period_year === selectedPeriod.year && l.period_month === selectedPeriod.month
      ) || data.ledgers[0]
    );
  }, [data, selectedPeriod]);

  // Mutations
  const addMember = async (
    memberData: Omit<Member, 'id' | 'society_id' | 'created_at' | 'updated_at'>
  ): Promise<Member> => {
    if (!data) throw new Error('Data not initialized');

    const highestAccNo = data.members.reduce((max, m) => Math.max(max, m.account_no || 0), 0);
    const accountNo =
      memberData.account_no && memberData.account_no > 0 ? memberData.account_no : highestAccNo + 1;

    const newMember: Member = {
      ...memberData,
      id: `mem-${accountNo}-${Date.now()}`,
      society_id: data.society.id,
      account_no: accountNo,
      member_no: String(accountNo),
      name: memberData.name || memberData.name_mr || memberData.name_en || `Member ${accountNo}`,
      name_mr: memberData.name_mr || memberData.name,
      name_en: memberData.name_en || memberData.name,
      phone: memberData.phone,
      password: memberData.password || '1234',
      monthly_share: memberData.monthly_share || 300,
      cumulative_shares: memberData.cumulative_shares || 0,
      status: memberData.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Also add to ledgers
    const updatedLedgers = (data.ledgers || []).map((l) => {
      const existing = l.entries.some((e) => e.account_no === accountNo);
      if (!existing) {
        return {
          ...l,
          entries: [
            ...l.entries,
            {
              account_no: accountNo,
              name_mr: newMember.name_mr || newMember.name,
              name_en: newMember.name_en || newMember.name,
              monthly_share: newMember.monthly_share,
              cumulative_shares: newMember.cumulative_shares || 0,
              loan_approved: 0,
              loan_installment: 0,
              loan_balance_remaining: 0,
              fine: 0,
              total_amount: newMember.monthly_share,
              is_paid: false,
            },
          ].sort((a, b) => a.account_no - b.account_no),
        };
      }
      return l;
    });

    const updated: AppStoreData = {
      ...data,
      members: [...data.members, newMember].sort((a, b) => a.account_no - b.account_no),
      ledgers: updatedLedgers,
    };

    persist(updated);
    await storageService.syncMember(newMember);

    return newMember;
  };

  const updateMember = async (id: string, memberData: Partial<Member>): Promise<void> => {
    if (!data) return;
    const updatedMembers = data.members.map((m) =>
      m.id === id ? { ...m, ...memberData, updated_at: new Date().toISOString() } : m
    );

    const updatedTarget = updatedMembers.find((m) => m.id === id);

    const updatedLedgers = (data.ledgers || []).map((l) => ({
      ...l,
      entries: l.entries.map((e) => {
        if (updatedTarget && e.account_no === updatedTarget.account_no) {
          return {
            ...e,
            name_mr: updatedTarget.name_mr || updatedTarget.name,
            name_en: updatedTarget.name_en || updatedTarget.name,
            monthly_share: updatedTarget.monthly_share,
            cumulative_shares: updatedTarget.cumulative_shares || e.cumulative_shares,
          };
        }
        return e;
      }),
    }));

    const updated: AppStoreData = { ...data, members: updatedMembers, ledgers: updatedLedgers };
    persist(updated);

    if (updatedTarget) {
      await storageService.syncMember(updatedTarget);
    }
  };

  const deleteMember = async (id: string): Promise<void> => {
    if (!data) return;
    const target = data.members.find((m) => m.id === id);
    const updatedMembers = data.members.filter((m) => m.id !== id);
    const updated: AppStoreData = { ...data, members: updatedMembers };
    persist(updated);

    if (target) {
      await storageService.deleteMember(id, target.account_no, target.phone);
    }
  };

  const toggleLedgerEntryPaid = async (accountNo: number): Promise<void> => {
    if (!data || !activeLedger) return;

    const updatedEntries = activeLedger.entries.map((e) =>
      e.account_no === accountNo ? { ...e, is_paid: !e.is_paid } : e
    );

    const totalShares = updatedEntries
      .filter((e) => e.is_paid)
      .reduce((s, e) => s + (Number(e.monthly_share) || 0), 0);
    const totalInstallments = updatedEntries
      .filter((e) => e.is_paid)
      .reduce((s, e) => s + (Number(e.loan_installment) || 0), 0);
    const totalGross = totalShares + totalInstallments;
    const totalAvailable = activeLedger.previous_balance + totalGross;
    const closingBalance = totalAvailable - activeLedger.loan_disbursed_amount;

    const updatedLedger: MonthlyLedger = {
      ...activeLedger,
      entries: updatedEntries,
      total_shares_collected: totalShares,
      total_installments_collected: totalInstallments,
      total_gross_collected: totalGross,
      total_cash_available: totalAvailable,
      closing_balance: closingBalance,
    };

    const updatedLedgers = data.ledgers.map((l) => (l.id === activeLedger.id ? updatedLedger : l));
    const updated: AppStoreData = { ...data, ledgers: updatedLedgers };
    persist(updated);
    await storageService.syncLedger(updatedLedger);
  };

  const updateLedgerEntry = async (accountNo: number, updates: Partial<LedgerEntry>): Promise<void> => {
    if (!data || !activeLedger) return;

    const updatedEntries = activeLedger.entries.map((e) => {
      if (e.account_no === accountNo) {
        const merged = { ...e, ...updates };
        merged.total_amount = merged.monthly_share + merged.loan_installment + (merged.fine || 0);
        return merged;
      }
      return e;
    });

    const totalShares = updatedEntries
      .filter((e) => e.is_paid)
      .reduce((s, e) => s + (Number(e.monthly_share) || 0), 0);
    const totalInstallments = updatedEntries
      .filter((e) => e.is_paid)
      .reduce((s, e) => s + (Number(e.loan_installment) || 0), 0);
    const totalGross = totalShares + totalInstallments;
    const totalAvailable = activeLedger.previous_balance + totalGross;
    const closingBalance = totalAvailable - activeLedger.loan_disbursed_amount;

    const updatedLedger: MonthlyLedger = {
      ...activeLedger,
      entries: updatedEntries,
      total_shares_collected: totalShares,
      total_installments_collected: totalInstallments,
      total_gross_collected: totalGross,
      total_cash_available: totalAvailable,
      closing_balance: closingBalance,
    };

    const updatedLedgers = data.ledgers.map((l) => (l.id === activeLedger.id ? updatedLedger : l));
    const updated: AppStoreData = { ...data, ledgers: updatedLedgers };
    persist(updated);
    await storageService.syncLedger(updatedLedger);
  };

  const updateLedgerDisbursal = async (accountNo: number, amount: number): Promise<void> => {
    if (!data || !activeLedger) return;

    const closingBalance = activeLedger.total_cash_available - amount;
    const updatedLedger: MonthlyLedger = {
      ...activeLedger,
      loan_disbursed_account_no: accountNo,
      loan_disbursed_amount: amount,
      closing_balance: closingBalance,
    };

    const updatedLedgers = data.ledgers.map((l) => (l.id === activeLedger.id ? updatedLedger : l));
    const updated: AppStoreData = { ...data, ledgers: updatedLedgers };
    persist(updated);
    await storageService.syncLedger(updatedLedger);
  };

  const addNewLedgerMonth = async (year: number, month: number, label: string): Promise<void> => {
    if (!data) return;

    const prevLedger = activeLedger || data.ledgers[0];
    const prevClosing = prevLedger ? prevLedger.closing_balance : 820;

    const newEntries: LedgerEntry[] = data.members.map((m) => {
      const prevEntry = prevLedger?.entries.find((e) => e.account_no === m.account_no);
      const remainingLoan = prevEntry
        ? Math.max(0, prevEntry.loan_balance_remaining - prevEntry.loan_installment)
        : 0;

      return {
        account_no: m.account_no,
        name_mr: m.name_mr || m.name,
        name_en: m.name_en || m.name,
        monthly_share: m.monthly_share,
        cumulative_shares: (m.cumulative_shares || 0) + (prevEntry?.is_paid ? m.monthly_share : 0),
        loan_approved: 0,
        loan_installment: remainingLoan > 0 ? prevEntry?.loan_installment || 4000 : 0,
        loan_balance_remaining: remainingLoan,
        fine: 0,
        total_amount: m.monthly_share + (remainingLoan > 0 ? prevEntry?.loan_installment || 4000 : 0),
        is_paid: false,
      };
    });

    const newLedger: MonthlyLedger = {
      id: `ledger-${year}-${month}-${Date.now()}`,
      period_year: year,
      period_month: month,
      period_label: label,
      previous_balance: prevClosing,
      total_shares_collected: 0,
      total_installments_collected: 0,
      total_gross_collected: 0,
      total_cash_available: prevClosing,
      loan_disbursed_amount: 0,
      closing_balance: prevClosing,
      entries: newEntries,
      is_finalized: false,
    };

    const updated: AppStoreData = {
      ...data,
      ledgers: [newLedger, ...data.ledgers],
    };
    persist(updated);
    await storageService.syncLedger(newLedger);
  };

  const logContribution = async (
    contData: Omit<Contribution, 'id' | 'society_id' | 'created_at'>
  ): Promise<Contribution> => {
    if (!data) throw new Error('Data not initialized');

    const filtered = data.contributions.filter(
      (c) =>
        !(
          c.member_id === contData.member_id &&
          c.period_year === contData.period_year &&
          c.period_month === contData.period_month
        )
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

    // Automated OS-level Web Push Notification to Member & Admin
    const targetMember = data.members.find((m) => m.id === contData.member_id);
    const memberName = targetMember ? targetMember.name : 'सभासद';
    pushNotificationService.sendPush({
      title: 'अल-बदर सोसायटी: वर्गणी जमा पावती',
      body: `${memberName} यांची ₹${contData.amount} मासिक वर्गणी यशस्वीरीत्या जमा झाली आहे.`,
      url: '/',
      target: targetMember ? `acc-${targetMember.account_no}` : 'all',
    }).catch(() => {});

    return newContribution;
  };

  const disburseLoan = async (
    loanData: Omit<Loan, 'id' | 'society_id' | 'remaining_balance' | 'status' | 'created_at' | 'updated_at'>
  ): Promise<Loan> => {
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

    // Automated OS-level Web Push Notification for Loan Sanction
    const targetMember = data.members.find((m) => m.id === loanData.member_id);
    const memberName = targetMember ? targetMember.name : 'सभासद';
    pushNotificationService.sendPush({
      title: 'अल-बदर सोसायटी: कर्ज वाटप मंजूर',
      body: `${memberName} यांना ₹${loanData.principal_amount.toLocaleString('en-IN')} चे बिनव्याजी कर्ज मंजूर करण्यात आले आहे.`,
      url: '/',
      target: targetMember ? `acc-${targetMember.account_no}` : 'all',
    }).catch(() => {});

    return newLoan;
  };

  const logRepayment = async (
    repData: Omit<LoanRepayment, 'id' | 'society_id' | 'created_at'>
  ): Promise<LoanRepayment> => {
    if (!data) throw new Error('Data not initialized');

    const newRepayment: LoanRepayment = {
      ...repData,
      id: `rep-${Date.now()}`,
      society_id: data.society.id,
      created_at: new Date().toISOString(),
    };

    let remainingAfter = 0;
    const updatedLoans = data.loans.map((loan) => {
      if (loan.id === repData.loan_id) {
        const newBalance = Math.max(0, loan.remaining_balance - repData.amount);
        remainingAfter = newBalance;
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

    // Automated OS-level Web Push Notification for Loan Repayment
    const targetMember = data.members.find((m) => m.id === repData.member_id);
    const memberName = targetMember ? targetMember.name : 'सभासद';
    pushNotificationService.sendPush({
      title: 'अल-बदर सोसायटी: कर्ज हप्ता पावती',
      body: `${memberName} यांचा ₹${repData.amount} चा कर्जाचा हप्ता जमा झाला. बाकी कर्ज: ₹${remainingAfter.toLocaleString('en-IN')}.`,
      url: '/',
      target: targetMember ? `acc-${targetMember.account_no}` : 'all',
    }).catch(() => {});

    return newRepayment;
  };

  const sendDueReminders = async (): Promise<{ count: number }> => {
    if (!data) return { count: 0 };
    const monthName = appLanguage === 'mr' ? getLocalizedMonthName(selectedPeriod.month, 'mr') : selectedPeriod.monthName;
    const title =
      appLanguage === 'mr'
        ? 'अल-बदर सोसायटी: मासिक वर्गणी व हप्ता आठवण'
        : appLanguage === 'hi'
        ? 'अल-बद्र सोसाइटी: मासिक अंशदान एवं ऋण किस्त अनुस्मारक'
        : 'Al-Badr Bilasudi Society: Monthly Share & Loan Due Reminder';

    const body =
      appLanguage === 'mr'
        ? `माहे ${monthName} ची मासिक वर्गणी (₹300) आणि कर्जाचा हप्ता भरण्याची मुदत सुरू आहे. सर्व ${defaulters.length} थकबाकीदार सभासदांनी कृपया वेळेत जमा करावी.`
        : appLanguage === 'hi'
        ? `माह ${monthName} का मासिक अंशदान (₹300) और ऋण किस्त जमा करने की अवधि सक्रिय है। सभी ${defaulters.length} बकाया सदस्य कृपया समय पर जमा करें।`
        : `Collection for ${monthName} (Monthly Share ₹300 + active loan installment) is due. All ${defaulters.length} pending members please deposit on time.`;

    await pushNotificationService.sendPush({
      title,
      body,
      url: '/',
      target: 'all',
    });
    return { count: defaulters.length };
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
    await storageService.syncSocietyProfile(updatedSociety);
  };

  const resetToSampleData = () => {
    const fresh = storageService.resetToSampleData();
    setData(fresh);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600 font-medium tracking-wide">
            अल-बदर बिलासुदी को.ऑप. सोसायटी लोड होत आहे...
          </p>
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
        ledgers: data.ledgers || [],
        activeLedger,
        selectedPeriod,
        setSelectedPeriod,
        activeTab,
        setActiveTab,
        currentUser,
        isAdmin,
        isMember,
        login,
        logout,
        changeAdminPassword,
        changeMemberPassword,
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
        toggleLedgerEntryPaid,
        updateLedgerEntry,
        addNewLedgerMonth,
        updateLedgerDisbursal,
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
        isLoginModalOpen,
        setIsLoginModalOpen,
        isPasswordModalOpen,
        setIsPasswordModalOpen,
        passwordModalTarget,
        openPasswordModal,
        isBroadcastModalOpen,
        setIsBroadcastModalOpen,
        isPwaInstallModalOpen,
        setIsPwaInstallModalOpen,
        canInstallPwa,
        triggerPwaInstall,
        isPushSubscribed,
        subscribeToPushNotifications,
        sendBroadcastPush,
        sendDueReminders,
        isRefreshing,
        refreshData,
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
