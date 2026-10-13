import React from 'react';
import {
  Vault,
  Coins,
  HandCoins,
  RotateCcw,
  Users,
  AlertTriangle,
  QrCode,
  PlusCircle,
  MessageSquare,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { formatINR, formatDate, getMonthName } from '../../utils/formatters';

export const HomeView: React.FC = () => {
  const {
    society,
    poolMetrics,
    monthMetrics,
    defaulters,
    contributions,
    loans,
    repayments,
    members,
    openCreateModal,
    openQrModal,
    openWhatsAppModal,
    setActiveTab,
    setSelectedMemberForDetail,
  } = useSociety();

  // Combine recent activity
  const recentActivities = React.useMemo(() => {
    const list: Array<{
      id: string;
      type: 'contribution' | 'disbursement' | 'repayment';
      memberName: string;
      amount: number;
      date: string;
      detail?: string;
    }> = [];

    contributions.slice(0, 4).forEach((c) => {
      const m = members.find((mem) => mem.id === c.member_id);
      list.push({
        id: c.id,
        type: 'contribution',
        memberName: m ? m.name : 'Member',
        amount: c.amount,
        date: c.payment_date,
        detail: `Monthly Share (${getMonthName(c.period_month)})`,
      });
    });

    repayments.slice(0, 3).forEach((r) => {
      const m = members.find((mem) => mem.id === r.member_id);
      list.push({
        id: r.id,
        type: 'repayment',
        memberName: m ? m.name : 'Borrower',
        amount: r.amount,
        date: r.repayment_date,
        detail: 'Qarz-e-Hasan Repayment',
      });
    });

    loans.slice(0, 2).forEach((l) => {
      const m = members.find((mem) => mem.id === l.member_id);
      list.push({
        id: l.id,
        type: 'disbursement',
        memberName: m ? m.name : 'Borrower',
        amount: l.principal_amount,
        date: l.disbursed_date,
        detail: 'Loan Disbursed',
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [contributions, repayments, loans, members]);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* 1. Pool Balance Hero Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-forest-800 text-white flex items-center justify-center shadow-sm">
              <Vault size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Available Liquidity Pool
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatINR(poolMetrics.availablePoolBalance)}
              </h2>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openQrModal()}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <QrCode size={15} />
              <span>UPI QR</span>
            </button>
            <button
              type="button"
              onClick={() => openCreateModal('contribution')}
              className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle size={15} />
              <span>Log Pay</span>
            </button>
          </div>
        </div>

        {/* Financial Flow Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-slate-500 block text-[11px] font-medium">Opening Pool</span>
            <span className="font-bold text-slate-800">{formatINR(poolMetrics.openingBalance)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-slate-500 block text-[11px] font-medium">Total Collected</span>
            <span className="font-bold text-emerald-800">+{formatINR(poolMetrics.totalContributions)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-slate-500 block text-[11px] font-medium">Loans Disbursed</span>
            <span className="font-bold text-rose-800">-{formatINR(poolMetrics.totalDisbursedLoans)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-slate-500 block text-[11px] font-medium">Repayments Recovered</span>
            <span className="font-bold text-emerald-800">+{formatINR(poolMetrics.totalRepayments)}</span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Collection Target Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-forest-800" />
            <h3 className="text-sm font-bold text-slate-900">
              {monthMetrics.monthName} {monthMetrics.year} Collection
            </h3>
          </div>
          <span className="text-xs font-bold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-200">
            {monthMetrics.collectionPercentage}% Collected
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden mb-3.5 p-0.5">
          <div
            className="bg-forest-800 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, monthMetrics.collectionPercentage)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Collected</span>
            <span className="font-bold text-slate-900">{formatINR(monthMetrics.collectedAmount)}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Pending Due</span>
            <span className="font-bold text-amber-700">{formatINR(monthMetrics.pendingAmount)}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Paid Members</span>
            <span className="font-bold text-slate-900">
              {monthMetrics.paidMembersCount} / {monthMetrics.paidMembersCount + monthMetrics.unpaidMembersCount}
            </span>
          </div>
        </div>
      </div>

      {/* 3. High-Priority Defaulters Radar */}
      {defaulters.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2 text-amber-800">
              <ShieldAlert size={18} />
              <h3 className="text-sm font-bold text-slate-900">
                Action Needed: Defaulters ({defaulters.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('loans')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {defaulters.slice(0, 3).map((item) => (
              <div
                key={item.member.id}
                className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{item.member.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {item.type === 'both'
                        ? 'Share + Loan Due'
                        : item.type === 'loan'
                        ? 'Loan Installment Due'
                        : `${item.contributionMonthsOverdue} mo overdue`}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Total Due: <strong className="text-slate-800">{formatINR(item.totalDue)}</strong>
                  </span>
                </div>

                {/* 1-Tap WhatsApp Reminder */}
                <button
                  type="button"
                  onClick={() =>
                    openWhatsAppModal({
                      memberName: item.member.name,
                      societyName: society.name,
                      monthName: monthMetrics.monthName,
                      monthlyShareDue: item.contributionAmountDue || undefined,
                      loanDue: item.loanOverdueAmount || undefined,
                      totalDue: item.totalDue,
                      upiId: society.upi_id,
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Send WhatsApp Reminder"
                >
                  <MessageSquare size={13} />
                  <span>Remind</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Recent Transactions Stream */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
          <span className="text-xs text-slate-500">Live Pool Records</span>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivities.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    act.type === 'disbursement'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-emerald-50 text-forest-800'
                  }`}
                >
                  {act.type === 'disbursement' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{act.memberName}</span>
                  <span className="text-[11px] text-slate-500">{act.detail} • {formatDate(act.date)}</span>
                </div>
              </div>
              <span
                className={`text-xs font-bold ${
                  act.type === 'disbursement' ? 'text-rose-700' : 'text-forest-800'
                }`}
              >
                {act.type === 'disbursement' ? '-' : '+'}
                {formatINR(act.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
