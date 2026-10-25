import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { Modal } from '../common/Modal';

export const BroadcastNotificationModal: React.FC = () => {
  const { isBroadcastModalOpen, setIsBroadcastModalOpen, sendBroadcastPush, society } = useSociety();

  const [title, setTitle] = useState('अल-बदर सोसायटी सूचना');
  const [body, setBody] = useState('माहे चालू महिन्याची वर्गणी ₹300 लवकरात लवकर जमा करावी.');
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isBroadcastModalOpen) return null;

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
        setStatusMsg({ type: 'success', text: res.message || 'सूचना सर्व उपकरणांवर यशस्वीरीत्या पाठवली!' });
        setTimeout(() => {
          setIsBroadcastModalOpen(false);
          setStatusMsg(null);
        }, 2200);
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'सूचना पाठवता आली नाही.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'तांत्रिक त्रुटी आली.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isBroadcastModalOpen}
      onClose={() => setIsBroadcastModalOpen(false)}
      title="सर्व सभासदांना वेब पुश सूचना पाठवा"
    >
      <form onSubmit={handleSend} className="space-y-4">
        {/* Notice Info */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
          <Bell size={18} className="text-emerald-700 shrink-0 mt-0.5" />
          <p>
            ही सूचना ज्या सभासदांनी व ॲडमिनने मोबाईलवर PWA किंवा ॲपमध्ये सूचना स्वीकारल्या आहेत त्यांच्या थेट स्क्रीनवर दिसेल.
          </p>
        </div>

        {/* Quick Template Chips */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={13} className="text-amber-500" />
            <span>तयार मेसेज टेम्पलेट्स:</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() =>
                handleTemplate(
                  'अल-बदर सोसायटी: वर्गणी आठवण',
                  'कृपया या महिन्याची नियमित मासिक वर्गणी ₹300 लवकरात लवकर जमा करावी.'
                )
              }
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              वर्गणी आठवण
            </button>
            <button
              type="button"
              onClick={() =>
                handleTemplate(
                  'अल-बदर सोसायटी: मासिक रजिस्टर',
                  'चालू महिन्याचे मासिक नोंदवही रजिस्टर अद्ययावत झाले आहे. कृपया आपली नोंद तपासा.'
                )
              }
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              रजिस्टर अद्ययावत
            </button>
            <button
              type="button"
              onClick={() =>
                handleTemplate(
                  'अल-बदर सोसायटी: महत्त्वाची बैठक',
                  'सर्व सभासदांना विनंती आहे की पुढील रविवारी आयोजित मासिक बैठकीस वेळेवर उपस्थित राहावे.'
                )
              }
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              सभासद बैठक
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">सूचनेचे शीर्षक (Title)</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">सूचनेचा तपशील (Message Body)</label>
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
            रद्द करा
          </button>
          <button
            type="submit"
            disabled={isSending}
            className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Send size={15} />
            <span>{isSending ? 'पाठवत आहे...' : 'सूचना पाठवा (Broadcast)'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
