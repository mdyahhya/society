import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, X, AlertCircle } from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { Member } from '../../types';
import { Modal } from '../common/Modal';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
}) => {
  const { members, addMember, updateMember } = useSociety();

  const isEditing = Boolean(memberToEdit);

  // Form fields
  const [accountNo, setAccountNo] = useState<number>(1);
  const [nameMr, setNameMr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('1234');
  const [monthlyShare, setMonthlyShare] = useState('300');
  const [cumulativeShares, setCumulativeShares] = useState('0');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (memberToEdit) {
      setAccountNo(memberToEdit.account_no);
      setNameMr(memberToEdit.name_mr || memberToEdit.name);
      setNameEn(memberToEdit.name_en || memberToEdit.name);
      setPhone(memberToEdit.phone || '');
      setPassword(memberToEdit.password || '1234');
      setMonthlyShare(String(memberToEdit.monthly_share || 300));
      setCumulativeShares(String(memberToEdit.cumulative_shares || 0));
      setStatus(memberToEdit.status === 'suspended' ? 'inactive' : memberToEdit.status);
    } else {
      // Find next free account number
      const highestAcc = members.reduce((max, m) => Math.max(max, m.account_no || 0), 0);
      setAccountNo(highestAcc + 1);
      setNameMr('');
      setNameEn('');
      setPhone('');
      setPassword('1234');
      setMonthlyShare('300');
      setCumulativeShares('0');
      setStatus('active');
    }
    setErrorMsg('');
  }, [memberToEdit, isOpen, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nameMr && !nameEn) {
      setErrorMsg('कृपया सभासदाचे नाव प्रविष्ट करा.');
      return;
    }

    if (!phone || phone.length < 10) {
      setErrorMsg('कृपया वैध 10-अंकी मोबाईल नंबर प्रविष्ट करा.');
      return;
    }

    // Check account number uniqueness if adding
    if (!isEditing && members.some((m) => m.account_no === accountNo)) {
      setErrorMsg(`अकौंट नंबर ${accountNo} आधीच अस्तित्वात आहे. कृपया दुसरा नंबर निवडा.`);
      return;
    }

    setLoading(true);
    try {
      if (isEditing && memberToEdit) {
        await updateMember(memberToEdit.id, {
          name: nameMr || nameEn,
          name_mr: nameMr || nameEn,
          name_en: nameEn || nameMr,
          phone,
          password,
          monthly_share: Number(monthlyShare) || 300,
          cumulative_shares: Number(cumulativeShares) || 0,
          status,
        });
      } else {
        await addMember({
          account_no: accountNo,
          member_no: String(accountNo),
          name: nameMr || nameEn,
          name_mr: nameMr || nameEn,
          name_en: nameEn || nameMr,
          phone,
          password,
          monthly_share: Number(monthlyShare) || 300,
          cumulative_shares: Number(cumulativeShares) || 0,
          join_date: new Date().toISOString().split('T')[0],
          status,
          address: 'सोलापूर',
        });
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'सभासद माहिती जतन करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `सभासद संपादन: #${accountNo} ${memberToEdit?.name}` : 'नवीन सभासद जोडा'}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              अकौंट नं. (Account No.)
            </label>
            <input
              type="number"
              required
              disabled={isEditing}
              value={accountNo}
              onChange={(e) => setAccountNo(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">स्थिती (Status)</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="active">सक्रिय (Active)</option>
              <option value="inactive">निष्क्रिय (Inactive)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            नाव मराठीमध्ये (Marathi Name)
          </label>
          <input
            type="text"
            required
            value={nameMr}
            onChange={(e) => setNameMr(e.target.value)}
            placeholder="उदा. इम्रान बेंगलोरे"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            नाव इंग्रजीमध्ये (English Name)
          </label>
          <input
            type="text"
            required
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="उदा. Imran Bengalure"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              मोबाईल नंबर (Phone)
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9800000000"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              लॉगिन पासवर्ड / पिन
            </label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="1234"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              मासिक वर्गणी (₹)
            </label>
            <input
              type="number"
              required
              value={monthlyShare}
              onChange={(e) => setMonthlyShare(e.target.value)}
              placeholder="300"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              एकूण जमा शेअर्स (₹)
            </label>
            <input
              type="number"
              value={cumulativeShares}
              onChange={(e) => setCumulativeShares(e.target.value)}
              placeholder="उदा. 54100"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            रद्द करा
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            {isEditing ? <UserCheck size={16} /> : <UserPlus size={16} />}
            <span>{loading ? 'जतन करत आहे...' : isEditing ? 'बदल जतन करा' : 'सभासद जोडा'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
