import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { Modal } from '../common/Modal';

export const PasswordChangeModal: React.FC = () => {
  const {
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    passwordModalTarget,
    changeAdminPassword,
    changeMemberPassword,
  } = useSociety();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isPasswordModalOpen || !passwordModalTarget) return null;

  const isForAdmin = passwordModalTarget.type === 'admin';
  const targetMember = passwordModalTarget.member;

  const title = isForAdmin
    ? 'ॲडमिन पासवर्ड बदला (Change Admin Password)'
    : `सभासद पासवर्ड बदला: अकौंट नं. ${targetMember?.account_no} (${targetMember?.name})`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 4) {
      setErrorMsg('पासवर्ड किमान 4 अक्षरे किंवा अंकांचा असावा.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('दोन्ही पासवर्ड जुळत नाहीत.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isForAdmin) {
        await changeAdminPassword(newPassword);
        setSuccessMsg('ॲडमिन पासवर्ड यशस्वीरीत्या बदलला आहे!');
      } else if (targetMember) {
        await changeMemberPassword(targetMember.account_no, newPassword);
        setSuccessMsg(`अकौंट नं. ${targetMember.account_no} चा पासवर्ड यशस्वीरीत्या बदलला!`);
      }

      setTimeout(() => {
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMsg('');
        setIsPasswordModalOpen(false);
      }, 1500);
    } catch {
      setErrorMsg('पासवर्ड बदलताना त्रुटी आली.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
          {isForAdmin ? (
            <p>
              तुम्ही <strong>सेक्रेटरी / ॲडमिन</strong> खात्याचा मुख्य पासवर्ड बदलत आहात. नवीन पासवर्ड जतन झाल्यानंतर पुढील वेळी लॉगिनसाठी हाच पासवर्ड वापरावा लागेल.
            </p>
          ) : (
            <p>
              सभासद <strong>{targetMember?.name}</strong> (अकौंट नं. {targetMember?.account_no}) चा नवीन लॉगिन पिन/पासवर्ड सेट करत आहात.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">नवीन पासवर्ड / पिन</label>
          <input
            type="text"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="किमान 4 अंक किंवा अक्षरे"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">नवीन पासवर्ड पुन्हा टाका</label>
          <input
            type="text"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="पुन्हा पासवर्ड टाका"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
          />
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(false)}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            रद्द करा
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <KeyRound size={15} />
            <span>{isSubmitting ? 'जतन करत आहे...' : 'पासवर्ड जतन करा'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
