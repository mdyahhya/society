import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  HandCoins,
  RotateCcw,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useSociety } from '../../context/SocietyContext';
import { formatINR, getCurrentPeriod, getMonthName, getLocalizedMonthName } from '../../utils/formatters';

export const CreateActionModal: React.FC = () => {
  const {
    createModalOpen,
    setCreateModalOpen,
    createModalDefaultType,
    members,
    loans,
    poolMetrics,
    logContribution,
    disburseLoan,
    logRepayment,
    openWhatsAppModal,
    society,
    t,
    appLanguage,
  } = useSociety();

  const [activeTab, setActiveTab] = useState<'contribution' | 'loan' | 'repayment' | 'reminder'>('contribution');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states - Contribution
  const [contMemberId, setContMemberId] = useState('');
  const [contMonth, setContMonth] = useState(getCurrentPeriod().month);
  const [contYear, setContYear] = useState(getCurrentPeriod().year);
  const [contAmount, setContAmount] = useState('');
  const [contMethod, setContMethod] = useState<'upi' | 'cash' | 'bank_transfer'>('upi');
  const [contNotes, setContNotes] = useState('');

  // Form states - Loan Disburse
  const [loanMemberId, setLoanMemberId] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanInstallment, setLoanInstallment] = useState('');
  const [loanDisbursedDate, setLoanDisbursedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loanStartDate, setLoanStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loanPurpose, setLoanPurpose] = useState('');

  // Form states - Repayment
  const [repLoanId, setRepLoanId] = useState('');
  const [repAmount, setRepAmount] = useState('');
  const [repDate, setRepDate] = useState(new Date().toISOString().split('T')[0]);
  const [repMethod, setRepMethod] = useState<'upi' | 'cash' | 'bank_transfer'>('upi');
  const [repNotes, setRepNotes] = useState('');

  // Sync tab with default type when opened
  useEffect(() => {
    if (createModalDefaultType) {
      setActiveTab(createModalDefaultType);
    }
    setSuccessMessage(null);
  }, [createModalDefaultType, createModalOpen]);

  // Pre-fill contribution amount when member is selected
  useEffect(() => {
    if (contMemberId) {
      const mem = members.find((m) => m.id === contMemberId);
      if (mem && !contAmount) {
        setContAmount(String(mem.monthly_share));
      }
    }
  }, [contMemberId, members]);

  // Pre-fill repayment amount when loan is selected
  useEffect(() => {
    if (repLoanId) {
      const ln = loans.find((l) => l.id === repLoanId);
      if (ln && !repAmount) {
        setRepAmount(String(Math.min(ln.monthly_installment, ln.remaining_balance)));
      }
    }
  }, [repLoanId, loans]);

  if (!createModalOpen) return null;

  const activeMembers = members.filter((m) => m.status === 'active');
  const activeLoans = loans.filter((l) => l.status === 'active' && l.remaining_balance > 0);

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contMemberId || !contAmount) return;

    await logContribution({
      member_id: contMemberId,
      period_month: Number(contMonth),
      period_year: Number(contYear),
      amount: Number(contAmount),
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: contMethod,
      reference_note: contNotes || undefined,
    });

    setSuccessMessage('Contribution recorded successfully');
    setTimeout(() => {
      setCreateModalOpen(false);
      setContMemberId('');
      setContAmount('');
      setContNotes('');
    }, 900);
  };

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const principal = Number(loanAmount);
    const installment = Number(loanInstallment);
    if (!loanMemberId || !principal || !installment) return;

    if (principal > poolMetrics.availablePoolBalance) {
      const confirmLow = window.confirm(
        `Warning: Principal (${formatINR(principal)}) exceeds current available pool balance (${formatINR(poolMetrics.availablePoolBalance)}). Proceed anyway?`
      );
      if (!confirmLow) return;
    }

    const loanNo = `QEH-${contYear}-${String(loans.length + 1).padStart(3, '0')}`;
    await disburseLoan({
      member_id: loanMemberId,
      loan_no: loanNo,
      principal_amount: principal,
      monthly_installment: installment,
      disbursed_date: loanDisbursedDate,
      repayment_start_date: loanStartDate,
      purpose: loanPurpose || undefined,
    });

    setSuccessMessage('Qarz-e-Hasan loan disbursed successfully');
    setTimeout(() => {
      setCreateModalOpen(false);
      setLoanMemberId('');
      setLoanAmount('');
      setLoanInstallment('');
      setLoanPurpose('');
    }, 900);
  };

  const handleRepaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetLoan = loans.find((l) => l.id === repLoanId);
    const amount = Number(repAmount);
    if (!targetLoan || !amount) return;

    await logRepayment({
      loan_id: targetLoan.id,
      member_id: targetLoan.member_id,
      amount,
      repayment_date: repDate,
      payment_method: repMethod,
      notes: repNotes || undefined,
    });

    setSuccessMessage('Loan repayment recorded successfully');
    setTimeout(() => {
      setCreateModalOpen(false);
      setRepLoanId('');
      setRepAmount('');
      setRepNotes('');
    }, 900);
  };

  return (
    <Modal
      isOpen={createModalOpen}
      onClose={() => setCreateModalOpen(false)}
      title={t('modal.title')}
      subtitle={t('modal.subtitle')}
      maxWidth="md"
    >
      <div>
        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('contribution'); setSuccessMessage(null); }}
            className={`py-2 px-1 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === 'contribution'
                ? 'bg-white text-forest-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard size={16} />
            <span className="truncate">{t('modal.tabShare')}</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('loan'); setSuccessMessage(null); }}
            className={`py-2 px-1 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === 'loan'
                ? 'bg-white text-forest-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HandCoins size={16} />
            <span className="truncate">{t('modal.tabLoan')}</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('repayment'); setSuccessMessage(null); }}
            className={`py-2 px-1 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === 'repayment'
                ? 'bg-white text-forest-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw size={16} />
            <span className="truncate">{t('modal.tabRepay')}</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('reminder'); setSuccessMessage(null); }}
            className={`py-2 px-1 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === 'reminder'
                ? 'bg-white text-forest-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare size={16} />
            <span className="truncate">{t('modal.tabReminder')}</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: Log Monthly Share */}
        {activeTab === 'contribution' && (
          <form onSubmit={handleContributionSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('modal.selectMember')} *
              </label>
              <select
                required
                value={contMemberId}
                onChange={(e) => {
                  setContMemberId(e.target.value);
                  const mem = members.find((m) => m.id === e.target.value);
                  if (mem) setContAmount(String(mem.monthly_share));
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
              >
                <option value="">{t('modal.selectMember')}...</option>
                {activeMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.member_no} — {m.name} (Share: {formatINR(m.monthly_share)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modal.month')}
                </label>
                <select
                  value={contMonth}
                  onChange={(e) => setContMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {getLocalizedMonthName(m, appLanguage === 'hi' ? 'hi' : appLanguage === 'mr' ? 'mr' : 'en')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modal.year')}
                </label>
                <input
                  type="number"
                  value={contYear}
                  onChange={(e) => setContYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modal.amount')} *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={contAmount}
                  onChange={(e) => setContAmount(e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modal.paymentMethod')}
                </label>
                <select
                  value={contMethod}
                  onChange={(e) => setContMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
                >
                  <option value="upi">{t('modal.methodUpi')}</option>
                  <option value="cash">{t('modal.methodCash')}</option>
                  <option value="bank_transfer">{t('modal.methodBank')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('modal.notes')}
              </label>
              <input
                type="text"
                value={contNotes}
                onChange={(e) => setContNotes(e.target.value)}
                placeholder="e.g. Transaction ID or Cash Handover"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              {t('modal.saveShare')}
            </button>
          </form>
        )}

        {/* TAB 2: Disburse Qarz-e-Hasan Loan */}
        {activeTab === 'loan' && (
          <form onSubmit={handleLoanSubmit} className="space-y-3.5">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">{t('home.availablePool', 'Available Pool Balance')}:</span>
              <span className="font-bold text-forest-800">{formatINR(poolMetrics.availablePoolBalance)}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('loans.borrower', 'Borrower (Member)')} *
              </label>
              <select
                required
                value={loanMemberId}
                onChange={(e) => setLoanMemberId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
              >
                <option value="">{t('modal.selectMember', 'Select member for loan...')}</option>
                {activeMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.member_no} — {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modal.loanAmount', 'Principal Amount (₹)')} *
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modal.monthlyInstallment', 'Monthly Installment (₹)')} *
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="100"
                  value={loanInstallment}
                  onChange={(e) => setLoanInstallment(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modal.disbursedDate', 'Disbursed Date')}
                </label>
                <input
                  type="date"
                  value={loanDisbursedDate}
                  onChange={(e) => setLoanDisbursedDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modal.firstRepaymentDate', 'Repayment Starts')}
                </label>
                <input
                  type="date"
                  value={loanStartDate}
                  onChange={(e) => setLoanStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('modal.loanPurpose', 'Loan Purpose / Notes (Optional)')}
              </label>
              <input
                type="text"
                value={loanPurpose}
                onChange={(e) => setLoanPurpose(e.target.value)}
                placeholder="e.g. Small business inventory, emergency medical"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              {t('modal.disburseLoanBtn', 'Disburse Qarz-e-Hasan Loan')}
            </button>
          </form>
        )}

        {/* TAB 3: Log Loan Repayment */}
        {activeTab === 'repayment' && (
          <form onSubmit={handleRepaymentSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('modal.selectLoan', 'Select Active Loan')} *
              </label>
              <select
                required
                value={repLoanId}
                onChange={(e) => {
                  setRepLoanId(e.target.value);
                  const ln = loans.find((l) => l.id === e.target.value);
                  if (ln) setRepAmount(String(Math.min(ln.monthly_installment, ln.remaining_balance)));
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
              >
                <option value="">{t('modal.selectLoan', 'Select loan to repay...')}</option>
                {activeLoans.map((l) => {
                  const borrower = members.find((m) => m.id === l.member_id);
                  return (
                    <option key={l.id} value={l.id}>
                      {borrower ? borrower.name : l.loan_no} — Bal: {formatINR(l.remaining_balance)} (Inst: {formatINR(l.monthly_installment)})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modal.amount', 'Repayment Amount (₹)')} *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={repAmount}
                  onChange={(e) => setRepAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modal.paymentMethod', 'Method')}
                </label>
                <select
                  value={repMethod}
                  onChange={(e) => setRepMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
                >
                  <option value="upi">{t('modal.methodUpi', 'UPI (Direct to Society)')}</option>
                  <option value="cash">{t('modal.methodCash', 'Cash')}</option>
                  <option value="bank_transfer">{t('modal.methodBank', 'Bank Transfer')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('modal.repayDate', 'Date')}
              </label>
              <input
                type="date"
                value={repDate}
                onChange={(e) => setRepDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('modal.notes', 'Notes')}
              </label>
              <input
                type="text"
                value={repNotes}
                onChange={(e) => setRepNotes(e.target.value)}
                placeholder="e.g. Installment 3 paid via UPI"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              {t('modal.saveRepayment', 'Record Loan Repayment')}
            </button>
          </form>
        )}

        {/* TAB 4: WhatsApp Reminder Quick Trigger */}
        {activeTab === 'reminder' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Pick any member to instantly prepare and preview a polite WhatsApp reminder with exact dues and direct UPI payment link.
            </p>
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {activeMembers.map((m) => {
                const activeLoan = loans.find((l) => l.member_id === m.id && l.status === 'active');
                const loanDue = activeLoan ? Math.min(activeLoan.monthly_installment, activeLoan.remaining_balance) : 0;
                const totalDue = m.monthly_share + loanDue;

                return (
                  <div key={m.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{m.name}</span>
                      <span className="text-[11px] text-slate-500">{m.phone} • Share: {formatINR(m.monthly_share)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateModalOpen(false);
                        openWhatsAppModal({
                          memberId: m.id,
                          memberName: m.name,
                          memberPhone: m.phone,
                          societyName: society.name,
                          monthName: getMonthName(getCurrentPeriod().month),
                          monthNumber: getCurrentPeriod().month,
                          monthlyShareDue: m.monthly_share,
                          loanDue: loanDue > 0 ? loanDue : undefined,
                          totalDue,
                          upiId: society.upi_id,
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare size={13} />
                      <span>{t('modal.prepareReminder', 'Prepare')}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
