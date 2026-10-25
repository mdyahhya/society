import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, AlertCircle, Sparkles, Globe2 } from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { Modal } from '../common/Modal';

type TemplateLang = 'en' | 'mr' | 'hi';

interface TemplateItem {
  label: string;
  title: string;
  body: string;
}

const TEMPLATES: Record<TemplateLang, TemplateItem[]> = {
  en: [
    {
      label: 'Monthly Share Due',
      title: 'Al-Badr Bilasudi Society: Monthly Share Reminder',
      body: "Please deposit this month's regular share contribution of ₹300 at your earliest convenience.",
    },
    {
      label: 'Register Updated',
      title: 'Al-Badr Bilasudi Society: Register Updated',
      body: 'The monthly register ledger has been updated for this month. Please check your account passbook.',
    },
    {
      label: 'General Meeting',
      title: 'Al-Badr Bilasudi Society: Members Meeting',
      body: 'All members are requested to attend the upcoming monthly society meeting on Sunday.',
    },
    {
      label: 'Test Notification',
      title: 'Al-Badr Bilasudi Society: Test Notification',
      body: 'This is a test notification for Al-Badr Bilasudi Co-Op Society. The push notification engine is active!',
    },
  ],
  mr: [
    {
      label: 'वर्गणी आठवण',
      title: 'अल-बदर सोसायटी: वर्गणी आठवण',
      body: 'कृपया या महिन्याची नियमित मासिक वर्गणी ₹300 लवकरात लवकर जमा करावी.',
    },
    {
      label: 'रजिस्टर अद्ययावत',
      title: 'अल-बदर सोसायटी: मासिक रजिस्टर',
      body: 'चालू महिन्याचे मासिक नोंदवही रजिस्टर अद्ययावत झाले आहे. कृपया आपली नोंद तपासा.',
    },
    {
      label: 'सभासद बैठक',
      title: 'अल-बदर सोसायटी: महत्त्वाची बैठक',
      body: 'सर्व सभासदांना विनंती आहे की पुढील रविवारी आयोजित मासिक बैठकीस वेळेवर उपस्थित राहावे.',
    },
    {
      label: 'चाचणी सूचना',
      title: 'अल-बदर सोसायटी: चाचणी सूचना',
      body: 'ही अल-बदर बिलासुदी को.ऑप. सोसायटीची चाचणी सूचना आहे. नोटिफिकेशन सिस्टीम व्यवस्थित सुरू आहे!',
    },
  ],
  hi: [
    {
      label: 'अंशदान अनुस्मारक',
      title: 'अल-बद्र सोसाइटी: अंशदान अनुस्मारक',
      body: 'कृपया इस माह का नियमित अंशदान ₹300 जल्द से जल्द जमा करें।',
    },
    {
      label: 'रजिस्टर अपडेट',
      title: 'अल-बद्र सोसाइटी: रजिस्टर अपडेट',
      body: 'इस माह का मासिक रजिस्टर अपडेट हो गया है। कृपया अपना पासबुक विवरण देखें।',
    },
    {
      label: 'सदस्य बैठक',
      title: 'अल-बद्र सोसाइटी: सदस्य बैठक',
      body: 'सभी सदस्यों से अनुरोध है कि आगामी रविवार को आयोजित मासिक बैठक में उपस्थित रहें।',
    },
    {
      label: 'परीक्षण सूचना',
      title: 'अल-बद्र सोसाइटी: परीक्षण सूचना',
      body: 'यह अल-बद्र बिलासुदी को-ऑप सोसाइटी की परीक्षण सूचना है। सिस्टम सही काम कर रहा है!',
    },
  ],
};

