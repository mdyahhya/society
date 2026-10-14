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
  Calendar,
  X,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { Member, Contribution } from '../../types';
import {
  formatINR,
  formatDate,
  formatPhone,
  getCurrentPeriod,
  getMonthName,
} from '../../utils/formatters';
import { getLocalizedMonthName } from '../../i18n/translations';
import { Modal } from '../common/Modal';

export const MembersView: React.FC = () => {
  const {
    members,
    addMember,
    updateMember,
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
    isAddMemberModalOpen,
    setIsAddMemberModalOpen,
    openAddMemberModal,
    openMemberDetail,
    t,
    appLanguage,
  } = useSociety();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'loan'>('all');
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMemberNo, setFormMemberNo] = useState('');
  const [formMonthlyShare, setFormMonthlyShare] = useState('2000');
  const [formJoinDate, setFormJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const currentPeriod = getCurrentPeriod();

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.member_no.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const isPaid = isMemberPaidInPeriod(m.id, selectedPeriod.year, selectedPeriod.month);
    const hasLoan = Boolean(getMemberActiveLoan(m.id));

    if (filter === 'paid') return isPaid;
    if (filter === 'unpaid') return !isPaid;
    if (filter === 'loan') return hasLoan;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormName('');
    setFormPhone('');
    setFormMemberNo(`M-${String(members.length + 101)}`);
    setFormMonthlyShare('2000');
    setFormJoinDate(new Date().toISOString().split('T')[0]);
    setFormAddress('');
    setFormNotes('');
    openAddMemberModal();
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFormName(m.name);
    setFormPhone(m.phone);
    setFormMemberNo(m.member_no);
    setFormMonthlyShare(String(m.monthly_share));
    setFormJoinDate(m.join_date);
    setFormAddress(m.address || '');
    setFormNotes(m.notes || '');
    openAddMemberModal();
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formMonthlyShare) return;

    if (editingMember) {
      await updateMember(editingMember.id, {
        name: formName,
        phone: formPhone,
        member_no: formMemberNo,
        monthly_share: Number(formMonthlyShare),
        join_date: formJoinDate,
        address: formAddress || undefined,
        notes: formNotes || undefined,
      });
    } else {
      await addMember({
        name: formName,
        phone: formPhone,
        member_no: formMemberNo,
        monthly_share: Number(formMonthlyShare),
        join_date: formJoinDate,
        status: 'active',
        address: formAddress || undefined,
        notes: formNotes || undefined,
      });
    }

    setIsAddMemberModalOpen(false);
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete member ${name}? This action cannot be undone.`)) {
      await deleteMember(id);
      if (selectedMemberForDetail?.id === id) {
        setSelectedMemberForDetail(null);
      }
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t('members.title', 'Society Members')}</h2>
          <p className="text-xs text-slate-500">{members.length} {t('home.membersCount', 'registered members')}</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <UserPlus size={15} />
          <span>{t('members.addMember', 'Add Member')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('members.searchPlaceholder', 'Search by name, phone, or member #...')}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-forest-800"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'all', label: `${t('members.filterAll', 'All')} (${members.length})` },
          { key: 'paid', label: `${t('members.filterPaid', 'Paid')} ${getLocalizedMonthName(selectedPeriod.month, appLanguage)}` },
          { key: 'unpaid', label: t('members.filterUnpaid', 'Unpaid') },
          { key: 'loan', label: t('members.filterLoan', 'On Loan') },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key as any)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-forest-800 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {filteredMembers.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl">
            <Users size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No members match your criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting the filter or search keyword.</p>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const isPaid = isMemberPaidInPeriod(member.id, selectedPeriod.year, selectedPeriod.month);
            const activeLoan = getMemberActiveLoan(member.id);

            return (
              <div
                key={member.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => openMemberDetail(member)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                      {member.member_no}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 hover:text-forest-800 transition-colors">
                      {member.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>{formatPhone(member.phone)}</span>
                    <span>{t('members.share', 'Share')}: <strong className="text-slate-800">{formatINR(member.monthly_share)}/mo</strong></span>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 mt-2">
                    {isPaid ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>{t('members.paidFor', 'Paid for')} {getLocalizedMonthName(selectedPeriod.month, appLanguage)}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock size={11} />
                        <span>{t('members.unpaidFor', 'Unpaid for')} {getLocalizedMonthName(selectedPeriod.month, appLanguage)}</span>
                      </span>
                    )}

                    {activeLoan && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                        <HandCoins size={11} />
                        <span>{t('members.loanBal', 'Loan Bal')}: {formatINR(activeLoan.remaining_balance)}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Member Card Quick Action Buttons */}
                <div className="flex items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* WhatsApp Reminder Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      const loanDue = activeLoan ? Math.min(activeLoan.monthly_installment, activeLoan.remaining_balance) : 0;
                      const shareDue = isPaid ? 0 : member.monthly_share;
                      openWhatsAppModal({
                        memberId: member.id,
                        memberName: member.name,
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
                    title={t('members.remind', 'Send WhatsApp Reminder')}
                  >
                    <MessageSquare size={16} />
                  </button>

                  {/* Direct Log Pay */}
                  {!isPaid && (
                    <button
                      type="button"
                      onClick={() => openCreateModal('contribution')}
                      className="px-2.5 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <CreditCard size={13} />
                      <span>{t('members.logPay', 'Log')}</span>
                    </button>
                  )}

                  {/* View Details Chevron */}
                  <button
                    type="button"
                    onClick={() => openMemberDetail(member)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-800 transition-colors"
                    aria-label="View member ledger"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title={editingMember ? t('members.editMember', 'Edit Member Profile') : t('members.addNew', 'Add New Member')}
        subtitle={t('members.subtitle', 'Community member record for monthly shares')}
        maxWidth="md"
      >
        <form onSubmit={handleSaveMember} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('members.memberNo', 'Member Number')} *
              </label>
              <input
                type="text"
                required
                value={formMemberNo}
                onChange={(e) => setFormMemberNo(e.target.value)}
                placeholder="e.g. M-109"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('members.monthlyShare', 'Monthly Share (₹)')} *
              </label>
              <input
                type="number"
                required
                min="100"
                step="100"
                value={formMonthlyShare}
                onChange={(e) => setFormMonthlyShare(e.target.value)}
                placeholder="e.g. 2000"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('members.name', 'Full Name')} *
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Tariq Anwar"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('members.phone', 'Mobile Number (10 digits)')} *
              </label>
              <input
                type="tel"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('members.joiningDate', 'Joining Date')}
              </label>
              <input
                type="date"
                value={formJoinDate}
                onChange={(e) => setFormJoinDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('members.address', 'Address (Optional)')}
            </label>
            <input
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="e.g. House 42, Civil Lines"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('members.notes', 'Notes (Optional)')}
            </label>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Nominee or guarantor information"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold"
            >
              {t('manage.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              {editingMember ? t('members.save', 'Save Changes') : t('members.addMember', 'Create Member')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Member Details Drawer Modal */}
      {selectedMemberForDetail && (
        <Modal
          isOpen={Boolean(selectedMemberForDetail)}
          onClose={() => setSelectedMemberForDetail(null)}
          title={selectedMemberForDetail.name}
          subtitle={`Member No: ${selectedMemberForDetail.member_no} • Joined ${formatDate(selectedMemberForDetail.join_date)}`}
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
                      Lifetime Contributions
                    </span>
                    <span className="text-base font-bold text-forest-800">
                      {formatINR(totalContributed)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Active Loan Balance
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      {activeLoan ? formatINR(activeLoan.remaining_balance) : 'Nil'}
                    </span>
                  </div>
                </div>

                {/* Active Loan Details if any */}
                {activeLoan && (
                  <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-900">Active Qarz-e-Hasan ({activeLoan.loan_no})</span>
                      <span className="font-semibold text-amber-800">
                        Monthly Inst: {formatINR(activeLoan.monthly_installment)}
                      </span>
                    </div>
                    <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              ((activeLoan.principal_amount - activeLoan.remaining_balance) /
                                activeLoan.principal_amount) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-amber-800">
                      <span>Repaid: {formatINR(activeLoan.principal_amount - activeLoan.remaining_balance)}</span>
                      <span>Total: {formatINR(activeLoan.principal_amount)}</span>
                    </div>
                  </div>
                )}

                {/* Contribution History Ledger */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Contribution History ({memberHistory.length} recorded)
                  </h4>
                  {memberHistory.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl">
                      No contribution records yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                      {memberHistory.map((c) => (
                        <div key={c.id} className="p-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {getMonthName(c.period_month)} {c.period_year}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Paid on {formatDate(c.payment_date)} via {c.payment_method.toUpperCase()}
                            </span>
                          </div>
                          <span className="font-bold text-forest-800">{formatINR(c.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(selectedMemberForDetail.id, selectedMemberForDetail.name)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 size={15} />
                    <span>Delete</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenEdit(selectedMemberForDetail);
                        setSelectedMemberForDetail(null);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const m = selectedMemberForDetail;
                        setSelectedMemberForDetail(null);
                        openWhatsAppModal({
                          memberId: m.id,
                          memberName: m.name,
                          memberPhone: m.phone,
                          societyName: society.name,
                          monthName: selectedPeriod.monthName,
                          monthNumber: selectedPeriod.month,
                          monthlyShareDue: m.monthly_share,
                          totalDue: m.monthly_share,
                          upiId: society.upi_id,
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-forest-800 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <MessageSquare size={14} />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
