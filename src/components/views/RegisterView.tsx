import React, { useState } from 'react';
import {
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  Edit2,
  Check,
  X,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Save,
  RefreshCw,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { storageService } from '../../services/storage';
import { formatINR } from '../../utils/formatters';
import { LedgerEntry } from '../../types';
import { getLocalizedSocietyName } from '../../i18n/translations';

export const RegisterView: React.FC = () => {
  const {
    activeLedger,
    ledgers,
    selectedPeriod,
    setSelectedPeriod,
    toggleLedgerEntryPaid,
    updateLedgerEntry,
    updateLedgerDisbursal,
    addNewLedgerMonth,
    isAdmin,
    society,
    currentUser,
    openPasswordModal,
    members,
    isRefreshing,
    refreshData,
    appLanguage,
    t,
  } = useSociety();

  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [editShare, setEditShare] = useState('300');
  const [editInstallment, setEditInstallment] = useState('0');
  const [editFine, setEditFine] = useState('0');
  const [editLoanBal, setEditLoanBal] = useState('0');
  const [editLoanApproved, setEditLoanApproved] = useState('0');
  const [editIsPaid, setEditIsPaid] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  const [isNewMonthModalOpen, setIsNewMonthModalOpen] = useState(false);
  const [newYear, setNewYear] = useState(2024);
  const [newMonth, setNewMonth] = useState(11);
  const [newLabel, setNewLabel] = useState('Nov - 24');

  const handleOpenEdit = (entry: LedgerEntry) => {
    if (!isAdmin) return;
    setEditingEntry(entry);
    setEditShare(String(entry.monthly_share));
    setEditInstallment(String(entry.loan_installment));
    setEditFine(String(entry.fine || 0));
    setEditLoanBal(String(entry.loan_balance_remaining || 0));
    setEditLoanApproved(String(entry.loan_approved || 0));
    setEditIsPaid(Boolean(entry.is_paid));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    await updateLedgerEntry(editingEntry.account_no, {
      monthly_share: Number(editShare) || 300,
      loan_installment: Number(editInstallment) || 0,
      fine: Number(editFine) || 0,
      loan_balance_remaining: Number(editLoanBal) || 0,
      loan_approved: Number(editLoanApproved) || 0,
      is_paid: editIsPaid,
    });

    // If new loan approved, update disbursal
    if (Number(editLoanApproved) > 0) {
      await updateLedgerDisbursal(editingEntry.account_no, Number(editLoanApproved));
    }

    setEditingEntry(null);
    setSaveSuccessToast(
      appLanguage === 'mr'
        ? `सभासद #${editingEntry.account_no} ची नोंद जतन झाली!`
        : `Member #${editingEntry.account_no} record saved successfully!`
    );
    setTimeout(() => setSaveSuccessToast(null), 3000);
  };

  const handleSaveRegister = async () => {
    if (!activeLedger) return;
    setIsSaving(true);
    try {
      await storageService.syncLedger(activeLedger);
      setSaveSuccessToast(
        appLanguage === 'mr'
          ? 'रजिस्टर यशस्वीरित्या जतन झाले! सर्व नोंदी सुरक्षित आहेत.'
          : 'Register saved successfully! All records secured.'
      );
      setTimeout(() => setSaveSuccessToast(null), 3500);
    } catch (err) {
      console.error(err);
      setSaveSuccessToast(
        appLanguage === 'mr' ? 'रजिस्टर बदल जतन झाले!' : 'Register changes saved!'
      );
      setTimeout(() => setSaveSuccessToast(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrevMonth = () => {
    const currentIndex = ledgers.findIndex(
      (l) => l.period_year === selectedPeriod.year && l.period_month === selectedPeriod.month
    );
    if (currentIndex < ledgers.length - 1) {
      const prev = ledgers[currentIndex + 1];
      setSelectedPeriod({ year: prev.period_year, month: prev.period_month, monthName: prev.period_label });
    }
  };

  const handleNextMonth = () => {
    const currentIndex = ledgers.findIndex(
      (l) => l.period_year === selectedPeriod.year && l.period_month === selectedPeriod.month
    );
    if (currentIndex > 0) {
      const next = ledgers[currentIndex - 1];
      setSelectedPeriod({ year: next.period_year, month: next.period_month, monthName: next.period_label });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateNewMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNewLedgerMonth(newYear, newMonth, newLabel);
    setIsNewMonthModalOpen(false);
    setSaveSuccessToast(
      appLanguage === 'mr'
        ? `नवीन महिना (${newLabel}) रजिस्टर तयार केले गेले!`
        : `New month register (${newLabel}) created!`
    );
    setTimeout(() => setSaveSuccessToast(null), 3500);
  };

  if (!activeLedger) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
        <Calendar size={40} className="mx-auto text-emerald-800" />
        <h3 className="text-base font-bold text-slate-800">
          {appLanguage === 'mr'
            ? `निवडलेल्या महिन्याचे (${selectedPeriod.monthName} ${selectedPeriod.year}) रजिस्टर अद्याप तयार नाही.`
            : `Register for selected period (${selectedPeriod.monthName} ${selectedPeriod.year}) is not yet created.`}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {appLanguage === 'mr'
            ? 'तुम्ही मागील महिन्याची शिल्लक कॅरी फॉरवर्ड करून लगेच नवीन महिन्याचे रजिस्टर सुरू करू शकता.'
            : 'You can initialize this month with the previous month closing balance carried forward.'}
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {ledgers.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const first = ledgers[0];
                setSelectedPeriod({ year: first.period_year, month: first.period_month, monthName: first.period_label });
              }}
              className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              {appLanguage === 'mr'
                ? `उपलब्ध रजिस्टर पहा (${ledgers[0].period_label})`
                : `View Available Register (${ledgers[0].period_label})`}
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => addNewLedgerMonth(selectedPeriod.year, selectedPeriod.month, `${selectedPeriod.monthName.slice(0, 3)} - ${String(selectedPeriod.year).slice(-2)}`)}
              className="py-2 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl"
            >
              {appLanguage === 'mr' ? 'या महिन्याचे रजिस्टर सुरू करा' : 'Start Register For This Month'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Calculate dynamic totals from entries
  const totalSharesCollected = activeLedger.entries
    .filter((e) => e.is_paid)
    .reduce((sum, e) => sum + e.monthly_share, 0);

  const totalInstallmentsCollected = activeLedger.entries
    .filter((e) => e.is_paid)
    .reduce((sum, e) => sum + e.loan_installment, 0);

  const totalGrossCollected = totalSharesCollected + totalInstallmentsCollected;
  const totalCashAvailable = activeLedger.previous_balance + totalGrossCollected;
  const closingBalance = totalCashAvailable - activeLedger.loan_disbursed_amount;
  const paidCount = activeLedger.entries.filter((e) => e.is_paid).length;

  const currentMonthIdx = ledgers.findIndex(
    (l) => l.period_year === selectedPeriod.year && l.period_month === selectedPeriod.month
  );

  return (
    <div className="space-y-6 relative">
      {/* Floating Save Toast Notification */}
      {saveSuccessToast && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200 border border-emerald-700">
          <CheckCircle2 size={16} className="text-emerald-300" />
          <span>{saveSuccessToast}</span>
        </div>
      )}

      {/* =========================================================================
          SCREEN HEADER & TOOLBAR (Hidden during print)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              {t('register.officialRegister')}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {t('register.forMonth')} {activeLedger.period_label}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            {t('register.title')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('register.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Selector with Prev / Next Buttons */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl shadow-sm p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={currentMonthIdx >= ledgers.length - 1}
              className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors"
              title={appLanguage === 'mr' ? 'मागील महिना (Previous Month)' : 'Previous Month'}
            >
              <ChevronLeft size={15} />
            </button>
            <div className="relative">
              <select
                value={`${selectedPeriod.year}-${selectedPeriod.month}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-').map(Number);
                  setSelectedPeriod({ year: y, month: m, monthName: activeLedger.period_label });
                }}
                className="appearance-none bg-transparent text-slate-800 text-xs font-bold py-1.5 pl-2 pr-7 focus:outline-none cursor-pointer"
              >
                {ledgers.map((l) => (
                  <option key={l.id} value={`${l.period_year}-${l.period_month}`}>
                    {l.period_label} ({l.period_year})
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={currentMonthIdx <= 0}
              className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors"
              title={appLanguage === 'mr' ? 'पुढील महिना (Next Month)' : 'Next Month'}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* ALWAYS-ON TOP HEADER SAVE BUTTON */}
          {/* Refresh from Supabase button */}
          <button
            type="button"
            onClick={() => refreshData()}
            disabled={isRefreshing}
            className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            title="Refresh Ledger from Supabase"
          >
            <RefreshCw size={14} className={`text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{appLanguage === 'mr' ? 'रिफ्रेश' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveRegister}
            disabled={isSaving}
            className="py-2 px-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 border border-emerald-600 transition-all cursor-pointer ring-2 ring-emerald-500/20"
            title={t('register.saveChanges')}
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('register.saving')}</span>
              </>
            ) : (
              <>
                <Save size={14} className="text-white" />
                <span>{t('register.saveChanges')}</span>
              </>
            )}
          </button>

          {/* New Month button (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsNewMonthModalOpen(true)}
              className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              title={t('register.newMonth')}
            >
              <PlusCircle size={15} className="text-emerald-700" />
              <span>{t('register.newMonth')}</span>
            </button>
          )}

          {/* Print A4 Sheet button */}
          <button
            type="button"
            onClick={handlePrint}
            className="py-2 px-3.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            title={t('register.printA4')}
          >
            <Printer size={15} />
            <span>{t('register.printA4')}</span>
          </button>
        </div>
      </div>

      {/* Screen Financial Stat Overview (Hidden during print) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {t('register.sharesCollected')}
          </span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {formatINR(totalSharesCollected)}
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">
            {paidCount} / 40 {t('register.allMembersCompleted')}
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {t('register.installmentsCollected')}
          </span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {formatINR(totalInstallmentsCollected)}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">{t('register.monthlyRecovery')}</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {t('register.loansDisbursed')}
          </span>
          <p className="text-sm font-bold text-amber-700 mt-0.5">
            {formatINR(activeLedger.loan_disbursed_amount)}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">
            {activeLedger.loan_disbursed_account_no
              ? `${appLanguage === 'mr' ? 'अकौंट नं.' : 'Account #'} ${activeLedger.loan_disbursed_account_no}`
              : t('register.none')}
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {t('register.closingBalance')}
          </span>
          <p className="text-sm font-bold text-emerald-800 mt-0.5">
            {formatINR(closingBalance)}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">{t('register.carryForwardSub')}</span>
        </div>
      </div>

      {/* =========================================================================
          PRINTABLE REGISTER SHEET CONTAINER
          Specially styled for High-Density Single A4 Landscape Output
         ========================================================================= */}
      <div id="printable-register" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 print:p-0 print:border-none print:shadow-none shadow-sm">
        {/* Printable Official Header */}
        <div className="text-center pb-3 border-b-2 border-slate-800 mb-3">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-wide font-serif">
            {getLocalizedSocietyName(society, appLanguage)}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            {appLanguage === 'mr'
              ? `मासिक वर्गणी व बिनव्याजी कर्ज नोंदवही पत्रक - माहे ${activeLedger.period_label}`
              : `Monthly Share & Interest-Free Loan Register Sheet - For ${activeLedger.period_label}`}
          </p>
          <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-600 mt-1 px-1">
            <span>{appLanguage === 'mr' ? 'सोलापूर, महाराष्ट्र' : 'Solapur, Maharashtra'}</span>
            <span>{appLanguage === 'mr' ? 'मासिक वर्गणी दर: ₹300/- दरमहा' : 'Monthly Share Rate: ₹300 / mo'}</span>
            <span>{appLanguage === 'mr' ? `तारीख: ${new Date().toLocaleDateString('mr-IN')}` : `Date: ${new Date().toLocaleDateString('en-IN')}`}</span>
          </div>
        </div>

        {/* Register Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] print:text-[8.5pt]">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-y-2 border-slate-800 font-bold uppercase text-[9px] print:text-[8pt] tracking-wider">
                <th className="py-1.5 px-1.5 text-center w-8 border border-slate-300">{t('register.srNo')}</th>
                <th className="py-1.5 px-2 border border-slate-300">{t('register.memberName')}</th>
                <th className="py-1.5 px-2 text-right border border-slate-300">{t('register.monthlyShareCol')}</th>
                <th className="py-1.5 px-2 text-right border border-slate-300">{t('register.totalSharesCol')}</th>
                <th className="py-1.5 px-2 text-right border border-slate-300">{t('register.loanApprovedCol')}</th>
                <th className="py-1.5 px-2 text-right border border-slate-300">{t('register.loanInstallmentCol')}</th>
                <th className="py-1.5 px-2 text-right border border-slate-300">{t('register.remainingLoanCol')}</th>
                <th className="py-1.5 px-1 text-center border border-slate-300">{t('register.fineCol')}</th>
                <th className="py-1.5 px-2 text-right border border-slate-300 font-extrabold">{t('register.totalRsCol')}</th>
                <th className="py-1.5 px-1.5 text-center border border-slate-300 print:hidden">{t('register.statusCol')}</th>
                {isAdmin && <th className="py-1.5 px-1.5 text-center border border-slate-300 print:hidden">{t('register.actionCol')}</th>}
              </tr>
            </thead>
            <tbody>
              {activeLedger.entries.map((entry) => {
                const totalItem = entry.monthly_share + entry.loan_installment + (entry.fine || 0);
                return (
                  <tr
                    key={entry.account_no}
                    onClick={() => isAdmin && handleOpenEdit(entry)}
                    className={`border-b border-slate-200 transition-colors ${
                      isAdmin ? 'cursor-pointer hover:bg-emerald-50/70 group' : 'hover:bg-slate-50'
                    } ${entry.account_no % 2 === 0 ? 'bg-slate-50/40' : 'bg-white'}`}
                    title={isAdmin ? `Edit #${entry.account_no}` : undefined}
                  >
                    <td className="py-1 px-1.5 text-center font-bold text-slate-800 border border-slate-200">
                      {entry.account_no}
                    </td>
                    <td className="py-1 px-2 border border-slate-200 font-medium text-slate-900 whitespace-nowrap">
                      {appLanguage === 'mr' ? (
                        <>
                          <span>{entry.name_mr}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                            ({entry.name_en})
                          </span>
                        </>
                      ) : (
                        <>
                          <span>{entry.name_en}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                            ({entry.name_mr})
                          </span>
                        </>
                      )}
                    </td>
                    <td className="py-1 px-2 text-right font-medium text-slate-700 border border-slate-200">
                      {entry.monthly_share.toLocaleString('en-IN')}
                    </td>
                    <td className="py-1 px-2 text-right font-semibold text-slate-800 border border-slate-200">
                      {entry.cumulative_shares > 0 ? entry.cumulative_shares.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="py-1 px-2 text-right font-bold text-amber-700 border border-slate-200">
                      {entry.loan_approved > 0 ? entry.loan_approved.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="py-1 px-2 text-right font-medium text-slate-700 border border-slate-200">
                      {entry.loan_installment > 0 ? entry.loan_installment.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="py-1 px-2 text-right font-semibold text-slate-800 border border-slate-200">
                      {entry.loan_balance_remaining > 0 ? entry.loan_balance_remaining.toLocaleString('en-IN') : 'Nil'}
                    </td>
                    <td className="py-1 px-1 text-center text-slate-500 border border-slate-200">
                      {entry.fine > 0 ? entry.fine : '-'}
                    </td>
                    <td className="py-1 px-2 text-right font-bold text-slate-900 border border-slate-200">
                      {totalItem.toLocaleString('en-IN')}
                    </td>

                    {/* Paid Toggle / Badge (Screen only) */}
                    <td className="py-1 px-1.5 text-center border border-slate-200 print:hidden">
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLedgerEntryPaid(entry.account_no);
                          }}
                          title={entry.is_paid ? `${t('register.paid')} - Click to toggle` : `${t('register.unpaid')} - Click to mark paid`}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                            entry.is_paid
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {entry.is_paid ? t('register.paid') : t('register.unpaid')}
                        </button>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            entry.is_paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {entry.is_paid ? t('register.paid') : t('register.unpaid')}
                        </span>
                      )}
                    </td>

                    {/* Actions (Admin only, screen only) */}
                    {isAdmin && (
                      <td className="py-1 px-1.5 text-center border border-slate-200 print:hidden">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(entry);
                          }}
                          className="p-1 text-slate-500 hover:text-emerald-800 hover:bg-slate-100 rounded-md transition-colors"
                          title={t('register.editTitle')}
                        >
                          <Edit2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer: Column Sums */}
            <tfoot>
              <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-b-2 border-slate-800">
                <td colSpan={2} className="py-2 px-2 text-center border border-slate-300">
                  {t('register.totalRow')}
                </td>
                <td className="py-2 px-2 text-right border border-slate-300">
                  ₹{totalSharesCollected.toLocaleString('en-IN')}
                </td>
                <td className="py-2 px-2 text-right border border-slate-300">-</td>
                <td className="py-2 px-2 text-right border border-slate-300 text-amber-800">
                  {activeLedger.loan_disbursed_amount > 0
                    ? `₹${activeLedger.loan_disbursed_amount.toLocaleString('en-IN')}`
                    : '-'}
                </td>
                <td className="py-2 px-2 text-right border border-slate-300">
                  ₹{totalInstallmentsCollected.toLocaleString('en-IN')}
                </td>
                <td className="py-2 px-2 text-right border border-slate-300">-</td>
                <td className="py-2 px-1 text-center border border-slate-300">-</td>
                <td className="py-2 px-2 text-right border border-slate-300 text-emerald-900">
                  ₹{totalGrossCollected.toLocaleString('en-IN')}
                </td>
                <td className="py-2 px-1 text-center border border-slate-300 print:hidden">
                  {paidCount}/40
                </td>
                {isAdmin && <td className="print:hidden border border-slate-300"></td>}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* =========================================================================
            MONTHLY CASH RECONCILIATION SUMMARY (Bottom of Image 2)
           ========================================================================= */}
        <div className="mt-4 pt-3 border-t-2 border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs print:text-[8pt]">
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 mb-1.5 uppercase tracking-wide">
                {t('register.cashReconciliation')}
              </h4>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">
                  {appLanguage === 'mr' ? 'मासिक शेअर्स जमा (40 सभासद × ₹300):' : 'Monthly Shares (40 Members × ₹300):'}
                </span>
                <span className="font-semibold text-slate-900">₹{totalSharesCollected.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">
                  {appLanguage === 'mr' ? 'कर्ज हप्ते जमा:' : 'Loan Installments Collected:'}
                </span>
                <span className="font-semibold text-slate-900">₹{totalInstallmentsCollected.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-0.5 font-bold border-t border-slate-200 pt-1">
                <span>{t('register.totalCollection')}</span>
                <span className="text-emerald-800">₹{totalGrossCollected.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">{t('register.prevMonthBal')}</span>
                <span className="font-semibold text-slate-900">₹{activeLedger.previous_balance.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-0.5 font-bold text-emerald-900 border-t border-slate-300 pt-1">
                <span>{t('register.grossCashAvailable')}</span>
                <span>₹{totalCashAvailable.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-0.5 text-amber-900 font-semibold">
                <span>
                  {t('register.lessLoanDisbursed')}{' '}
                  {activeLedger.loan_disbursed_account_no ? `(#${activeLedger.loan_disbursed_account_no})` : ''}:
                </span>
                <span>- ₹{activeLedger.loan_disbursed_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 font-extrabold text-sm border-t-2 border-slate-800 text-slate-900 pt-1">
                <span>{t('register.netClosingBal')}</span>
                <span>₹{closingBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Official Signatures Box */}
            <div className="flex flex-col justify-between p-3 border border-slate-300 rounded-xl bg-slate-50/50">
              <div>
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 mb-2 uppercase tracking-wide">
                  {t('register.signatures')}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {appLanguage === 'mr'
                    ? `माहे ${activeLedger.period_label} चे वरील सर्व 40 सभासदांचे शेअर्स, कर्ज हप्ते व ताळेबंद हिशोब पूर्णपणे तपासले असून योग्य व बरोबर असल्याचे प्रमाणित करण्यात येत आहे.`
                    : `All 40 member shares, loan installments, and monthly balance sheet accounts for ${activeLedger.period_label} have been thoroughly audited and certified as accurate.`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 mt-4 border-t border-slate-300 text-center font-bold text-slate-800">
                <div>
                  <div className="h-8 border-b border-dashed border-slate-400"></div>
                  <span className="text-[11px] block mt-1">{t('register.secretarySign')}</span>
                  <span className="text-[9px] text-slate-500 font-normal">Secretary / Manager</span>
                </div>
                <div>
                  <div className="h-8 border-b border-dashed border-slate-400"></div>
                  <span className="text-[11px] block mt-1">{t('register.presidentSign')}</span>
                  <span className="text-[9px] text-slate-500 font-normal">President / Treasurer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {t('register.editTitle')}: #{editingEntry.account_no} {appLanguage === 'mr' ? editingEntry.name_mr : editingEntry.name_en}
              </h3>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('register.monthlyShareCol')} (₹)
                  </label>
                  <input
                    type="number"
                    value={editShare}
                    onChange={(e) => setEditShare(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('register.loanInstallmentCol')} (₹)
                  </label>
                  <input
                    type="number"
                    value={editInstallment}
                    onChange={(e) => setEditInstallment(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('register.remainingLoanCol')} (₹)
                  </label>
                  <input
                    type="number"
                    value={editLoanBal}
                    onChange={(e) => setEditLoanBal(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('register.fineCol')} (₹)
                  </label>
                  <input
                    type="number"
                    value={editFine}
                    onChange={(e) => setEditFine(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('register.loanApprovedCol')} (₹)
                </label>
                <input
                  type="number"
                  value={editLoanApproved}
                  onChange={(e) => setEditLoanApproved(e.target.value)}
                  placeholder="e.g. 180000"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                />
              </div>

              {/* Payment Status Toggle inside Edit Modal */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{t('register.paymentStatus')}</span>
                  <span className="text-[10px] text-slate-500">
                    {appLanguage === 'mr' ? 'या महिन्याची वर्गणी व हप्ता जमा आहे का?' : 'Is share and installment paid for this month?'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsPaid(!editIsPaid)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    editIsPaid
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                  }`}
                >
                  {editIsPaid ? (
                    <span className="flex items-center justify-center gap-1">
                      <Check size={14} />
                      <span>{t('register.paid')}</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      <Clock size={14} />
                      <span>{t('register.unpaid')}</span>
                    </span>
                  )}
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  {t('register.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {t('register.saveEntry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Month Modal */}
      {isNewMonthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {appLanguage === 'mr' ? 'नवीन महिना रजिस्टर तयार करा' : 'Create New Month Register'}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewMonthModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewMonth} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {appLanguage === 'mr' ? 'वर्ष (Year)' : 'Year'}
                </label>
                <input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {appLanguage === 'mr' ? 'महिना (Month 1-12)' : 'Month (1-12)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={newMonth}
                  onChange={(e) => setNewMonth(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {appLanguage === 'mr' ? 'नाव / लेबल' : 'Name / Label'}
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Nov - 24"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 text-emerald-800 text-[11px] rounded-xl border border-emerald-200">
                {appLanguage === 'mr'
                  ? `मागील महिन्याची उर्वरित शिल्लक (₹${closingBalance.toLocaleString('en-IN')}) नवीन महिन्यात स्वयंचलितरित्या सुरुवातीची शिल्लक म्हणून ट्रान्सफर केली जाईल.`
                  : `Closing balance (₹${closingBalance.toLocaleString('en-IN')}) from previous month will automatically transfer as the starting balance.`}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewMonthModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  {t('register.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold"
                >
                  {appLanguage === 'mr' ? 'तयार करा' : 'Create Month'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

