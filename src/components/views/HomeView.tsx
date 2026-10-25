import React, { useState } from 'react';
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
  BookOpen,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { formatINR, formatDate } from '../../utils/formatters';
import { getLocalizedMonthName } from '../../i18n/translations';

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
    navigateToTab,
    currentUser,
    sendDueReminders,
    t,
    appLanguage,
  } = useSociety();

  const [sendingDueAlert, setSendingDueAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  // If member is logged in, find their record
  const currentMemberRecord = currentUser?.account_no
    ? members.find((m) => m.account_no === currentUser.account_no)
    : null;

  const currentMemberLoan = currentMemberRecord
    ? loans.find((l) => l.member_id === currentMemberRecord.id && l.status === 'active')
    : null;

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
      const name = m
        ? appLanguage === 'mr'
          ? m.name_mr || m.name
          : m.name_en || m.name
        : appLanguage === 'mr'
        ? 'सभासद'
        : 'Member';
      list.push({
        id: c.id,
        type: 'contribution',
        memberName: name,
        amount: c.amount,
        date: c.payment_date,
        detail:
          appLanguage === 'mr'
            ? `मासिक वर्गणी (${getLocalizedMonthName(c.period_month, appLanguage)})`
            : `Monthly Share (${getLocalizedMonthName(c.period_month, appLanguage)})`,
      });
    });

    repayments.slice(0, 3).forEach((r) => {
      const m = members.find((mem) => mem.id === r.member_id);
      const name = m
        ? appLanguage === 'mr'
          ? m.name_mr || m.name
          : m.name_en || m.name
        : appLanguage === 'mr'
        ? 'कर्जदार'
        : 'Borrower';
      list.push({
        id: r.id,
        type: 'repayment',
        memberName: name,
        amount: r.amount,
        date: r.repayment_date,
        detail: appLanguage === 'mr' ? 'कर्ज हप्ता भरणा' : 'Loan Repayment',
      });
    });

    loans.slice(0, 2).forEach((l) => {
      const m = members.find((mem) => mem.id === l.member_id);
      const name = m
        ? appLanguage === 'mr'
          ? m.name_mr || m.name
          : m.name_en || m.name
        : appLanguage === 'mr'
        ? 'कर्जदार'
        : 'Borrower';
      list.push({
        id: l.id,
        type: 'disbursement',
        memberName: name,
        amount: l.principal_amount,
        date: l.disbursed_date,
        detail: appLanguage === 'mr' ? 'नवीन कर्ज वाटप' : 'New Loan Disbursed',
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [contributions, repayments, loans, members, appLanguage]);

  const handleSendDueAlert = async () => {
    setSendingDueAlert(true);
    try {
      await sendDueReminders();
      setAlertSuccess(true);
      setTimeout(() => setAlertSuccess(false), 2500);
    } finally {
      setSendingDueAlert(false);
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Member Personalized Passbook Card if logged in as Member */}
      {currentMemberRecord && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-700/60">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-300">
                {appLanguage === 'mr' ? 'सभासद पासबुक (Member Passbook)' : 'Member Passbook'}
              </span>
              <h2 className="text-lg font-bold">
                {appLanguage === 'mr'
                  ? `स्वागत आहे, ${currentMemberRecord.name_mr || currentMemberRecord.name}!`
                  : `Welcome, ${currentMemberRecord.name_en || currentMemberRecord.name}!`}
              </h2>
              <p className="text-xs text-emerald-200">
                {appLanguage === 'mr'
                  ? `अकौंट नं. #${currentMemberRecord.account_no} • मासिक वर्गणी ₹${currentMemberRecord.monthly_share}/-`
                  : `Account #${currentMemberRecord.account_no} • Monthly Share ₹${currentMemberRecord.monthly_share}`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => openQrModal(currentMemberRecord.monthly_share, `Acc#${currentMemberRecord.account_no} Share`)}
              className="py-2 px-3.5 bg-white text-emerald-900 rounded-xl text-xs font-bold self-start sm:self-auto hover:bg-emerald-50 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <QrCode size={15} />
              <span>
                {appLanguage === 'mr'
                  ? `UPI द्वारे ₹${currentMemberRecord.monthly_share} भरा`
                  : `Pay ₹${currentMemberRecord.monthly_share} via UPI`}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
            <div className="p-2.5 bg-emerald-900/50 rounded-xl border border-emerald-700/40">
              <span className="text-[11px] text-emerald-300 block">
                {appLanguage === 'mr' ? 'एकूण जमा शेअर्स' : 'Total Accumulated Shares'}
              </span>
              <span className="text-base font-bold text-white">
                {formatINR(currentMemberRecord.cumulative_shares || 0)}
              </span>
            </div>

            <div className="p-2.5 bg-emerald-900/50 rounded-xl border border-emerald-700/40">
              <span className="text-[11px] text-emerald-300 block">
                {appLanguage === 'mr' ? 'चालू कर्ज बाकी' : 'Active Loan Balance'}
              </span>
              <span className="text-base font-bold text-amber-300">
                {currentMemberLoan
                  ? formatINR(currentMemberLoan.remaining_balance)
                  : appLanguage === 'mr'
                  ? 'Nil (कोणतेही कर्ज नाही)'
                  : 'Nil (No Loan)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 1. Pool Balance Hero Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-sm">
              <Vault size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {t('home.availablePool')}
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
              <span>{t('header.societyQr')}</span>
            </button>
            <button
              type="button"
              onClick={() => openCreateModal('contribution')}
              className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle size={15} />
              <span>{appLanguage === 'mr' ? 'वर्गणी नोंदवा' : 'Record Share'}</span>
            </button>
          </div>
        </div>

        {/* Financial Flow Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-slate-500 block text-[11px] font-medium">{t('home.openingPool', 'Starting Balance')}</span>
            <span className="font-bold text-slate-800">{formatINR(poolMetrics.openingBalance)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-slate-500 block text-[11px] font-medium">{t('home.totalCollected', 'Total Shares Collected')}</span>
            <span className="font-bold text-emerald-800">+{formatINR(poolMetrics.totalContributions)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-slate-500 block text-[11px] font-medium">{t('home.loansDisbursed', 'Loans Given')}</span>
            <span className="font-bold text-rose-800">-{formatINR(poolMetrics.totalDisbursedLoans)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-slate-500 block text-[11px] font-medium">{t('home.repaymentsRecovered', 'Loan Money Returned')}</span>
            <span className="font-bold text-emerald-800">+{formatINR(poolMetrics.totalRepayments)}</span>
          </div>
        </div>
      </div>

      {/* Digital Register Quick Jump Banner */}
      <div
        onClick={() => navigateToTab('register')}
        className="p-4 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 rounded-3xl transition-all cursor-pointer flex items-center justify-between shadow-2xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {appLanguage === 'mr' ? 'मासिक नोंदवही रजिस्टर (Digital Ledger)' : 'Monthly Digital Register'}
            </h4>
            <p className="text-xs text-slate-600">
              {appLanguage === 'mr'
                ? 'सर्व 40 सभासदांचे शेअर्स, कर्जाचे हप्ते व रोख ताळेबंद पत्रक पहा किंवा A4 शीट प्रिंट करा.'
                : 'View monthly share collections, loan installments, and cash reconciliation sheet for all 40 members.'}
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-emerald-800 shrink-0" />
      </div>

      {/* 2. Monthly Collection Target Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-emerald-800" />
            <h3 className="text-sm font-bold text-slate-900">
              {getLocalizedMonthName(monthMetrics.month, appLanguage)} {monthMetrics.year} {t('home.monthlyCollection', 'Collection')}
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {monthMetrics.collectionPercentage}% {t('home.collected', 'Collected')}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden mb-3.5 p-0.5">
          <div
            className="bg-emerald-800 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, monthMetrics.collectionPercentage)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">{t('home.collected', 'Collected')}</span>
            <span className="font-bold text-slate-900">{formatINR(monthMetrics.collectedAmount)}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">{t('home.pendingDue', 'Pending Due')}</span>
            <span className="font-bold text-amber-700">{formatINR(monthMetrics.pendingAmount)}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">{t('home.paidMembers', 'Paid Members')}</span>
            <span className="font-bold text-slate-900">
              {monthMetrics.paidMembersCount} / {monthMetrics.paidMembersCount + monthMetrics.unpaidMembersCount}
            </span>
          </div>
        </div>
      </div>

      {/* 3. High-Priority Defaulters Radar */}
      {defaulters.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-amber-800">
              <ShieldAlert size={18} />
              <h3 className="text-sm font-bold text-slate-900">
                {t('home.pendingDues')} ({defaulters.length} {appLanguage === 'mr' ? 'सभासद' : 'Members'})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendDueAlert}
                disabled={sendingDueAlert}
                className="py-1 px-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                title="Send automated push notification"
              >
                <Bell size={12} />
                <span>
                  {sendingDueAlert
                    ? appLanguage === 'mr'
                      ? 'पाठवत आहे...'
                      : 'Sending...'
                    : alertSuccess
                    ? appLanguage === 'mr'
                      ? 'सूचना पाठवली! ✅'
                      : 'Sent! ✅'
                    : appLanguage === 'mr'
                    ? '📢 थकीत आठवण सूचना पाठवा'
                    : '📢 Send Due Reminders'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('loans')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-0.5"
              >
                <span>{t('home.viewAll', 'View All')}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {defaulters.slice(0, 4).map((item) => (
              <div
                key={item.member.id}
                className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                      #{item.member.account_no}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {appLanguage === 'mr'
                        ? item.member.name_mr || item.member.name
                        : item.member.name_en || item.member.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {item.type === 'both'
                        ? t('home.dueBoth', 'Share + Loan Due')
                        : item.type === 'loan'
                        ? t('home.dueLoan', 'Loan Installment Due')
                        : `${item.contributionMonthsOverdue} ${t('home.monthsOverdue')}`}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {t('home.totalDue')}: <strong className="text-slate-800">{formatINR(item.totalDue)}</strong>
                  </span>
                </div>

                {/* 1-Tap WhatsApp Reminder */}
                <button
                  type="button"
                  onClick={() =>
                    openWhatsAppModal({
                      memberId: item.member.id,
                      memberName:
                        appLanguage === 'mr'
                          ? item.member.name_mr || item.member.name
                          : item.member.name_en || item.member.name,
                      memberPhone: item.member.phone,
                      societyName: society.name,
                      monthName: monthMetrics.monthName,
                      monthNumber: monthMetrics.month,
                      monthlyShareDue: item.contributionAmountDue || undefined,
                      loanDue: item.loanOverdueAmount || undefined,
                      totalDue: item.totalDue,
                      upiId: society.upi_id,
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Send WhatsApp Reminder"
                >
                  <MessageSquare size={13} />
                  <span>{t('home.remind')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Recent Transactions Stream */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-slate-900">{t('home.recentTxns', 'Recent Activity')}</h3>
          <span className="text-xs text-slate-500">{t('home.liveRecords', 'Live Fund Records')}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivities.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    act.type === 'disbursement'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-emerald-50 text-emerald-800'
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
                  act.type === 'disbursement' ? 'text-rose-700' : 'text-emerald-800'
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
