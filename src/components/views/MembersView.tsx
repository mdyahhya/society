import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  MessageSquare,
  CreditCard,
  HandCoins,
  ChevronRight,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { Member } from '../../types';
import {
  formatINR,
  formatDate,
  formatPhone,
  getCurrentPeriod,
} from '../../utils/formatters';
import { getLocalizedMonthName } from '../../i18n/translations';
import { Modal } from '../common/Modal';
import { MemberFormModal } from '../modals/MemberFormModal';

export const MembersView: React.FC = () => {
  const {
    members,
    deleteMember,
    isMemberPaidInPeriod,
    getMemberActiveLoan,
    getMemberContributionHistory,
    getMemberRepayments,
    selectedPeriod,
    openCreateModal,
    openWhatsAppModal,
    society,
    selectedMemberForDetail,
    setSelectedMemberForDetail,
    openMemberDetail,
    isAdmin,
    openPasswordModal,
    t,
    appLanguage,
  } = useSociety();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'loan'>('all');
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(searchLower) ||
      (m.name_mr && m.name_mr.includes(searchQuery)) ||
      (m.name_en && m.name_en.toLowerCase().includes(searchLower)) ||
      m.phone.includes(searchQuery) ||
      String(m.account_no) === searchQuery ||
      m.member_no.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    const isPaid = isMemberPaidInPeriod(m.id, selectedPeriod.year, selectedPeriod.month);
    const hasLoan = Boolean(getMemberActiveLoan(m.id));

    if (filter === 'paid') return isPaid;
    if (filter === 'unpaid') return !isPaid;
    if (filter === 'loan') return hasLoan;
    return true;
  });

  const handleOpenAdd = () => {
    setMemberToEdit(null);
    setIsMemberFormOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setMemberToEdit(m);
    setIsMemberFormOpen(true);
  };

  const handleDeleteMember = async (id: string, name: string) => {
    const confirmMsg =
      appLanguage === 'mr'
        ? `तुम्हाला खात्री आहे का की सभासद "${name}" यांना काढून टाकायचे आहे?`
        : `Are you sure you want to remove member "${name}"?`;
    if (window.confirm(confirmMsg)) {
      await deleteMember(id);
      if (selectedMemberForDetail?.id === id) {
        setSelectedMemberForDetail(null);
      }
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {appLanguage === 'mr' ? 'सभासद सूची (Members Directory)' : 'Members Directory'}
          </h2>
          <p className="text-xs text-slate-500">
            {appLanguage === 'mr'
              ? `एकूण ${members.length} सभासद • अकौंट नं. 1 ते 40 • मासिक वर्गणी ₹300/-`
              : `Total ${members.length} Members • Accounts #1 to 40 • Monthly Share ₹300`}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="py-2 px-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <UserPlus size={15} />
            <span>{appLanguage === 'mr' ? 'नवीन सभासद जोडा' : 'Add New Member'}</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              appLanguage === 'mr'
                ? 'नाव, अकौंट नं. (1-40), किंवा मोबाईल नंबर शोधा...'
                : 'Search by name, account # (1-40), or mobile...'
            }
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
            }`}
          >
            {appLanguage === 'mr' ? `सर्व (${members.length})` : `All (${members.length})`}
          </button>
          <button
            type="button"
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'paid' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
            }`}
          >
            {appLanguage === 'mr' ? 'वर्गणी भरलेले' : 'Paid'}
          </button>
          <button
            type="button"
            onClick={() => setFilter('unpaid')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'unpaid' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600'
            }`}
          >
            {appLanguage === 'mr' ? 'बाकीदार' : 'Due / Unpaid'}
          </button>
          <button
            type="button"
            onClick={() => setFilter('loan')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'loan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            {appLanguage === 'mr' ? 'कर्जदार' : 'On Loan'}
          </button>
        </div>
      </div>

      {/* Members List Cards */}
      <div className="space-y-2.5">
        {filteredMembers.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
            <Users size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {appLanguage === 'mr' ? 'कोणतेही सभासद सापडले नाहीत' : 'No members found'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {appLanguage === 'mr'
                ? 'कृपया शोध शब्द किंवा फिल्टर बदलून पहा.'
                : 'Please try a different search query or filter.'}
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const isPaid = isMemberPaidInPeriod(member.id, selectedPeriod.year, selectedPeriod.month);
            const activeLoan = getMemberActiveLoan(member.id);

            return (
              <div
                key={member.id}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Member Identity Details */}
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => openMemberDetail(member)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                      #{member.account_no}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-800 transition-colors">
                      {appLanguage === 'mr' ? (member.name_mr || member.name) : (member.name_en || member.name)}
                    </h3>
                    <span className="text-xs text-slate-400 font-normal">
                      ({appLanguage === 'mr' ? (member.name_en || member.name) : (member.name_mr || member.name)})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="font-mono">{formatPhone(member.phone)}</span>
                    <span>
                      {appLanguage === 'mr' ? 'मासिक वर्गणी: ' : 'Monthly Share: '}
                      <strong className="text-slate-800 font-semibold">{formatINR(member.monthly_share)}</strong>
                    </span>
                    <span>
                      {appLanguage === 'mr' ? 'जमा शेअर्स: ' : 'Total Shares: '}
                      <strong className="text-emerald-800 font-bold">{formatINR(member.cumulative_shares || 0)}</strong>
                    </span>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 mt-2">
                    {isPaid ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>
                          {appLanguage === 'mr'
                            ? `वर्गणी जमा (${getLocalizedMonthName(selectedPeriod.month, appLanguage)})`
                            : `Paid (${getLocalizedMonthName(selectedPeriod.month, appLanguage)})`}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock size={11} />
                        <span>
                          {appLanguage === 'mr'
                            ? `वर्गणी बाकी (${getLocalizedMonthName(selectedPeriod.month, appLanguage)})`
                            : `Due (${getLocalizedMonthName(selectedPeriod.month, appLanguage)})`}
                        </span>
                      </span>
                    )}

                    {activeLoan && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                        <HandCoins size={11} />
                        <span>
                          {appLanguage === 'mr' ? 'कर्ज बाकी: ' : 'Loan Balance: '}
                          {formatINR(activeLoan.remaining_balance)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* WhatsApp Reminder Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const loanDue = activeLoan
                        ? Math.min(activeLoan.monthly_installment, activeLoan.remaining_balance)
                        : 0;
                      const shareDue = isPaid ? 0 : member.monthly_share;
                      openWhatsAppModal({
                        memberId: member.id,
                        memberName: member.name_mr || member.name,
                        memberPhone: member.phone,
                        societyName: society.name,
                        monthName: selectedPeriod.monthName,
                        monthNumber: selectedPeriod.month,
                        monthlyShareDue: shareDue > 0 ? shareDue : undefined,
                        loanDue: loanDue > 0 ? loanDue : undefined,
                        totalDue: shareDue + loanDue,
                        upiId: society.upi_id,
                      });
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                    title={appLanguage === 'mr' ? 'WhatsApp आठवण मेसेज पाठवा' : 'Send WhatsApp Reminder'}
                  >
                    <MessageSquare size={15} />
                  </button>

                  {/* Quick Contribution / Pay */}
                  {!isPaid && (
                    <button
                      type="button"
                      onClick={() => openCreateModal('contribution')}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <CreditCard size={13} />
                      <span>{appLanguage === 'mr' ? 'नोंदवा' : 'Pay'}</span>
                    </button>
                  )}

                  {/* Admin Controls: Edit, Password, Delete */}
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(member)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                        title={appLanguage === 'mr' ? 'सभासद माहिती बदला (Edit)' : 'Edit Member'}
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => openPasswordModal({ type: 'member', member })}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-amber-700 border border-slate-200 transition-colors"
                        title={appLanguage === 'mr' ? 'पासवर्ड / पिन बदला (Change PIN)' : 'Change PIN'}
                      >
                        <KeyRound size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member.id, member.name)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 transition-colors"
                        title={appLanguage === 'mr' ? 'सभासद काढा (Delete)' : 'Delete Member'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}

                  {/* Chevron to view ledger */}
                  <button
                    type="button"
                    onClick={() => openMemberDetail(member)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Member Form Modal (Add / Edit) */}
      <MemberFormModal
        isOpen={isMemberFormOpen}
        onClose={() => setIsMemberFormOpen(false)}
        memberToEdit={memberToEdit}
      />

      {/* Member Details Drawer Modal */}
      {selectedMemberForDetail && (
        <Modal
          isOpen={Boolean(selectedMemberForDetail)}
          onClose={() => setSelectedMemberForDetail(null)}
          title={`#${selectedMemberForDetail.account_no} ${
            appLanguage === 'mr'
              ? selectedMemberForDetail.name_mr || selectedMemberForDetail.name
              : selectedMemberForDetail.name_en || selectedMemberForDetail.name
          }`}
          subtitle={`${appLanguage === 'mr' ? 'अकौंट नं.' : 'Account #'} ${
            selectedMemberForDetail.account_no
          } • ${appLanguage === 'mr' ? 'सामील' : 'Joined'}: ${formatDate(
            selectedMemberForDetail.join_date
          )}`}
          maxWidth="lg"
        >
          {(() => {
            const memberHistory = getMemberContributionHistory(selectedMemberForDetail.id);
            const totalContributed = memberHistory.reduce((acc, c) => acc + c.amount, 0);
            const activeLoan = getMemberActiveLoan(selectedMemberForDetail.id);
            const loanRepayments = activeLoan ? getMemberRepayments(activeLoan.id) : [];

            return (
              <div className="space-y-4">
                {/* Summary stat cards */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      {appLanguage === 'mr' ? 'एकूण जमा शेअर्स' : 'Total Accumulated Shares'}
                    </span>
                    <span className="text-base font-bold text-emerald-800">
                      {formatINR((selectedMemberForDetail.cumulative_shares || 0) + totalContributed)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      {appLanguage === 'mr' ? 'चालू कर्ज बाकी' : 'Active Loan Balance'}
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      {activeLoan
                        ? formatINR(activeLoan.remaining_balance)
                        : appLanguage === 'mr'
                        ? 'Nil (कोणतेही कर्ज नाही)'
                        : 'Nil (No Loan)'}
                    </span>
                  </div>
                </div>

                {/* Login Credentials Box (Visible to Admin or that Member) */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">
                      {appLanguage === 'mr' ? 'लॉगिन क्रेडेंशियल्स:' : 'Login Credentials:'}
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {appLanguage === 'mr' ? 'युझर / फोन' : 'User / Phone'}: {selectedMemberForDetail.phone} • {appLanguage === 'mr' ? 'पिन' : 'PIN'}: {selectedMemberForDetail.password || '1234'}
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() =>
                        openPasswordModal({ type: 'member', member: selectedMemberForDetail })
                      }
                      className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                    >
                      {appLanguage === 'mr' ? 'पिन बदला' : 'Change PIN'}
                    </button>
                  )}
                </div>

                {/* Active Loan Details */}
                {activeLoan && (
                  <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900">
                        {appLanguage === 'mr' ? 'सक्रिय कर्ज तपशील' : 'Active Loan Details'}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                        {appLanguage === 'mr' ? 'हप्ता' : 'Installment'}: {formatINR(activeLoan.monthly_installment)} / {appLanguage === 'mr' ? 'महिना' : 'mo'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>
                        {appLanguage === 'mr' ? 'मंजूर रक्कम: ' : 'Principal: '}
                        <strong>{formatINR(activeLoan.principal_amount)}</strong>
                      </span>
                      <span>
                        {appLanguage === 'mr' ? 'उर्वरित बाकी: ' : 'Balance: '}
                        <strong className="text-amber-800">{formatINR(activeLoan.remaining_balance)}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMemberForDetail(null);
                      openCreateModal('contribution');
                    }}
                    className="flex-1 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CreditCard size={14} />
                    <span>{appLanguage === 'mr' ? 'वर्गणी नोंदवा' : 'Record Share'}</span>
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        const m = selectedMemberForDetail;
                        setSelectedMemberForDetail(null);
                        handleOpenEdit(m);
                      }}
                      className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      {appLanguage === 'mr' ? 'माहिती संपादन' : 'Edit Member'}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
