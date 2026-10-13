import React, { useState, useEffect } from 'react';
import { Send, Copy, Check, MessageSquare, Globe2 } from 'lucide-react';
import { Modal } from './Modal';
import { useSociety } from '../../context/SocietyContext';
import {
  buildWhatsAppReminderMessage,
  buildWhatsAppUrl,
  cleanMobile,
  formatINR,
  REMINDER_LANGUAGES,
  ReminderLanguage,
} from '../../utils/formatters';

export const WhatsAppModal: React.FC = () => {
  const {
    whatsAppModalOpen,
    setWhatsAppModalOpen,
    whatsAppPayload,
    members,
    defaultReminderLang,
  } = useSociety();

  const [editedText, setEditedText] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState<ReminderLanguage>(defaultReminderLang || 'en');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (whatsAppPayload) {
      // 1. Initial language: default to user preference or payload
      const initialLang = whatsAppPayload.language || defaultReminderLang || 'en';
      setLanguage(initialLang);

      // 2. Pre-fill phone number from payload or member directory
      let targetPhone = whatsAppPayload.memberPhone || '';
      if (!targetPhone) {
        const foundMember = members.find(
          (m) =>
            (whatsAppPayload.memberId && m.id === whatsAppPayload.memberId) ||
            m.name.trim().toLowerCase() === whatsAppPayload.memberName.trim().toLowerCase()
        );
        if (foundMember?.phone) {
          targetPhone = foundMember.phone;
        }
      }
      setPhone(targetPhone);

      // 3. Generate message text in selected language
      const msg = buildWhatsAppReminderMessage({
        ...whatsAppPayload,
        language: initialLang,
      });
      setEditedText(msg);
    }
  }, [whatsAppPayload, whatsAppModalOpen, defaultReminderLang, members]);

  if (!whatsAppModalOpen || !whatsAppPayload) return null;

  const handleLanguageChange = (newLang: ReminderLanguage) => {
    setLanguage(newLang);
    if (whatsAppPayload) {
      const msg = buildWhatsAppReminderMessage({
        ...whatsAppPayload,
        language: newLang,
      });
      setEditedText(msg);
    }
  };

  const handleLaunchWhatsApp = () => {
    const clean = cleanMobile(phone);
    if (!clean) {
      alert('Please enter or confirm a valid 10-digit mobile number.');
      return;
    }
    const url = buildWhatsAppUrl(clean, editedText);
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
        {/* Recipient info & amount banner */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recipient Member</span>
            <span className="text-sm font-bold text-slate-900">{whatsAppPayload.memberName}</span>
          </div>
          <div className="text-right">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Due</span>
            <span className="text-base font-extrabold text-forest-800">{formatINR(whatsAppPayload.totalDue)}</span>
          </div>
        </div>

        {/* 1. Language Dropdown / Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe2 size={14} className="text-forest-800" />
              <span>Reminder Language</span>
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Switch translation instantly
            </span>
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
            {REMINDER_LANGUAGES.map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => handleLanguageChange(l.key)}
                className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all ${
                  language === l.key
                    ? 'bg-white text-forest-800 shadow-sm border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="block text-xs">{l.label}</span>
                <span className="block text-[10px] text-slate-400 font-normal">{l.subLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Pre-filled Phone Number */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Mobile Number (10 digits)
            </label>
            {phone ? (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70 flex items-center gap-1">
                <Check size={11} className="text-emerald-700" />
                <span>Auto-filled from Member Directory</span>
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-700">
                Member phone not set
              </span>
            )}
          </div>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800 focus:border-forest-800 font-mono"
          />
        </div>

        {/* 3. Message preview textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-forest-800" />
              <span>Message Preview ({REMINDER_LANGUAGES.find((l) => l.key === language)?.label})</span>
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
            dir={language === 'ur' ? 'rtl' : 'ltr'}
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
