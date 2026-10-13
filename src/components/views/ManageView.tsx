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
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { formatINR, getMonthName, buildUpiUrl } from '../../utils/formatters';
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
  } = useSociety();

  const [societyName, setSocietyName] = useState(society.name);
  const [upiId, setUpiId] = useState(society.upi_id);
  const [openingBalance, setOpeningBalance] = useState(String(society.opening_balance));
  const [contactPhone, setContactPhone] = useState(society.contact_phone || '');
  const [address, setAddress] = useState(society.address || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

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
    const header = 'Member No,Member Name,Phone,Month,Year,Amount Paid,Payment Date,Method,Reference\n';
    const rows = periodContribs.map((c) => {
      const m = members.find((mem) => mem.id === c.member_id);
      return `"${m?.member_no || ''}","${m?.name || ''}","${m?.phone || ''}","${getMonthName(c.period_month)}",${c.period_year},${c.amount},"${c.payment_date}","${c.payment_method}","${c.reference_note || ''}"`;
    }).join('\n');

    downloadCsv(`Contributions_${selectedPeriod.monthName}_${selectedPeriod.year}.csv`, header + rows);
  };

  const exportLoansPortfolioCsv = () => {
    const header = 'Loan No,Borrower Member No,Borrower Name,Phone,Principal Amount,Remaining Balance,Monthly Installment,Disbursed Date,Status,Purpose\n';
    const rows = loans.map((l) => {
      const m = members.find((mem) => mem.id === l.member_id);
      return `"${l.loan_no}","${m?.member_no || ''}","${m?.name || ''}","${m?.phone || ''}",${l.principal_amount},${l.remaining_balance},${l.monthly_installment},"${l.disbursed_date}","${l.status}","${l.purpose || ''}"`;
    }).join('\n');

    downloadCsv(`Qarz_Loans_Portfolio_${new Date().toISOString().split('T')[0]}.csv`, header + rows);
  };

  const exportDefaultersCsv = () => {
    const header = 'Member No,Member Name,Phone,Type,Months Overdue,Contribution Due,Loan Installment Due,Total Due\n';
    const rows = defaulters.map((d) => {
      return `"${d.member.member_no}","${d.member.name}","${d.member.phone}","${d.type}",${d.contributionMonthsOverdue},${d.contributionAmountDue},${d.loanOverdueAmount},${d.totalDue}`;
    }).join('\n');

    downloadCsv(`Defaulters_Report_${new Date().toISOString().split('T')[0]}.csv`, header + rows);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* 1. Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Society Settings & Reports</h2>
        <p className="text-xs text-slate-500">
          Manage UPI ID, export financial reports, and configure system storage
        </p>
      </div>

      {/* 2. Society Details & UPI Configuration */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Society Profile & Direct UPI</h3>
              <p className="text-xs text-slate-500">Direct member payments without platform custody</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openQrModal()}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <QrCode size={14} />
            <span>Show QR</span>
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Society Name *
            </label>
            <input
              type="text"
              required
              value={societyName}
              onChange={(e) => setSocietyName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Society UPI VPA (Direct Bank ID) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. societyname@okaxis"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800 font-mono"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                All QR codes & WhatsApp payment links generate dynamically for this exact VPA.
              </span>
              {upiId.trim() && (
                <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                  <div className="p-1 bg-white rounded-xl border border-slate-200 shrink-0 shadow-2xs">
                    <QRCodeSVG
                      value={buildUpiUrl({
                        upiId: upiId.trim(),
                        payeeName: societyName.trim() || 'Society',
                        note: 'Monthly Share / Qarz-e-Hasan',
                      })}
                      size={60}
                      level="M"
                    />
                  </div>
                  <div className="overflow-hidden text-left">
                    <span className="inline-block text-[10px] font-bold text-forest-800 uppercase tracking-wide bg-forest-100/70 px-1.5 py-0.5 rounded-md">
                      Live Verified QR
                    </span>
                    <p className="text-xs font-medium text-slate-700 mt-0.5 truncate">
                      Encodes: <span className="font-mono font-semibold">{upiId.trim()}</span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Matches the UPI ID typed above in real time
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Opening Pool Balance (₹)
              </label>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Treasurer Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Address / Location
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 size={15} />
                <span>Profile updated successfully</span>
              </span>
            ) : (
              <span></span>
            )}
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              Save Society Profile
            </button>
          </div>
        </form>
      </div>

      {/* 3. Export Center (Treasurer-Facing Reports) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-800 flex items-center justify-center border border-slate-200">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Export Center & AGM Reports</h3>
            <p className="text-xs text-slate-500">Download formatted CSV reports for record-keeping and audits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={exportMonthlyContributionsCsv}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors flex flex-col justify-between"
          >
            <div>
              <Download size={16} className="text-forest-800 mb-2" />
              <span className="text-xs font-bold text-slate-900 block">
                {selectedPeriod.monthName} Contributions
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Download collection ledger (.csv)
              </span>
            </div>
            <span className="text-[10px] font-semibold text-forest-800 mt-2 block">
              Download CSV →
            </span>
          </button>

          <button
            type="button"
            onClick={exportLoansPortfolioCsv}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors flex flex-col justify-between"
          >
            <div>
              <Download size={16} className="text-forest-800 mb-2" />
              <span className="text-xs font-bold text-slate-900 block">
                Loans Portfolio & Repayments
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                All disbursed loans and balances (.csv)
              </span>
            </div>
            <span className="text-[10px] font-semibold text-forest-800 mt-2 block">
              Download CSV →
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
                Defaulters & Arrears Audit
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Overdue members and amounts (.csv)
              </span>
            </div>
            <span className="text-[10px] font-semibold text-amber-700 mt-2 block">
              Download CSV →
            </span>
          </button>
        </div>
      </div>

      {/* 4. Data Backup & Storage Status */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-800 flex items-center justify-center border border-slate-200">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Data Backup & Storage</h3>
              <p className="text-xs text-slate-500">System data retention and synchronization status</p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              isCloudSyncActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {isCloudSyncActive ? 'Cloud Sync Active' : 'Device Storage Mode'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {isCloudSyncActive
            ? 'Automatic cloud synchronization is active. All member profiles, shares, and loans are securely backed up.'
            : 'Running in high-speed offline device storage mode with instant auto-save. All records are safely preserved in this browser and ready for export.'}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Sample testing data</span>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset local data to default sample members and loans?')) {
                resetToSampleData();
              }
            }}
            className="text-xs font-semibold text-slate-600 hover:text-rose-600 flex items-center gap-1"
          >
            <RotateCcw size={13} />
            <span>Reset to Sample Data</span>
          </button>
        </div>
      </div>

      {/* 5. PWA Installation Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
            <Smartphone size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">PWA Mobile Installation</h3>
            <p className="text-xs text-slate-500">Use on Android, iOS Safari, and Desktop as a standalone app</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 mt-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <strong className="block text-slate-900 mb-1">Android & PC:</strong>
            Tap the browser menu (⋮) or address bar install icon and select <strong>"Install App"</strong>.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <strong className="block text-slate-900 mb-1">iOS Safari:</strong>
            Tap the Share button (<span className="font-mono">⎋</span>) and select <strong>"Add to Home Screen"</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
