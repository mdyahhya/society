import React from 'react';
import { Download, Share, PlusSquare, Smartphone, Check, X } from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { Modal } from '../common/Modal';

export const PwaInstallModal: React.FC = () => {
  const { isPwaInstallModalOpen, setIsPwaInstallModalOpen, triggerPwaInstall, canInstallPwa } = useSociety();

  if (!isPwaInstallModalOpen) return null;

  const isIos =
    typeof navigator !== 'undefined' &&
    /iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <Modal
      isOpen={isPwaInstallModalOpen}
      onClose={() => setIsPwaInstallModalOpen(false)}
      title="मोबाईलवर ॲप इन्स्टॉल करा (Install App)"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shrink-0">
            अ
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              अल-बदर बिलासुदी को.ऑप. सोसायटी
            </h4>
            <p className="text-[11px] text-emerald-800 font-medium">
              मोबाईल होम स्क्रीनवर ॲप प्रमाणे वापरा, इंटरनेटशिवायही उपलब्ध.
            </p>
          </div>
        </div>

        {isIos ? (
          <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Smartphone size={16} className="text-emerald-700" />
              <span>Apple iPhone / iPad (Safari) मार्गदर्शक:</span>
            </h5>
            <ol className="text-xs text-slate-700 space-y-2 pl-4 list-decimal">
              <li className="leading-relaxed">
                Safari ब्राउझरमध्ये खालील <strong>Share</strong> बटणावर टॅप करा.{' '}
                <Share size={14} className="inline text-blue-600 align-middle ml-1" />
              </li>
              <li className="leading-relaxed">
                खाली स्क्रोल करून <strong>'Add to Home Screen'</strong> निवडा.{' '}
                <PlusSquare size={14} className="inline text-slate-700 align-middle ml-1" />
              </li>
              <li className="leading-relaxed">
                वर उजव्या कोपऱ्यात <strong>'Add'</strong> वर टॅप करा. ॲप होम स्क्रीनवर सेव्ह होईल.
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Google Chrome किंवा इतर ब्राउझरमध्ये खालील बटण दाबून हे ॲप तुमच्या फोनवर थेट इन्स्टॉल करा.
            </p>
            {canInstallPwa ? (
              <button
                type="button"
                onClick={triggerPwaInstall}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <Download size={16} />
                <span>आता इन्स्टॉल करा (Install Now)</span>
              </button>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <p>
                  ॲप आधीच इन्स्टॉल केलेले असावे किंवा ब्राउझर मेनू (⋮) मधून <strong>'Add to Home screen'</strong> निवडा.
                </p>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsPwaInstallModalOpen(false)}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
        >
          बंद करा
        </button>
      </div>
    </Modal>
  );
};
