import React, { useState } from 'react';
import {
  HandCoins,
  ShieldAlert,
  Archive,
  RotateCcw,
  MessageSquare,
  PlusCircle,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { formatINR, formatDate, getMonthName } from '../../utils/formatters';

export const LoansView: React.FC = () => {
  const {
    loans,
    members,
    defaulters,
    openCreateModal,
    openWhatsAppModal,
    society,
    selectedPeriod,
    t,
  } = useSociety();

  const [activeTab, setActiveTab] = useState<'active' | 'defaulters' | 'closed'>('active');

  const activeLoans = loans.filter((l) => l.status === 'active');
  const closedLoans = loans.filter((l) => l.status === 'closed');

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t('loans.title', 'Qarz-e-Hasan Loans')}</h2>
          <p className="text-xs text-slate-500">
            {t('loans.subtitle', 'Interest-free loan cycle management & defaulter tracking')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCreateModal('loan')}
          className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <PlusCircle size={15} />
          <span>{t('loans.disburseNewLoan', 'New Loan')}</span>
        </button>
      </div>

      {/* Sub-tab Switcher */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`py-2 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-white text-forest-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HandCoins size={15} />
          <span>{t('loans.activeLoansCount', 'Active')} ({activeLoans.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('defaulters')}
          className={`py-2 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'defaulters'
              ? 'bg-white text-amber-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert size={15} />
          <span>{t('home.pendingDues', 'Defaulters')} ({defaulters.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('closed')}
          className={`py-2 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'closed'
              ? 'bg-white text-forest-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Archive size={15} />
          <span>Closed ({closedLoans.length})</span>
        </button>
      </div>

      {/* TAB 1: Active Loans */}
      {activeTab === 'active' && (
        <div className="space-y-3">
          {activeLoans.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl">
              <HandCoins size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No active Qarz-e-Hasan loans</p>
              <p className="text-xs text-slate-500 mt-1">
                Disburse interest-free loans to community members using the button above.
              </p>
            </div>
          ) : (
            activeLoans.map((loan) => {
              const borrower = members.find((m) => m.id === loan.member_id);
              const repaid = loan.principal_amount - loan.remaining_balance;
              const percentRepaid = Math.min(100, Math.round((repaid / loan.principal_amount) * 100));

              return (
                <div
                  key={loan.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {loan.loan_no}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {borrower ? borrower.name : 'Unknown Member'}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Disbursed on {formatDate(loan.disbursed_date)} • Monthly Inst:{' '}
                        <strong className="text-slate-800">{formatINR(loan.monthly_installment)}</strong>
                      </p>
                      {loan.purpose && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">
                          Purpose: {loan.purpose}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-400 block">Remaining</span>
                      <span className="text-base font-extrabold text-forest-800">
                        {formatINR(loan.remaining_balance)}
                      </span>
                    </div>
                  </div>

                  {/* Repayment Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Repaid: {formatINR(repaid)} ({percentRepaid}%)</span>
                      <span>Total: {formatINR(loan.principal_amount)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-forest-800 h-full rounded-full transition-all"
                        style={{ width: `${percentRepaid}%` }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Borrower Phone: {borrower?.phone || '--'}
                    </span>
                    <div className="flex items-center gap-2">
                      {borrower && (
                        <button
                          type="button"
                          onClick={() => {
                            openWhatsAppModal({
                              memberId: borrower.id,
                              memberName: borrower.name,
                              memberPhone: borrower.phone,
                              societyName: society.name,
                              monthName: selectedPeriod.monthName,
                              monthNumber: selectedPeriod.month,
                              loanDue: Math.min(loan.monthly_installment, loan.remaining_balance),
                              totalDue: Math.min(loan.monthly_installment, loan.remaining_balance),
                              upiId: society.upi_id,
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare size={13} />
                          <span>{t('loans.remind', 'Remind')}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openCreateModal('repayment')}
                        className="px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <RotateCcw size={13} />
                        <span>{t('loans.repay', 'Log Repay')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Defaulters Radar */}
      {activeTab === 'defaulters' && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
            <ShieldAlert size={18} className="text-amber-700 shrink-0" />
            <div>
              <p className="font-bold">Automated Defaulters Detection</p>
              <p className="text-amber-800/90 text-[11px]">
                Tracks both monthly share arrears and overdue Qarz-e-Hasan loan installments. One tap opens WhatsApp with exact dues.
              </p>
            </div>
          </div>

          {defaulters.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700">All Accounts are Up to Date!</p>
              <p className="text-xs text-slate-500 mt-1">
                Zero defaulters on record for monthly contributions and loan repayments.
              </p>
            </div>
          ) : (
            defaulters.map((item) => (
              <div
                key={item.member.id}
                className="bg-white border border-amber-200/90 rounded-2xl p-4 shadow-sm hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {item.member.member_no}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{item.member.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {item.type === 'both'
                        ? 'Share + Loan Overdue'
                        : item.type === 'loan'
                        ? 'Loan Overdue'
                        : `${item.contributionMonthsOverdue} mo overdue`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>Phone: {item.member.phone}</span>
                    {item.contributionAmountDue > 0 && (
                      <span>Share Due: <strong>{formatINR(item.contributionAmountDue)}</strong></span>
                    )}
                    {item.loanOverdueAmount > 0 && (
                      <span>Loan Inst: <strong>{formatINR(item.loanOverdueAmount)}</strong></span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Total Due</span>
                    <span className="text-base font-extrabold text-amber-900">
                      {formatINR(item.totalDue)}
                    </span>
                  </div>

                  {/* 1-Tap WhatsApp Nudge */}
                  <button
                    type="button"
                    onClick={() => {
                      openWhatsAppModal({
                        memberId: item.member.id,
                        memberName: item.member.name,
                        memberPhone: item.member.phone,
                        societyName: society.name,
                        monthName: selectedPeriod.monthName,
                        monthNumber: selectedPeriod.month,
                        monthlyShareDue: item.contributionAmountDue || undefined,
                        loanDue: item.loanOverdueAmount || undefined,
                        totalDue: item.totalDue,
                        upiId: society.upi_id,
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <MessageSquare size={14} />
                    <span>WhatsApp Nudge</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Closed Loans Archive */}
      {activeTab === 'closed' && (
        <div className="space-y-3">
          {closedLoans.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl">
              <Archive size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No closed loans yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Loans will appear here once completely repaid by the borrower.
              </p>
            </div>
          ) : (
            closedLoans.map((loan) => {
              const borrower = members.find((m) => m.id === loan.member_id);
              return (
                <div
                  key={loan.id}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {borrower ? borrower.name : loan.loan_no}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {loan.loan_no} • Disbursed {formatDate(loan.disbursed_date)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      {formatINR(loan.principal_amount)}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Fully Repaid
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
