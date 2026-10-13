import React, { useState, useEffect } from 'react';
import { Send, Copy, Check, MessageSquare } from 'lucide-react';
import { Modal } from './Modal';
import { useSociety } from '../../context/SocietyContext';
import {
  buildWhatsAppReminderMessage,
  buildWhatsAppUrl,
  cleanMobile,
  formatINR,
} from '../../utils/formatters';

export const WhatsAppModal: React.FC = () => {
  const { whatsAppModalOpen, setWhatsAppModalOpen, whatsAppPayload } = useSociety();
  const [editedText, setEditedText] = useState('');
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (whatsAppPayload) {
      const msg = buildWhatsAppReminderMessage(whatsAppPayload);
      setEditedText(msg);
      // Find phone from member name
      setPhone('');
    }
  }, [whatsAppPayload, whatsAppModalOpen]);

  if (!whatsAppModalOpen || !whatsAppPayload) return null;

  const handleLaunchWhatsApp = () => {
    // If phone is provided or payload contains phone
    const cleanPhone = cleanMobile(phone || whatsAppPayload.memberName);
    const url = buildWhatsAppUrl(cleanPhone || phone, editedText);
    
    // Open wa.me link
    window.open(url, '_blank', 'noopener,noreferrer');
    setWhatsAppModalOpen(false);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={whatsAppModalOpen}
      onClose={() => setWhatsAppModalOpen(false)}
      title="WhatsApp Reminder"
      subtitle={`Prefilled notice for ${whatsAppPayload.memberName}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Recipient info */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="block text-xs font-semibold text-slate-500">Recipient</span>
            <span className="text-sm font-bold text-slate-900">{whatsAppPayload.memberName}</span>
          </div>
          <div className="text-right">
            <span className="block text-xs font-semibold text-slate-500">Amount Due</span>
            <span className="text-sm font-bold text-forest-800">{formatINR(whatsAppPayload.totalDue)}</span>
          </div>
        </div>

        {/* Optional phone input confirmation if required */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Mobile Number (10 digits)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800 focus:border-forest-800 font-mono"
          />
        </div>

        {/* Message preview textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-forest-800" />
              <span>Message Preview (Editable)</span>
            </label>
            <button
              type="button"
              onClick={handleCopyText}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              {copied ? <Check size={13} className="text-forest-700" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
          <textarea
            rows={8}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full p-3 text-xs sm:text-sm font-sans bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800 focus:border-forest-800 text-slate-800 leading-relaxed resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setWhatsAppModalOpen(false)}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLaunchWhatsApp}
            className="flex-[2] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <Send size={16} />
            <span>Open in WhatsApp</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
