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
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { formatINR, getMonthName } from '../../utils/formatters';
import { APP_LANGUAGES } from '../../i18n/translations';
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
        return `"${m?.account_no || ''}","${m?.name || ''}","${m?.phone || ''}","${getMonthName(c.period_month)}",${c.period_year},${c.amount},"${c.payment_date}","${c.payment_method}","${c.reference_note || ''}"`;
      })
      .join('\n');

    downloadCsv(`Contributions_${selectedPeriod.monthName}_${selectedPeriod.year}.csv`, header + rows);
  };

  const exportLoansPortfolioCsv = () => {
    const header = 'Loan No,Borrower Acc No,Borrower Name,Phone,Principal Amount,Remaining Balance,Monthly Installment,Disbursed Date,Status\n';
    const rows = loans
      .map((l) => {
        const m = members.find((mem) => mem.id === l.member_id);
        return `"${l.loan_no}","${m?.account_no || ''}","${m?.name || ''}","${m?.phone || ''}",${l.principal_amount},${l.remaining_balance},${l.monthly_installment},"${l.disbursed_date}","${l.status}"`;
      })
      .join('\n');

    downloadCsv(`Loans_Portfolio_${new Date().toISOString().split('T')[0]}.csv`, header + rows);
  };

  const exportDefaultersCsv = () => {
    const header = 'Account No,Member Name,Phone,Contribution Overdue,Loan Overdue,Total Due\n';
    const rows = defaulters
      .map((d) => `"${d.member.account_no}","${d.member.name}","${d.member.phone}",${d.contributionAmountDue},${d.loanOverdueAmount},${d.totalDue}`)
      .join('\n');

    downloadCsv(`Defaulters_Audit_${selectedPeriod.monthName}_${selectedPeriod.year}.csv`, header + rows);
  };

  const filteredMembersList = members.filter((m) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    String(m.account_no).includes(memberSearch) ||
    m.phone.includes(memberSearch)
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* 1. Admin Security & Password Section */}
      {isAdmin && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-lg">
                👑
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  सेक्रेटरी / ॲडमिन सुरक्षा व पासवर्ड
                </h3>
                <p className="text-xs text-slate-500">
                  मुख्य ॲडमिन क्रेडेंशियल्स आणि पासवर्ड व्यवस्थापन
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openPasswordModal({ type: 'admin' })}
              className="py-2 px-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <KeyRound size={14} />
              <span>ॲडमिन पासवर्ड बदला</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">ॲडमिन लॉगिन आयडी:</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                admin किंवा {society.contact_phone || '9800000000'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">ॲडमिन अधिकार:</span>
              <span className="font-bold text-emerald-800 text-sm mt-0.5 block">
                पूर्ण CRUD अधिकार (सदस्य, हिशोब, ताळेबंद)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Web Push Notifications & OS-Level Alert Center */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <BellRing size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Web Push सूचना केंद्र (OS-Level Notifications)
              </h3>
              <p className="text-xs text-slate-500">
                ॲप बंद असतानाही सभासदांच्या मोबाईलवर त्वरित सूचना पोहोचवा
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPushSubscribed ? (
              <button
                type="button"
                onClick={subscribeToPushNotifications}
                className="py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Bell size={14} />
                <span>या फोनवर सूचना सुरू करा</span>
              </button>
            ) : (
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>सूचना सक्रिय आहेत</span>
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
                <span>सर्व सभासदांना सूचना पाठवा</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                बैठक, कार्यक्रम किंवा महत्त्वाच्या सोसायटी निर्णयाची त्वरित पुश सूचना सर्व सदस्यांना पाठवा.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(true)}
              className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors"
            >
              नवीन सूचना तयार करा
            </button>
          </div>

          {/* Due Reminder Alert */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Bell size={14} className="text-amber-700" />
                <span>मासिक वर्गणी व हप्ता आठवण (Due Reminder)</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                या महिन्यातील सर्व {defaulters.length} थकबाकीदारांना त्वरित मासिक वर्गणी (₹300) व हप्ता भरण्याची आठवण पाठवा.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSendDueAlert}
              disabled={sendingDueAlert}
              className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-colors"
            >
              {sendingDueAlert ? 'पाठवत आहे...' : alertSuccess ? 'सूचना पाठवली! ✅' : '📢 थकीत आठवण सूचना पाठवा'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Member Password Master List (Admin only) */}
      {isAdmin && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                सर्व सभासद पासवर्ड व पिन व्यवस्थापन
              </h3>
              <p className="text-xs text-slate-500">
                सभासदांचा लॉगिन पिन रीसेट करा किंवा नवीन पासवर्ड सेट करा (डिफॉल्ट: 1234)
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="नाव किंवा अकौंट नं. शोधा..."
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
                    <span className="font-bold text-slate-900">{m.name_mr || m.name}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">({m.phone})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-600">
                    पिन: <strong>{m.password || '1234'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => openPasswordModal({ type: 'member', member: m })}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-emerald-800 font-bold rounded-lg text-[11px]"
                  >
                    बदला
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Society Profile Configuration */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">सोसायटी प्रोफाइल माहिती</h3>
              <p className="text-xs text-slate-500">सोसायटीचे नाव, UPI आयडी आणि संपर्क तपशील</p>
            </div>
          </div>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <Check size={14} />
              <span>जतन केले!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">सोसायटीचे अधिकृत नाव</label>
              <input
                type="text"
                required
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">सोसायटी UPI आयडी</label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">संपर्क मोबाईल नंबर</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">पत्ता / लोकेशन</label>
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
              माहिती जतन करा
            </button>
          </div>
        </form>
      </div>

      {/* 5. Society UPI QR Code & Counter Standee */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-800 flex items-center justify-center">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">अधिकृत सोसायटी UPI QR कोड</h3>
              <p className="text-xs text-slate-500">कोणत्याही UPI ॲपवरून वर्गणी जमा करण्यासाठी</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openQrModal()}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer size={14} />
            <span>काऊंटर स्टँडी प्रिंट करा</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
            <QRCodeSVG value={`upi://pay?pa=${society.upi_id}&pn=Al-Badr%20Society&cu=INR`} size={130} />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              डायरेक्ट बँक UPI
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              हा QR कोड स्कॅन करून थेट सोसायटीच्या बँक खात्यामध्ये वर्गणी व कर्ज हप्ता शून्य शुल्कात जमा होतो.
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

      {/* 6. Reports & CSV Export Center */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-800 flex items-center justify-center">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">ऑडिट रिपोर्ट्स व CSV डाउनलोड</h3>
            <p className="text-xs text-slate-500">मासिक जमा, चालू कर्जे व थकबाकीदारांचा संपूर्ण डेटा</p>
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
                {selectedPeriod.monthName} मासिक वर्गणी
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                मासिक वर्गणी जमा लेजर (.csv)
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 mt-2 block">
              डाउनलोड करा →
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
                कर्ज वाटप व हप्ते
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                सर्व कर्जे व बाकी हिशोब (.csv)
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 mt-2 block">
              डाउनलोड करा →
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
                थकबाकीदार ऑडिट रिपोर्ट
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                बाकीदार यादी व एकूण रक्कम (.csv)
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-700 mt-2 block">
              डाउनलोड करा →
            </span>
          </button>
        </div>
      </div>

      {/* 7. Cloud Storage & PWA Info */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-800 flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">डेटा बॅकअप व क्लाउड सिंक स्थिती</h3>
              <p className="text-xs text-slate-500">
                {isCloudSyncActive ? 'Supabase PostgreSQL क्लाउड सिंक चालू आहे' : 'स्थानिक सुरक्षित डिव्हाइस स्टोरेज'}
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              isCloudSyncActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {isCloudSyncActive ? 'क्लाउड सिंक सक्रिय' : 'डिव्हाइस स्टोरेज मोड'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={triggerPwaInstall}
            className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
          >
            <Smartphone size={14} />
            <span>मोबाईलवर PWA ॲप इन्स्टॉल करा</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('नमुना डेटा रीसेट करायचा आहे का?')) {
                resetToSampleData();
              }
            }}
            className="text-slate-500 hover:text-red-600 font-medium flex items-center gap-1"
          >
            <RotateCcw size={13} />
            <span>डेटा रीसेट</span>
          </button>
        </div>
      </div>
    </div>
  );
};
