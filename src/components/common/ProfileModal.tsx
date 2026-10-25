import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  KeyRound,
  Calendar,
  Clock,
  CreditCard,
  HandCoins,
  History,
  CheckCircle2,
  Phone,
  Hash,
  X,
  Lock,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { formatINR, formatDate, formatPhone } from '../../utils/formatters';
import { getLocalizedEntityName } from '../../i18n/translations';
import { Modal } from './Modal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    members,
    contributions,
    repayments,
    loans,
    openPasswordModal,
    logout,
    isAdmin,
    appLanguage,
    t,
  } = useSociety();

  const [activeSubTab, setActiveSubTab] = useState<'info' | 'history'>('info');

  if (!isOpen || !currentUser) return null;

  // Find corresponding member record if member
  const currentMember = currentUser.account_no
    ? members.find((m) => m.account_no === currentUser.account_no)
    : null;

  const activeLoan = currentMember
    ? loans.find((l) => l.member_id === currentMember.id && l.status === 'active')
    : null;

  // Payment history for this member
  const paymentHistory = currentMember
    ? [
        ...contributions
          .filter((c) => c.member_id === currentMember.id)
          .map((c) => ({
            id: c.id,
            type: 'contribution' as const,
            title: appLanguage === 'mr'
              ? `मासिक वर्गणी (माहे ${c.period_month}/${c.period_year})`
              : `Monthly Share (Month ${c.period_month}/${c.period_year})`,
            amount: c.amount,
            date: c.payment_date,
            time: c.created_at ? new Date(c.created_at).toLocaleTimeString(appLanguage === 'mr' ? 'mr-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
            method: c.payment_method,
            note: c.reference_note,
          })),
        ...repayments
          .filter((r) => r.member_id === currentMember.id)
          .map((r) => ({
            id: r.id,
            type: 'repayment' as const,
            title: appLanguage === 'mr'
              ? 'कर्ज हप्ता परतावा (Loan Repayment)'
              : 'Loan Installment Repayment',
            amount: r.amount,
            date: r.repayment_date,
            time: r.created_at ? new Date(r.created_at).toLocaleTimeString(appLanguage === 'mr' ? 'mr-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '11:30 AM',
            method: r.payment_method,
            note: r.notes,
          })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('profile.title', 'My Profile & Passbook')} maxWidth="md">
      <div className="space-y-4">
        {/* Profile Card Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg border border-white/30">
              {currentUser.role === 'admin' ? '👑' : <User size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-700/60 text-emerald-200">
                  {currentUser.role === 'admin'
                    ? t('menu.secretaryAdmin', 'Secretary / Admin')
                    : `${t('menu.memberAcc', 'Member')} #${currentUser.account_no}`}
                </span>
              </div>
              <h3 className="text-base font-bold mt-0.5">
                {getLocalizedEntityName(currentUser, appLanguage)}
              </h3>
              {appLanguage === 'mr' && currentUser.name_en && (
                <p className="text-xs text-emerald-200">{currentUser.name_en}</p>
              )}
              {appLanguage !== 'mr' && currentUser.name_mr && (
                <p className="text-xs text-emerald-200">{currentUser.name_mr}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title={t('menu.logout', 'Log Out')}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Sub-tab Switcher (Info vs Payment History) */}
        {currentMember && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveSubTab('info')}
              className={`py-1.5 rounded-lg transition-all ${
                activeSubTab === 'info' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              {t('profile.accountInfo', 'Account Info')}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('history')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeSubTab === 'history' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              <History size={13} />
              <span>{t('profile.paymentHistory', 'Payment History')} ({paymentHistory.length})</span>
            </button>
          </div>
        )}

        {/* Tab 1: Account Info */}
        {activeSubTab === 'info' && (
          <div className="space-y-3">
            {/* Credentials Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock size={14} className="text-emerald-800" />
                  <span>{t('profile.credentials', 'Login Credentials & PIN')}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openPasswordModal(
                      currentUser.role === 'admin'
                        ? { type: 'admin' }
                        : { type: 'member', member: currentMember || undefined }
                    );
                  }}
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <KeyRound size={12} />
                  <span>{t('profile.changePin', 'Change PIN')}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">
                    {appLanguage === 'mr' ? 'मोबाईल नंबर / युझर:' : 'Mobile / Username:'}
                  </span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    {formatPhone(currentUser.phone)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">
                    {appLanguage === 'mr' ? 'सध्याचा पासवर्ड / पिन:' : 'Security PIN / Password:'}
                  </span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    {currentMember?.password || (currentUser.role === 'admin' ? '••••••' : '1234')}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Overview (For Member) */}
            {currentMember && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="text-[11px] font-semibold text-emerald-800 block">
                    {t('profile.cumulativeShares', 'Total Accumulated Shares')}
                  </span>
                  <span className="text-lg font-bold text-emerald-950 mt-0.5 block">
                    {formatINR(currentMember.cumulative_shares || 0)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {appLanguage === 'mr' ? 'दरमहा ₹300/-' : '₹300 / month'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    {t('profile.remainingLoan', 'Active Loan Balance')}
                  </span>
                  <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                    {activeLoan ? formatINR(activeLoan.remaining_balance) : '₹0'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {activeLoan
                      ? (appLanguage === 'mr'
                        ? `हप्ता: ${formatINR(activeLoan.monthly_installment)}/महिना`
                        : `Installment: ${formatINR(activeLoan.monthly_installment)}/mo`)
                      : (appLanguage === 'mr' ? 'कोणतेही कर्ज नाही' : 'No active loan')}
                  </span>
                </div>
              </div>
            )}

            {/* Admin Overview Details */}
            {currentUser.role === 'admin' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck size={14} className="text-amber-800" />
                  <span>
                    {appLanguage === 'mr' ? 'मुख्य ॲडमिन / सेक्रेटरी अधिकार' : 'Administrator & Secretary Access'}
                  </span>
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {appLanguage === 'mr'
                    ? 'आपल्याकडे सर्व 40 सदस्यांची माहिती, शेअर्स, कर्ज वाटप, मासिक रजिस्टर संपादन आणि पासवर्ड रीसेट करण्याचे पूर्ण अधिकार आहेत.'
                    : 'Full administrative access to manage all 40 members, contributions, loan cycles, digital register editing, and password resets.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Chronological Payment History */}
        {activeSubTab === 'history' && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {paymentHistory.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  {t('profile.noHistory', 'No payment history recorded yet.')}
                </p>
              </div>
            ) : (
              paymentHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">{item.title}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{formatDate(item.date)}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock size={11} />
                        <span>{item.time}</span>
                      </span>
                      <span>•</span>
                      <span className="uppercase font-semibold text-emerald-800">{item.method}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-emerald-800 text-sm block">
                      +{formatINR(item.amount)}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                      {t('profile.paid', 'Paid')} ✅
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
        >
          {t('profile.close', 'Close')}
        </button>
      </div>
    </Modal>
  );
};
