import React, { useState } from 'react';
import { ShieldCheck, User, KeyRound, Lock, X, CheckCircle, ArrowRight } from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { Modal } from '../common/Modal';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login, currentUser, logout, appLanguage } = useSociety();

  const [activeTab, setActiveTab] = useState<'admin' | 'member'>('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await login(identifier, password);
      if (!result.success) {
        setErrorMsg(
          result.message ||
            (appLanguage === 'mr'
              ? 'लॉगिन अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.'
              : 'Login failed. Please check credentials and try again.')
        );
      } else {
        setIdentifier('');
        setPassword('');
        setIsLoginModalOpen(false);
      }
    } catch {
      setErrorMsg(
        appLanguage === 'mr' ? 'तांत्रिक अडचण आली आहे.' : 'A technical error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreFillAdmin = () => {
    setActiveTab('admin');
    setIdentifier('admin');
    setPassword('admin321');
    setErrorMsg('');
  };

  const handlePreFillMember = (accNo: number) => {
    setActiveTab('member');
    setIdentifier(String(accNo));
    setPassword('1234');
    setErrorMsg('');
  };

  if (!isLoginModalOpen) return null;

  return (
    <Modal
      isOpen={isLoginModalOpen}
      onClose={() => setIsLoginModalOpen(false)}
      title={appLanguage === 'mr' ? 'सोसायटी पोर्टल लॉगिन' : 'Society Portal Login'}
    >
      <div className="space-y-4">
        {/* Current status if already logged in */}
        {currentUser && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold">
                  {appLanguage === 'mr' ? 'सध्या लॉगिन: ' : 'Logged In: '}
                  {currentUser.full_name}
                </p>
                <p className="text-[11px] text-emerald-700">
                  {currentUser.role === 'admin'
                    ? appLanguage === 'mr'
                      ? 'ॲडमिन / सेक्रेटरी अधिकार'
                      : 'Admin / Secretary Access'
                    : appLanguage === 'mr'
                    ? `अकौंट नं. ${currentUser.account_no}`
                    : `Account #${currentUser.account_no}`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold"
            >
              {appLanguage === 'mr' ? 'लॉगआउट करा' : 'Logout'}
            </button>
          </div>
        )}

        {/* Tab switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={16} />
            <span>{appLanguage === 'mr' ? 'सेक्रेटरी / ॲडमिन' : 'Secretary / Admin'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('member');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'member'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User size={16} />
            <span>{appLanguage === 'mr' ? 'सभासद (Member)' : 'Member'}</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {activeTab === 'admin'
                ? appLanguage === 'mr'
                  ? 'मोबाईल नंबर किंवा युझरनेम'
                  : 'Mobile Number or Username'
                : appLanguage === 'mr'
                ? 'अकौंट नंबर (1 ते 40) किंवा मोबाईल'
                : 'Account Number (1 to 40) or Mobile'}
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={
                activeTab === 'admin'
                  ? appLanguage === 'mr'
                    ? 'admin किंवा 9800000000'
                    : 'admin or 9800000000'
                  : appLanguage === 'mr'
                  ? 'उदा. 11 किंवा 9800000011'
                  : 'e.g. 11 or 9800000011'
              }
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {appLanguage === 'mr' ? 'पासवर्ड / पिन (Password / PIN)' : 'Password / PIN'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  activeTab === 'admin'
                    ? appLanguage === 'mr'
                      ? 'ॲडमिन पासवर्ड'
                      : 'Admin Password'
                    : appLanguage === 'mr'
                    ? 'सभासद पिन (डिफॉल्ट: 1234)'
                    : 'Member PIN (Default: 1234)'
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium pr-10"
              />
              <KeyRound size={16} className="absolute right-3 top-3 text-slate-400" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>
              {loading
                ? appLanguage === 'mr'
                  ? 'तपासत आहे...'
                  : 'Verifying...'
                : appLanguage === 'mr'
                ? 'लॉगिन करा'
                : 'Login'}
            </span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Quick Demo Pre-fill Links */}
        <div className="pt-2 border-t border-slate-200 space-y-1.5">
          <p className="text-[11px] text-slate-500 font-medium">
            {appLanguage === 'mr' ? 'त्वरित चाचणीसाठी क्रेडेंशियल्स:' : 'Quick Demo Credentials:'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={handlePreFillAdmin}
              className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              👑 {appLanguage === 'mr' ? 'ॲडमिन (admin / admin321)' : 'Admin (admin / admin321)'}
            </button>
            <button
              type="button"
              onClick={() => handlePreFillMember(11)}
              className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              👤 {appLanguage === 'mr' ? 'सभासद #11 (इम्रान बेंगलोरे / 1234)' : 'Member #11 (Imran Bengalore / 1234)'}
            </button>
            <button
              type="button"
              onClick={() => handlePreFillMember(1)}
              className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              👤 {appLanguage === 'mr' ? 'सभासद #1 (इम्रान सय्यद / 1234)' : 'Member #1 (Imran Sayyad / 1234)'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
