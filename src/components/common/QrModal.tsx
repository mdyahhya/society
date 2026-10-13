import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Check, Printer, ShieldCheck } from 'lucide-react';
import { Modal } from './Modal';
import { useSociety } from '../../context/SocietyContext';
import { buildUpiUrl, formatINR } from '../../utils/formatters';

export const QrModal: React.FC = () => {
  const { qrModalOpen, setQrModalOpen, qrModalAmount, qrModalNote, society } = useSociety();
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (qrModalAmount) {
      setCustomAmount(String(qrModalAmount));
    } else {
      setCustomAmount('');
    }
  }, [qrModalAmount, qrModalOpen]);

  if (!qrModalOpen) return null;

  const amtNum = customAmount ? parseFloat(customAmount) : undefined;
  const upiUrl = buildUpiUrl({
    upiId: society.upi_id,
    payeeName: society.name,
    amount: amtNum,
    note: qrModalNote || 'Monthly Share / Qarz-e-Hasan',
  });

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(society.upi_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={qrModalOpen}
      onClose={() => setQrModalOpen(false)}
      title="Society UPI QR Code"
      subtitle="Direct payment to society account (Zero platform custody)"
      maxWidth="sm"
    >
      <div className="flex flex-col items-center text-center">
        {/* Verified Notice */}
        <div className="w-full mb-4 px-3 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800">
          <ShieldCheck size={16} className="text-emerald-700" />
          <span>Official Society Direct Account</span>
        </div>

        {/* QR Code Canvas */}
        <div className="p-4 bg-white rounded-2xl border-2 border-slate-900/10 shadow-sm inline-block">
          <QRCodeSVG
            value={upiUrl}
            size={220}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Amount indicator if set */}
        {amtNum && amtNum > 0 ? (
          <div className="mt-3 text-lg font-bold text-forest-800 tracking-tight">
            Amount: {formatINR(amtNum)}
          </div>
        ) : null}

        {/* UPI Details Pill */}
        <div className="w-full mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="text-left overflow-hidden mr-2">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Society UPI VPA
            </span>
            <span className="block text-sm font-semibold text-slate-800 truncate">
              {society.upi_id}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyUpi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check size={14} className="text-forest-700" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Amount Selector */}
        <div className="w-full mt-4 text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Set Specific Amount (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Custom amount (₹)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800 focus:border-forest-800"
            />
            {['1000', '2000', '5000'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCustomAmount(preset)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-5 flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
          >
            <Printer size={16} />
            <span>Print Standee</span>
          </button>
          <button
            type="button"
            onClick={() => setQrModalOpen(false)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
