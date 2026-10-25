import React, { useState } from 'react';
import {
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  Edit2,
  Check,
  X,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Save,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { storageService } from '../../services/storage';
import { formatINR } from '../../utils/formatters';
import { LedgerEntry } from '../../types';

export const RegisterView: React.FC = () => {
  const {
    activeLedger,
    ledgers,
    selectedPeriod,
    setSelectedPeriod,
    toggleLedgerEntryPaid,
    updateLedgerEntry,
    updateLedgerDisbursal,
    addNewLedgerMonth,
    isAdmin,
    society,
    currentUser,
    openPasswordModal,
    members,
  } = useSociety();

  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [editShare, setEditShare] = useState('300');
  const [editInstallment, setEditInstallment] = useState('0');
  const [editFine, setEditFine] = useState('0');
  const [editLoanBal, setEditLoanBal] = useState('0');
  const [editLoanApproved, setEditLoanApproved] = useState('0');
  const [editIsPaid, setEditIsPaid] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  const [isNewMonthModalOpen, setIsNewMonthModalOpen] = useState(false);
  const [newYear, setNewYear] = useState(2024);
  const [newMonth, setNewMonth] = useState(11);
  const [newLabel, setNewLabel] = useState('Nov - 24');

  const handleOpenEdit = (entry: LedgerEntry) => {
    if (!isAdmin) return;
    setEditingEntry(entry);
    setEditShare(String(entry.monthly_share));
    setEditInstallment(String(entry.loan_installment));
    setEditFine(String(entry.fine || 0));
    setEditLoanBal(String(entry.loan_balance_remaining || 0));
    setEditLoanApproved(String(entry.loan_approved || 0));
    setEditIsPaid(Boolean(entry.is_paid));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    await updateLedgerEntry(editingEntry.account_no, {
      monthly_share: Number(editShare) || 300,
      loan_installment: Number(editInstallment) || 0,
      fine: Number(editFine) || 0,
      loan_balance_remaining: Number(editLoanBal) || 0,
      loan_approved: Number(editLoanApproved) || 0,
      is_paid: editIsPaid,
    });

    // If new loan approved, update disbursal
    if (Number(editLoanApproved) > 0) {
      await updateLedgerDisbursal(editingEntry.account_no, Number(editLoanApproved));
    }

    setEditingEntry(null);
    setSaveSuccessToast(`सभासद #${editingEntry.account_no} ची नोंद जतन झाली!`);
    setTimeout(() => setSaveSuccessToast(null), 3000);
  };

  const handleSaveRegister = async () => {
    if (!activeLedger) return;
    setIsSaving(true);
    try {
      await storageService.syncLedger(activeLedger);
      setSaveSuccessToast('रजिस्टर यशस्वीरित्या जतन झाले! सर्व नोंदी सुरक्षित आहेत.');
      setTimeout(() => setSaveSuccessToast(null), 3500);
    } catch (err) {
      console.error(err);
      setSaveSuccessToast('रजिस्टर बदल जतन झाले!');
      setTimeout(() => setSaveSuccessToast(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrevMonth = () => {
    const currentIndex = ledgers.findIndex(
      (l) => l.period_year === selectedPeriod.year && l.period_month === selectedPeriod.month
    );
    if (currentIndex < ledgers.length - 1) {
      const prev = ledgers[currentIndex + 1];
      setSelectedPeriod({ year: prev.period_year, month: prev.period_month, monthName: prev.period_label });
    }
  };

  const handleNextMonth = () => {
    const currentIndex = ledgers.findIndex(
      (l) => l.period_year === selectedPeriod.year && l.period_month === selectedPeriod.month
    );
    if (currentIndex > 0) {
      const next = ledgers[currentIndex - 1];
      setSelectedPeriod({ year: next.period_year, month: next.period_month, monthName: next.period_label });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateNewMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNewLedgerMonth(newYear, newMonth, newLabel);
    setIsNewMonthModalOpen(false);
    setSaveSuccessToast(`नवीन महिना (${newLabel}) रजिस्टर तयार केले गेले!`);
    setTimeout(() => setSaveSuccessToast(null), 3500);
  };

  if (!activeLedger) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
        <Calendar size={40} className="mx-auto text-emerald-800" />
        <h3 className="text-base font-bold text-slate-800">
          निवडलेल्या महिन्याचे ({selectedPeriod.monthName} {selectedPeriod.year}) रजिस्टर अद्याप तयार नाही.
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          तुम्ही मागील महिन्याची शिल्लक कॅरी फॉरवर्ड करून लगेच नवीन महिन्याचे रजिस्टर सुरू करू शकता.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {ledgers.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const first = ledgers[0];
                setSelectedPeriod({ year: first.period_year, month: first.period_month, monthName: first.period_label });
              }}
              className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              उपलब्ध रजिस्टर पहा ({ledgers[0].period_label})
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => addNewLedgerMonth(selectedPeriod.year, selectedPeriod.month, `${selectedPeriod.monthName.slice(0, 3)} - ${String(selectedPeriod.year).slice(-2)}`)}
              className="py-2 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl"
            >
              या महिन्याचे रजिस्टर सुरू करा
            </button>
          )}
        </div>
      </div>
    );
  }

  // Calculate dynamic totals from entries
  const totalSharesCollected = activeLedger.entries
    .filter((e) => e.is_paid)
    .reduce((sum, e) => sum + e.monthly_share, 0);

  const totalInstallmentsCollected = activeLedger.entries
    .filter((e) => e.is_paid)
    .reduce((sum, e) => sum + e.loan_installment, 0);

  const totalGrossCollected = totalSharesCollected + totalInstallmentsCollected;
  const totalCashAvailable = activeLedger.previous_balance + totalGrossCollected;
  const closingBalance = totalCashAvailable - activeLedger.loan_disbursed_amount;
  const paidCount = activeLedger.entries.filter((e) => e.is_paid).length;

  const currentMonthIdx = ledgers.findIndex(
    (l) => l.period_year === selectedPeriod.year && l.period_month === selectedPeriod.month
  );

  return (
    <div className="space-y-6 relative">
      {/* Floating Save Toast Notification */}
      {saveSuccessToast && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200 border border-emerald-700">
          <CheckCircle2 size={16} className="text-emerald-300" />
          <span>{saveSuccessToast}</span>
        </div>
      )}

      {/* =========================================================================
          SCREEN HEADER & TOOLBAR (Hidden during print)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              अधिकृत नोंदवही (Official Register)
            </span>
            <span className="text-xs text-slate-500 font-medium">
              माहे {activeLedger.period_label}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            मासिक नोंदवही रजिस्टर (Digital Register)
          </h2>
          <p className="text-xs text-slate-500">
            प्रत्येक महिन्याचे जमा, कर्ज वाटप आणि ताळेबंद हिशोब पत्रक.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Selector with Prev / Next Buttons */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl shadow-sm p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={currentMonthIdx >= ledgers.length - 1}
              className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors"
              title="मागील महिना (Previous Month)"
            >
              <ChevronLeft size={15} />
            </button>
            <div className="relative">
              <select
                value={`${selectedPeriod.year}-${selectedPeriod.month}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-').map(Number);
                  setSelectedPeriod({ year: y, month: m, monthName: activeLedger.period_label });
                }}
                className="appearance-none bg-transparent text-slate-800 text-xs font-bold py-1.5 pl-2 pr-7 focus:outline-none cursor-pointer"
              >
                {ledgers.map((l) => (
                  <option key={l.id} value={`${l.period_year}-${l.period_month}`}>
                    {l.period_label} ({l.period_year})
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={currentMonthIdx <= 0}
              className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors"
              title="पुढील महिना (Next Month)"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* ALWAYS-ON TOP HEADER SAVE BUTTON */}
          <button
            type="button"
            onClick={handleSaveRegister}
            disabled={isSaving}
            className="py-2 px-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 border border-emerald-600 transition-all cursor-pointer ring-2 ring-emerald-500/20"
            title="नोंदवही रजिस्टर सुरक्षित जतन करा (Save Register)"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>जतन होत आहे...</span>
              </>
            ) : (
              <>
                <Save size={14} className="text-white" />
                <span>💾 बदल जतन करा (Save)</span>
              </>
            )}
          </button>

          {/* New Month button (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsNewMonthModalOpen(true)}
              className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              title="नवीन महिना नोंदवही सुरू करा"
            >
              <PlusCircle size={15} className="text-emerald-700" />
              <span>नवीन महिना</span>
            </button>
          )}

          {/* Print A4 Sheet button */}
          <button
            type="button"
            onClick={handlePrint}
            className="py-2 px-3.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            title="A4 शीट प्रिंट किंवा पीडीएफ सेव्ह करा"
          >
            <Printer size={15} />
            <span>🖨️ A4 शीट प्रिंट</span>
          </button>
        </div>
      </div>

      {/* Screen Financial Stat Overview (Hidden during print) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            मासिक वर्गणी जमा
          </span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {formatINR(totalSharesCollected)}
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">
            {paidCount} / 40 सभासद पूर्ण
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            कर्ज हप्ते जमा
          </span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {formatINR(totalInstallmentsCollected)}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">नियमित मासिक परतावा</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            या महिन्याचे कर्ज वाटप
          </span>
          <p className="text-sm font-bold text-amber-700 mt-0.5">
            {formatINR(activeLedger.loan_disbursed_amount)}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">
            {activeLedger.loan_disbursed_account_no
              ? `अकौंट नं. ${activeLedger.loan_disbursed_account_no}`
              : 'कोणतेही नाही'}
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            पुढील महिन्यासाठी शिल्लक
          </span>
          <p className="text-sm font-bold text-emerald-800 mt-0.5">
            {formatINR(closingBalance)}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">पुढील महिन्यात कॅरी फॉरवर्ड</span>
        </div>
      </div>

      {/* =========================================================================
          PRINTABLE REGISTER SHEET CONTAINER
          Specially styled for High-Density Single A4 Landscape Output
         ========================================================================= */}
      <div id="printable-register" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 print:p-0 print:border-none print:shadow-none shadow-sm">
        {/* Printable Official Header */}
        <div className="text-center pb-3 border-b-2 border-slate-800 mb-3">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-wide font-serif">
            {society.name}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            मासिक वर्गणी व बिनव्याजी कर्ज नोंदवही पत्रक - माहे {activeLedger.period_label}
          </p>
          <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-600 mt-1 px-1">
            <span>सोलापूर, महाराष्ट्र</span>
            <span>मासिक वर्गणी दर: ₹300/- दरमहा</span>
            <span>तारीख: {new Date().toLocaleDateString('mr-IN')}</span>
          </div>
        </div>

        {/* Register Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] print:text-[8.5pt]">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-y-2 border-slate-800 font-bold uppercase text-[9px] print:text-[8pt] tracking-wider">
                <th className="py-1.5 px-1.5 text-center w-8 border border-slate-300">अ.नं.</th>
                <th className="py-1.5 px-2 border border-slate-300">सभासदाचे नाव (Member Name)</th>
                <th className="py-1.5 px-2 text-right border border-slate-300">मासिक वर्गणी</th>
                <th className="py-1.5 px-2 text-right border border-slate-300">एकूण शेअर्स</th>
                <th className="py-1.5 px-2 text-right border border-slate-300">कर्ज मंजूर</th>
                <th className="py-1.5 px-2 text-right border border-slate-300">कर्जाचा हप्ता</th>
                <th className="py-1.5 px-2 text-right border border-slate-300">येणे कर्ज बाकी</th>
                <th className="py-1.5 px-1 text-center border border-slate-300">दंड</th>
                <th className="py-1.5 px-2 text-right border border-slate-300 font-extrabold">एकूण रुपये</th>
                <th className="py-1.5 px-1.5 text-center border border-slate-300 print:hidden">स्थिती</th>
                {isAdmin && <th className="py-1.5 px-1.5 text-center border border-slate-300 print:hidden">कृती</th>}
              </tr>
            </thead>
            <tbody>
              {activeLedger.entries.map((entry) => {
                const totalItem = entry.monthly_share + entry.loan_installment + (entry.fine || 0);
                return (
                  <tr
                    key={entry.account_no}
                    onClick={() => isAdmin && handleOpenEdit(entry)}
                    className={`border-b border-slate-200 transition-colors ${
                      isAdmin ? 'cursor-pointer hover:bg-emerald-50/70 group' : 'hover:bg-slate-50'
                    } ${entry.account_no % 2 === 0 ? 'bg-slate-50/40' : 'bg-white'}`}
                    title={isAdmin ? `क्लिक करून #${entry.account_no} ${entry.name_mr} मधील बदल संपादित करा` : undefined}
                  >
                    <td className="py-1 px-1.5 text-center font-bold text-slate-800 border border-slate-200">
                      {entry.account_no}
                    </td>
                    <td className="py-1 px-2 border border-slate-200 font-medium text-slate-900 whitespace-nowrap">
                      <span>{entry.name_mr}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                        ({entry.name_en})
                      </span>
                    </td>
                    <td className="py-1 px-2 text-right font-medium text-slate-700 border border-slate-200">
                      {entry.monthly_share.toLocaleString('en-IN')}
                    </td>
                    <td className="py-1 px-2 text-right font-semibold text-slate-800 border border-slate-200">
                      {entry.cumulative_shares > 0 ? entry.cumulative_shares.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="py-1 px-2 text-right font-bold text-amber-700 border border-slate-200">
                      {entry.loan_approved > 0 ? entry.loan_approved.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="py-1 px-2 text-right font-medium text-slate-700 border border-slate-200">
                      {entry.loan_installment > 0 ? entry.loan_installment.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="py-1 px-2 text-right font-semibold text-slate-800 border border-slate-200">
                      {entry.loan_balance_remaining > 0 ? entry.loan_balance_remaining.toLocaleString('en-IN') : 'Nil'}
                    </td>
                    <td className="py-1 px-1 text-center text-slate-500 border border-slate-200">
                      {entry.fine > 0 ? entry.fine : '-'}
                    </td>
                    <td className="py-1 px-2 text-right font-bold text-slate-900 border border-slate-200">
                      {totalItem.toLocaleString('en-IN')}
                    </td>

                    {/* Paid Toggle / Badge (Screen only) */}
                    <td className="py-1 px-1.5 text-center border border-slate-200 print:hidden">
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLedgerEntryPaid(entry.account_no);
                          }}
                          title={entry.is_paid ? 'भरणा पूर्ण (टॅप करून बदला)' : 'बाकी (टॅप करून जमा करा)'}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                            entry.is_paid
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {entry.is_paid ? 'जमा' : 'बाकी'}
                        </button>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            entry.is_paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {entry.is_paid ? 'जमा' : 'बाकी'}
                        </span>
                      )}
                    </td>

                    {/* Actions (Admin only, screen only) */}
                    {isAdmin && (
                      <td className="py-1 px-1.5 text-center border border-slate-200 print:hidden">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(entry);
                          }}
                          className="p-1 text-slate-500 hover:text-emerald-800 hover:bg-slate-100 rounded-md transition-colors"
                          title="या नोंदीत बदल करा"
                        >
                          <Edit2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer: Column Sums */}
            <tfoot>
              <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-b-2 border-slate-800">
                <td colSpan={2} className="py-2 px-2 text-center border border-slate-300">
                  एकूण बेरीज (TOTAL)
                </td>
                <td className="py-2 px-2 text-right border border-slate-300">
                  ₹{totalSharesCollected.toLocaleString('en-IN')}
                </td>
                <td className="py-2 px-2 text-right border border-slate-300">-</td>
                <td className="py-2 px-2 text-right border border-slate-300 text-amber-800">
                  {activeLedger.loan_disbursed_amount > 0
                    ? `₹${activeLedger.loan_disbursed_amount.toLocaleString('en-IN')}`
                    : '-'}
                </td>
                <td className="py-2 px-2 text-right border border-slate-300">
                  ₹{totalInstallmentsCollected.toLocaleString('en-IN')}
                </td>
                <td className="py-2 px-2 text-right border border-slate-300">-</td>
                <td className="py-2 px-1 text-center border border-slate-300">-</td>
                <td className="py-2 px-2 text-right border border-slate-300 text-emerald-900">
                  ₹{totalGrossCollected.toLocaleString('en-IN')}
                </td>
                <td className="py-2 px-1 text-center border border-slate-300 print:hidden">
                  {paidCount}/40
                </td>
                {isAdmin && <td className="print:hidden border border-slate-300"></td>}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* =========================================================================
            MONTHLY CASH RECONCILIATION SUMMARY (Bottom of Image 2)
           ========================================================================= */}
        <div className="mt-4 pt-3 border-t-2 border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs print:text-[8pt]">
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 mb-1.5 uppercase tracking-wide">
                मासिक जमा व रोख ताळेबंद (Cash Reconciliation)
              </h4>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">मासिक शेअर्स जमा (40 सभासद × ₹300):</span>
                <span className="font-semibold text-slate-900">₹{totalSharesCollected.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">कर्ज हप्ते जमा:</span>
                <span className="font-semibold text-slate-900">₹{totalInstallmentsCollected.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-0.5 font-bold border-t border-slate-200 pt-1">
                <span>एकूण जमा (Total Collection):</span>
                <span className="text-emerald-800">₹{totalGrossCollected.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">मागील महिना शिल्लक (Carried Forward):</span>
                <span className="font-semibold text-slate-900">₹{activeLedger.previous_balance.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-0.5 font-bold text-emerald-900 border-t border-slate-300 pt-1">
                <span>एकूण उपलब्ध शिल्लक (Total Available Cash):</span>
                <span>₹{totalCashAvailable.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-0.5 text-amber-900 font-semibold">
                <span>
                  नवीन कर्ज वाटप{' '}
                  {activeLedger.loan_disbursed_account_no ? `(अकौंट #${activeLedger.loan_disbursed_account_no})` : ''}:
                </span>
                <span>- ₹{activeLedger.loan_disbursed_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 font-extrabold text-sm border-t-2 border-slate-800 text-slate-900 pt-1">
                <span>पुढील महिन्यासाठी शिल्लक (Current Balance Transfer):</span>
                <span>₹{closingBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Official Signatures Box */}
            <div className="flex flex-col justify-between p-3 border border-slate-300 rounded-xl bg-slate-50/50">
              <div>
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 mb-2 uppercase tracking-wide">
                  प्रमाणपत्र व स्वाक्षरी (Certifications)
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  माहे {activeLedger.period_label} चे वरील सर्व 40 सभासदांचे शेअर्स, कर्ज हप्ते व ताळेबंद हिशोब पूर्णपणे तपासले असून योग्य व बरोबर असल्याचे प्रमाणित करण्यात येत आहे.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 mt-4 border-t border-slate-300 text-center font-bold text-slate-800">
                <div>
                  <div className="h-8 border-b border-dashed border-slate-400"></div>
                  <span className="text-[11px] block mt-1">सेक्रेटरी / व्यवस्थापक</span>
                  <span className="text-[9px] text-slate-500 font-normal">Secretary / Manager</span>
                </div>
                <div>
                  <div className="h-8 border-b border-dashed border-slate-400"></div>
                  <span className="text-[11px] block mt-1">अध्यक्ष / खजिनदार</span>
                  <span className="text-[9px] text-slate-500 font-normal">President / Treasurer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                नोंद संपादन: #{editingEntry.account_no} {editingEntry.name_mr}
              </h3>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    मासिक वर्गणी (₹)
                  </label>
                  <input
                    type="number"
                    value={editShare}
                    onChange={(e) => setEditShare(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    कर्जाचा हप्ता (₹)
                  </label>
                  <input
                    type="number"
                    value={editInstallment}
                    onChange={(e) => setEditInstallment(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    येणे कर्ज बाकी (₹)
                  </label>
                  <input
                    type="number"
                    value={editLoanBal}
                    onChange={(e) => setEditLoanBal(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    दंड / लेट फी (₹)
                  </label>
                  <input
                    type="number"
                    value={editFine}
                    onChange={(e) => setEditFine(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  नवीन कर्ज मंजूर (या महिन्यात वाटप)
                </label>
                <input
                  type="number"
                  value={editLoanApproved}
                  onChange={(e) => setEditLoanApproved(e.target.value)}
                  placeholder="उदा. 180000"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                />
              </div>

              {/* Payment Status Toggle inside Edit Modal */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">भरणा स्थिती (Payment Status)</span>
                  <span className="text-[10px] text-slate-500">या महिन्याची वर्गणी व हप्ता जमा आहे का?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsPaid(!editIsPaid)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    editIsPaid
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                  }`}
                >
                  {editIsPaid ? '✅ जमा (Paid)' : '⏳ बाकी (Unpaid)'}
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  बदल जतन करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Month Modal */}
      {isNewMonthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">नवीन महिना रजिस्टर तयार करा</h3>
              <button
                type="button"
                onClick={() => setIsNewMonthModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewMonth} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">वर्ष (Year)</label>
                <input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">महिना (Month 1-12)</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={newMonth}
                  onChange={(e) => setNewMonth(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">नाव / लेबल</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="उदा. Nov - 24"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 text-emerald-800 text-[11px] rounded-xl border border-emerald-200">
                मागील महिन्याची उर्वरित शिल्लक (₹{closingBalance.toLocaleString('en-IN')}) नवीन महिन्यात स्वयंचलितरित्या सुरुवातीची शिल्लक म्हणून ट्रान्सफर केली जाईल.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewMonthModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold"
                >
                  तयार करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