export const BroadcastNotificationModal: React.FC = () => {
  const { isBroadcastModalOpen, setIsBroadcastModalOpen, sendBroadcastPush, appLanguage } = useSociety();

  const [modalLang, setModalLang] = useState<TemplateLang>(
    appLanguage === 'mr' ? 'mr' : appLanguage === 'hi' ? 'hi' : 'en'
  );

  const initialTemplates = TEMPLATES[modalLang];
  const [title, setTitle] = useState(initialTemplates[0].title);
  const [body, setBody] = useState(initialTemplates[0].body);
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isBroadcastModalOpen) return null;

  const handleSwitchModalLang = (lang: TemplateLang) => {
    setModalLang(lang);
    const templates = TEMPLATES[lang];
    setTitle(templates[0].title);
    setBody(templates[0].body);
    setStatusMsg(null);
  };

  const handleTemplate = (tTitle: string, tBody: string) => {
    setTitle(tTitle);
    setBody(tBody);
    setStatusMsg(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setIsSending(true);
    setStatusMsg(null);

    try {
      const res = await sendBroadcastPush(title, body, '/');
      if (res.success) {
        setStatusMsg({
          type: 'success',
          text:
            modalLang === 'mr'
              ? 'सूचना सर्व उपकरणांवर यशस्वीरीत्या पाठवली!'
              : modalLang === 'hi'
              ? 'सूचना सभी उपकरणों पर सफलतापूर्वक भेजी गई!'
              : 'Notification broadcast to all devices successfully!',
        });
        setTimeout(() => {
          setIsBroadcastModalOpen(false);
          setStatusMsg(null);
        }, 2200);
      } else {
        setStatusMsg({
          type: 'error',
          text:
            res.message ||
            (modalLang === 'mr'
              ? 'सूचना पाठवता आली नाही.'
              : modalLang === 'hi'
              ? 'सूचना भेजने में विफल।'
              : 'Failed to send notification.'),
        });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text:
          err.message ||
          (modalLang === 'mr'
            ? 'तांत्रिक त्रुटी आली.'
            : modalLang === 'hi'
            ? 'तकनीकी त्रुटि आई।'
            : 'Technical error occurred.'),
      });
    } finally {
      setIsSending(false);
    }
  };

  const modalTitle =
    modalLang === 'mr'
      ? 'सर्व सभासदांना वेब पुश सूचना पाठवा'
      : modalLang === 'hi'
      ? 'सभी सदस्यों को वेब पुश सूचना भेजें'
      : 'Send Web Push Notification';

  return (
    <Modal
      isOpen={isBroadcastModalOpen}
      onClose={() => setIsBroadcastModalOpen(false)}
      title={modalTitle}
    >
      <form onSubmit={handleSend} className="space-y-4">
        {/* Language Switcher Tabs inside Popup */}
        <div className="flex items-center justify-between p-2 bg-slate-100 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-2">
            <Globe2 size={15} className="text-emerald-800" />
            <span>{modalLang === 'mr' ? 'टेम्पलेट भाषा:' : modalLang === 'hi' ? 'टेम्पलेट भाषा:' : 'Template Language:'}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleSwitchModalLang('en')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                modalLang === 'en'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleSwitchModalLang('mr')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                modalLang === 'mr'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => handleSwitchModalLang('hi')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                modalLang === 'hi'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* Notice Info Banner */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
          <Bell size={18} className="text-emerald-700 shrink-0 mt-0.5" />
          <p>
            {modalLang === 'mr'
              ? 'ही सूचना ज्या सभासदांनी व ॲडमिनने मोबाईलवर किंवा कॉम्प्युटरवर सूचना स्वीकारल्या आहेत त्यांच्या थेट स्क्रीनवर दिसेल.'
              : modalLang === 'hi'
              ? 'यह सूचना उन सभी सदस्यों और व्यवस्थापक को सीधे स्क्रीन पर प्राप्त होगी जिन्होंने सूचनाएं सक्रिय की हैं।'
              : 'This notification will trigger an OS-level banner on mobile phones and desktop screens of all subscribed members and administrators.'}
          </p>
        </div>

        {/* Quick Ready-Made Template Chips in Selected Language */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={13} className="text-amber-500" />
            <span>
              {modalLang === 'mr'
                ? 'तयार मेसेज टेम्पलेट्स (क्लिक करा):'
                : modalLang === 'hi'
                ? 'तैयार मेसेज टेम्पलेट्स (क्लिक करें):'
                : 'Ready-Made Message Templates (Click to fill):'}
            </span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES[modalLang].map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTemplate(tmpl.title, tmpl.body)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  title === tmpl.title
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {modalLang === 'mr' ? 'सूचनेचे शीर्षक (Title)' : modalLang === 'hi' ? 'सूचना शीर्षक (Title)' : 'Notification Title'}
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {modalLang === 'mr' ? 'सूचनेचा तपशील (Message Body)' : modalLang === 'hi' ? 'सूचना विवरण (Message Body)' : 'Notification Message'}
          </label>
          <textarea
            required
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 resize-none"
          />
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsBroadcastModalOpen(false)}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            {modalLang === 'mr' ? 'रद्द करा' : modalLang === 'hi' ? 'रद्द करें' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={isSending}
            className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Send size={15} />
            <span>
              {isSending
                ? modalLang === 'mr'
                  ? 'पाठवत आहे...'
                  : modalLang === 'hi'
                  ? 'भेज रहे हैं...'
                  : 'Sending...'
                : modalLang === 'mr'
                ? 'सूचना पाठवा (Broadcast)'
                : modalLang === 'hi'
                ? 'सूचना भेजें (Broadcast)'
                : 'Send Broadcast Notification'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
