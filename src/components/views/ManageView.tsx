import React, { useState } from 'react';
import {
  Building2,
  QrCode,
  Download,
  Database,
  Smartphone,
  CheckCircle2,
  RotateCcw,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  FileSpreadsheet,
  Globe2,
  KeyRound,
  Bell,
  BellRing,
  Send,
  UserCheck,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { formatINR, getMonthName } from '../../utils/formatters';
import { QRCodeSVG } from 'qrcode.react';

export const ManageView: React.FC = () => {
  const {
    society,
    updateSociety,
    openQrModal,
    resetToSampleData,
    members,
    contributions,
    loans,
    repayments,
    defaulters,
    selectedPeriod,
    appLanguage,
    setAppLanguage,
    isAdmin,
    openPasswordModal,
    setIsBroadcastModalOpen,
    sendDueReminders,
    isPushSubscribed,
    subscribeToPushNotifications,
    triggerPwaInstall,
    isRefreshing,
    refreshData,
    t,
  } = useSociety();

  const [societyName, setSocietyName] = useState(society.name);
  const [upiId, setUpiId] = useState(society.upi_id);
  const [openingBalance, setOpeningBalance] = useState(String(society.opening_balance));
  const [contactPhone, setContactPhone] = useState(society.contact_phone || '');
  const [address, setAddress] = useState(society.address || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [sendingDueAlert, setSendingDueAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  const isCloudSyncActive = isSupabaseConfigured();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSociety({
      name: societyName,
      upi_id: upiId,
      opening_balance: Number(openingBalance) || 0,
      contact_phone: contactPhone || undefined,
      address: address || undefined,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(society.upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

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

  // CSV Exporters
  const downloadCsv = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMonthlyContributionsCsv = () => {
    const periodContribs = contributions.filter(
      (c) => c.period_year === selectedPeriod.year && c.period_month === selectedPeriod.month
    );
    const header = 'Account No,Member Name,Phone,Month,Year,Amount Paid,Payment Date,Method,Reference\n';
    const rows = periodContribs
      .map((c) => {
        const m = members.find((mem) => mem.id === c.member_id);
        const name = appLanguage === 'mr' ? (m?.name_mr || m?.name || '') : (m?.name_en || m?.name || '');
        return `"${m?.account_no || ''}","${name}","${m?.phone || ''}","${getMonthName(c.period_month)}",${c.period_year},${c.amount},"${c.payment_date}","${c.payment_method}","${c.reference_note || ''}"`;
      })
      .join('\n');

    downloadCsv(`Contributions_${selectedPeriod.monthName}_${selectedPeriod.year}.csv`, header + rows);
  };

  const exportLoansPortfolioCsv = () => {
    const header = 'Loan No,Borrower Acc No,Borrower Name,Phone,Principal Amount,Remaining Balance,Monthly Installment,Disbursed Date,Status\n';
    const rows = loans
      .map((l) => {
        const m = members.find((mem) => mem.id === l.member_id);
        const name = appLanguage === 'mr' ? (m?.name_mr || m?.name || '') : (m?.name_en || m?.name || '');
        return `"${l.loan_no}","${m?.account_no || ''}","${name}","${m?.phone || ''}",${l.principal_amount},${l.remaining_balance},${l.monthly_installment},"${l.disbursed_date}","${l.status}"`;
      })
      .join('\n');

    downloadCsv(`Loans_Portfolio_${new Date().toISOString().split('T')[0]}.csv`, header + rows);
  };

  const exportDefaultersCsv = () => {
    const header = 'Account No,Member Name,Phone,Contribution Overdue,Loan Overdue,Total Due\n';
    const rows = defaulters
      .map((d) => {
        const name = appLanguage === 'mr' ? (d.member.name_mr || d.member.name) : (d.member.name_en || d.member.name);
        return `"${d.member.account_no}","${name}","${d.member.phone}",${d.contributionAmountDue},${d.loanOverdueAmount},${d.totalDue}`;
      })
      .join('\n');

    downloadCsv(`Defaulters_Audit_${selectedPeriod.monthName}_${selectedPeriod.year}.csv`, header + rows);
  };

  const filteredMembersList = members.filter((m) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    (m.name_en && m.name_en.toLowerCase().includes(memberSearch.toLowerCase())) ||
    String(m.account_no).includes(memberSearch) ||
    m.phone.includes(memberSearch)
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* 0. Language Preferences (English, Hindi, Marathi) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Globe2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {appLanguage === 'mr' ? 'भाषा पर्याय (Language Settings)' : 'Language Preferences'}
              </h3>
              <p className="text-xs text-slate-500">
                {appLanguage === 'mr'
                  ? 'संपूर्ण ॲपची भाषा बदला (ॲप बंद केल्यावरही हीच भाषा सेव्ह राहील)'
                  : 'Select app language. Persists automatically across browser sessions.'}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            {appLanguage === 'en' ? 'English (Active)' : appLanguage === 'mr' ? 'मराठी (सक्रिय)' : 'हिंदी (सक्रिय)'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
          <button
            type="button"
            onClick={() => setAppLanguage('en')}
            className={`py-3 px-3 rounded-2xl border text-center transition-all ${
              appLanguage === 'en'
                ? 'bg-emerald-800 text-white border-emerald-900 font-bold shadow-xs ring-2 ring-emerald-800/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
            }`}
          >
            <div className="text-sm font-bold">English</div>
            <div className={`text-[10px] mt-0.5 ${appLanguage === 'en' ? 'text-emerald-200' : 'text-slate-400'}`}>Default</div>
          </button>

          <button
            type="button"
            onClick={() => setAppLanguage('mr')}
            className={`py-3 px-3 rounded-2xl border text-center transition-all ${
              appLanguage === 'mr'
                ? 'bg-emerald-800 text-white border-emerald-900 font-bold shadow-xs ring-2 ring-emerald-800/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
            }`}
          >
            <div className="text-sm font-bold">मराठी</div>
            <div className={`text-[10px] mt-0.5 ${appLanguage === 'mr' ? 'text-emerald-200' : 'text-slate-400'}`}>Marathi</div>
          </button>

          <button
            type="button"
            onClick={() => setAppLanguage('hi')}
            className={`py-3 px-3 rounded-2xl border text-center transition-all ${
              appLanguage === 'hi'
                ? 'bg-emerald-800 text-white border-emerald-900 font-bold shadow-xs ring-2 ring-emerald-800/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
            }`}
          >
            <div className="text-sm font-bold">हिंदी</div>
            <div className={`text-[10px] mt-0.5 ${appLanguage === 'hi' ? 'text-emerald-200' : 'text-slate-400'}`}>Hindi</div>
          </button>
        </div>
      </div>

      {/* 1. Supabase Cloud Sync & Real-Time Refresh */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-800 flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {appLanguage === 'mr' ? 'क्लाउड डेटा सिंक व बॅकअप' : 'Cloud Sync & Database Refresh'}
              </h3>
              <p className="text-xs text-slate-500">
                {isCloudSyncActive
                  ? (appLanguage === 'mr' ? 'Supabase PostgreSQL क्लाउड डेटाबेस सक्रिय आहे' : 'Connected to Supabase PostgreSQL database')
                  : (appLanguage === 'mr' ? 'स्थानिक सुरक्षित डिव्हाइस स्टोरेज मोड' : 'Local device storage mode')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                isCloudSyncActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {isCloudSyncActive
                ? (appLanguage === 'mr' ? 'क्लाउड सिंक सक्रिय' : 'Cloud Connected')
                : (appLanguage === 'mr' ? 'स्थानिक मोड' : 'Device Storage')}
            </span>

            <button
              type="button"
              onClick={() => refreshData()}
              disabled={isRefreshing}
              className="py-1.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? (appLanguage === 'mr' ? 'रिफ्रेश होत आहे...' : 'Refreshing...') : (appLanguage === 'mr' ? 'रिफ्रेश करा' : 'Refresh from Cloud')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Admin Security & Password Section */}
      {isAdmin && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <ShieldCheck size={20} className="text-amber-800" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {appLanguage === 'mr' ? 'सेक्रेटरी / ॲडमिन सुरक्षा व पासवर्ड' : 'Secretary / Admin Security & Password'}
                </h3>
                <p className="text-xs text-slate-500">
                  {appLanguage === 'mr' ? 'मुख्य ॲडमिन क्रेडेंशियल्स आणि पासवर्ड व्यवस्थापन' : 'Master administrator credentials and access passcode'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openPasswordModal({ type: 'admin' })}
              className="py-2 px-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <KeyRound size={14} />
              <span>{appLanguage === 'mr' ? 'ॲडमिन पासवर्ड बदला' : 'Change Admin Password'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">
                {appLanguage === 'mr' ? 'ॲडमिन लॉगिन आयडी:' : 'Admin Login Username:'}
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                admin {appLanguage === 'mr' ? 'किंवा' : 'or'} {society.contact_phone || '9800000000'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">
                {appLanguage === 'mr' ? 'ॲडमिन अधिकार:' : 'Admin Privileges:'}
              </span>
              <span className="font-bold text-emerald-800 text-sm mt-0.5 block">
                {appLanguage === 'mr' ? 'पूर्ण CRUD अधिकार (सदस्य, हिशोब, ताळेबंद)' : 'Full System Access (Members, Register, Loans, Backup)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Web Push Notifications & OS-Level Alert Center */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <BellRing size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {appLanguage === 'mr' ? 'Web Push सूचना केंद्र (OS-Level Notifications)' : 'Web Push Notification Center'}
              </h3>
              <p className="text-xs text-slate-500">
                {appLanguage === 'mr'
                  ? 'ॲप बंद असतानाही सभासदांच्या मोबाईलवर त्वरित सूचना पोहोचवा'
                  : 'Deliver instant alerts to members phones even when the browser or app is closed'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPushSubscribed ? (
              <button
                type="button"
                onClick={subscribeToPushNotifications}
                className="py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Bell size={14} />
                <span>{appLanguage === 'mr' ? 'या फोनवर सूचना सुरू करा' : 'Enable Push Notifications'}</span>
              </button>
            ) : (
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>{appLanguage === 'mr' ? 'सूचना सक्रिय आहेत' : 'Notifications Active'}</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Custom Broadcast */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Send size={14} className="text-emerald-800" />
                <span>{appLanguage === 'mr' ? 'सर्व सभासदांना सूचना पाठवा' : 'Broadcast Announcement'}</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                {appLanguage === 'mr'
                  ? 'बैठक, कार्यक्रम किंवा महत्त्वाच्या सोसायटी निर्णयाची त्वरित पुश सूचना सर्व सदस्यांना पाठवा.'
                  : 'Send custom announcement or society circular directly to all 40 members.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(true)}
              className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors"
            >
              {appLanguage === 'mr' ? 'नवीन सूचना तयार करा' : 'Create Broadcast'}
            </button>
          </div>

          {/* Due Reminder Alert */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Bell size={14} className="text-amber-700" />
                <span>{appLanguage === 'mr' ? 'मासिक वर्गणी व हप्ता आठवण' : 'Monthly Due Reminders'}</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                {appLanguage === 'mr'
                  ? `या महिन्यातील सर्व ${defaulters.length} थकबाकीदारांना त्वरित मासिक वर्गणी (₹300) व हप्ता भरण्याची आठवण पाठवा.`
                  : `Send instant payment reminder alert to all ${defaulters.length} unpaid members for this period.`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSendDueAlert}
              disabled={sendingDueAlert}
              className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Bell size={13} />
              <span>
                {sendingDueAlert
                  ? (appLanguage === 'mr' ? 'पाठवत आहे...' : 'Sending Alerts...')
                  : alertSuccess
                  ? (appLanguage === 'mr' ? 'सूचना पाठवली!' : 'Sent Successfully!')
                  : (appLanguage === 'mr' ? 'थकीत आठवण सूचना पाठवा' : 'Send Due Reminders')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Member Password Master List (Admin only) */}
      {isAdmin && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {appLanguage === 'mr' ? 'सर्व सभासद पासवर्ड व पिन व्यवस्थापन' : 'Member Passwords & PIN Management'}
              </h3>
              <p className="text-xs text-slate-500">
                {appLanguage === 'mr'
                  ? 'सभासदांचा लॉगिन पिन रीसेट करा किंवा नवीन पासवर्ड सेट करा (डिफॉल्ट: 1234)'
                  : 'Reset member login PINs or configure custom passwords (Default: 1234)'}
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder={appLanguage === 'mr' ? 'नाव किंवा अकौंट नं. शोधा...' : 'Search name or account no...'}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
            {filteredMembersList.map((m) => (
              <div key={m.id} className="pt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    #{m.account_no}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">
                      {appLanguage === 'mr' ? (m.name_mr || m.name) : (m.name_en || m.name)}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1.5">({m.phone})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-600">
                    {appLanguage === 'mr' ? 'पिन:' : 'PIN:'} <strong>{m.password || '1234'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => openPasswordModal({ type: 'member', member: m })}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-emerald-800 font-bold rounded-lg text-[11px]"
                  >
                    {appLanguage === 'mr' ? 'बदला' : 'Change'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Society Profile Configuration */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {appLanguage === 'mr' ? 'सोसायटी प्रोफाइल माहिती' : 'Society Profile Settings'}
              </h3>
              <p className="text-xs text-slate-500">
                {appLanguage === 'mr' ? 'सोसायटीचे नाव, UPI आयडी आणि संपर्क तपशील' : 'Official society name, UPI ID, and contact details'}
              </p>
            </div>
          </div>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <Check size={14} />
              <span>{appLanguage === 'mr' ? 'जतन केले!' : 'Saved Successfully!'}</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {appLanguage === 'mr' ? 'सोसायटीचे अधिकृत नाव' : 'Official Society Name'}
              </label>
              <input
                type="text"
                required
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {appLanguage === 'mr' ? 'सोसायटी UPI आयडी' : 'Society UPI ID'}
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {appLanguage === 'mr' ? 'संपर्क मोबाईल नंबर' : 'Contact Phone Number'}
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {appLanguage === 'mr' ? 'पत्ता / लोकेशन' : 'Address / Location'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              {appLanguage === 'mr' ? 'माहिती जतन करा' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* 6. Society UPI QR Code & Counter Standee */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-800 flex items-center justify-center">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {appLanguage === 'mr' ? 'अधिकृत सोसायटी UPI QR कोड' : 'Official Society UPI QR Code'}
              </h3>
              <p className="text-xs text-slate-500">
                {appLanguage === 'mr' ? 'कोणत्याही UPI ॲपवरून वर्गणी जमा करण्यासाठी' : 'Scan with any UPI app to deposit monthly shares & loan payments'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openQrModal()}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer size={14} />
            <span>{appLanguage === 'mr' ? 'काऊंटर स्टँडी प्रिंट करा' : 'Print Counter Standee'}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
            <QRCodeSVG value={`upi://pay?pa=${society.upi_id}&pn=Al-Badr%20Society&cu=INR`} size={130} />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              {appLanguage === 'mr' ? 'डायरेक्ट बँक UPI' : 'Direct Bank UPI'}
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {appLanguage === 'mr'
                ? 'हा QR कोड स्कॅन करून थेट सोसायटीच्या बँक खात्यामध्ये वर्गणी व कर्ज हप्ता शून्य शुल्कात जमा होतो.'
                : 'Members can scan this QR code using PhonePe, Google Pay, or Paytm for instant 0% fee deposit.'}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 font-mono text-xs font-bold text-slate-800">
              <span>{society.upi_id}</span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check size={13} className="text-emerald-700" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Reports & CSV Export Center */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-800 flex items-center justify-center">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {appLanguage === 'mr' ? 'ऑडिट रिपोर्ट्स व CSV डाउनलोड' : 'Audit Reports & CSV Downloads'}
            </h3>
            <p className="text-xs text-slate-500">
              {appLanguage === 'mr' ? 'मासिक जमा, चालू कर्जे व थकबाकीदारांचा संपूर्ण डेटा' : 'Export monthly share records, loan portfolios, and defaulter audits'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={exportMonthlyContributionsCsv}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors flex flex-col justify-between"
          >
            <div>
              <Download size={16} className="text-emerald-800 mb-2" />
              <span className="text-xs font-bold text-slate-900 block">
                {selectedPeriod.monthName} {appLanguage === 'mr' ? 'मासिक वर्गणी' : 'Shares Ledger'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {appLanguage === 'mr' ? 'मासिक वर्गणी जमा लेजर (.csv)' : 'Monthly contributions (.csv)'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 mt-2 block">
              {appLanguage === 'mr' ? 'डाउनलोड करा →' : 'Download →'}
            </span>
          </button>

          <button
            type="button"
            onClick={exportLoansPortfolioCsv}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors flex flex-col justify-between"
          >
            <div>
              <Download size={16} className="text-emerald-800 mb-2" />
              <span className="text-xs font-bold text-slate-900 block">
                {appLanguage === 'mr' ? 'कर्ज वाटप व हप्ते' : 'Loans Portfolio'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {appLanguage === 'mr' ? 'सर्व कर्जे व बाकी हिशोब (.csv)' : 'All loans & balances (.csv)'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 mt-2 block">
              {appLanguage === 'mr' ? 'डाउनलोड करा →' : 'Download →'}
            </span>
          </button>

          <button
            type="button"
            onClick={exportDefaultersCsv}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors flex flex-col justify-between"
          >
            <div>
              <Download size={16} className="text-amber-700 mb-2" />
              <span className="text-xs font-bold text-slate-900 block">
                {appLanguage === 'mr' ? 'थकबाकीदार ऑडिट रिपोर्ट' : 'Defaulters Audit'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {appLanguage === 'mr' ? 'बाकीदार यादी व एकूण रक्कम (.csv)' : 'Unpaid members & dues (.csv)'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-700 mt-2 block">
              {appLanguage === 'mr' ? 'डाउनलोड करा →' : 'Download →'}
            </span>
          </button>
        </div>
      </div>

      {/* 8. PWA Install & Sample Data Reset */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={triggerPwaInstall}
            className="text-emerald-800 font-bold hover:underline flex items-center gap-1.5"
          >
            <Smartphone size={14} />
            <span>{appLanguage === 'mr' ? 'मोबाईलवर PWA ॲप इन्स्टॉल करा' : 'Install PWA App on Phone / Desktop'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const msg = appLanguage === 'mr' ? 'डेटा डीफॉल्टवर रीसेट करायचा आहे का?' : 'Reset to initial seed data?';
              if (window.confirm(msg)) {
                resetToSampleData();
              }
            }}
            className="text-slate-500 hover:text-red-600 font-medium flex items-center gap-1.5"
          >
            <RotateCcw size={13} />
            <span>{appLanguage === 'mr' ? 'डेटा रीसेट' : 'Reset Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
