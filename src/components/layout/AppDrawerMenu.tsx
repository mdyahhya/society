import React from 'react';
import {
  Home,
  Users,
  BookOpen,
  HandCoins,
  Settings,
  User,
  ShieldCheck,
  KeyRound,
  BellRing,
  Download,
  Globe2,
  QrCode,
  LogOut,
  LogIn,
  X,
  ChevronRight,
} from 'lucide-react';
import { useSociety, NavigationTab } from '../../context/SocietyContext';
import { APP_LANGUAGES, getLocalizedSocietyName, getLocalizedEntityName } from '../../i18n/translations';

interface AppDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

export const AppDrawerMenu: React.FC<AppDrawerMenuProps> = ({
  isOpen,
  onClose,
  onOpenProfile,
}) => {
  const {
    activeTab,
    navigateToTab,
    currentUser,
    society,
    openPasswordModal,
    openQrModal,
    setIsLoginModalOpen,
    logout,
    subscribeToPushNotifications,
    isPushSubscribed,
    triggerPwaInstall,
    appLanguage,
    setAppLanguage,
    t,
  } = useSociety();

  if (!isOpen) return null;

  const handleNav = (tab: NavigationTab) => {
    navigateToTab(tab);
    onClose();
  };

  const handleOpenProfileClick = () => {
    onClose();
    onOpenProfile();
  };

  const handlePasswordClick = () => {
    onClose();
    openPasswordModal(
      currentUser?.role === 'admin'
        ? { type: 'admin' }
        : { type: 'member' }
    );
  };

  const handleLogoutClick = () => {
    logout();
    onClose();
  };

  const localizedSocietyName = getLocalizedSocietyName(society, appLanguage);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Menu Panel */}
      <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Header Bar with Close */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {appLanguage === 'mr' ? 'अ' : 'A'}
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block leading-none">
                  {t('menu.title', 'Navigation Menu')}
                </span>
                <h3 className="text-xs font-bold text-slate-900 truncate max-w-[170px]" title={localizedSocietyName}>
                  {localizedSocietyName}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Profile Button Card (Top of Menu) */}
          <div
            onClick={currentUser ? handleOpenProfileClick : () => { onClose(); setIsLoginModalOpen(true); }}
            className="p-3 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl shadow-sm cursor-pointer hover:opacity-95 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-base shrink-0 border border-white/30">
                {currentUser?.role === 'admin' ? '👑' : <User size={18} />}
              </div>
              <div className="overflow-hidden">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-700/60 text-emerald-200 uppercase tracking-wider">
                  {currentUser?.role === 'admin'
                    ? t('menu.secretaryAdmin', 'Secretary / Admin')
                    : currentUser
                    ? `${t('menu.memberAcc', 'Member')} #${currentUser.account_no}`
                    : t('menu.guestMode', 'Guest Mode')}
                </span>
                <h4 className="text-xs font-bold truncate mt-0.5">
                  {currentUser ? getLocalizedEntityName(currentUser, appLanguage) : (appLanguage === 'mr' ? 'लॉगिन करा' : 'Log In')}
                </h4>
                <p className="text-[10px] text-emerald-200 truncate">
                  {currentUser
                    ? (appLanguage === 'mr' ? 'माझे प्रोफाइल व भरणा इतिहास →' : 'My Profile & Passbook →')
                    : (appLanguage === 'mr' ? 'खाते ॲक्सेस करण्यासाठी टॅप करा' : 'Tap to sign in to account')}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-emerald-300 shrink-0" />
          </div>

          {/* Main Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
              {t('menu.sections', 'Sections')}
            </span>

            <button
              type="button"
              onClick={() => handleNav('home')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'home'
                  ? 'bg-emerald-800 text-white font-bold shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Home size={17} />
              <span>{t('nav.home')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('members')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'members'
                  ? 'bg-emerald-800 text-white font-bold shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Users size={17} />
              <span>{t('nav.members')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('register')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'register'
                  ? 'bg-emerald-800 text-white font-bold shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <BookOpen size={17} />
              <span>{t('nav.register', 'Monthly Register')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('loans')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'loans'
                  ? 'bg-emerald-800 text-white font-bold shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <HandCoins size={17} />
              <span>{t('nav.loans')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('manage')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'manage'
                  ? 'bg-emerald-800 text-white font-bold shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Settings size={17} />
              <span>{t('nav.manage')}</span>
            </button>
          </div>

          {/* More Quick Tools */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
              {t('menu.moreOptions', 'More Options')}
            </span>

            {currentUser && (
              <>
                <button
                  type="button"
                  onClick={handleOpenProfileClick}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                >
                  <User size={16} className="text-emerald-800" />
                  <span>{t('menu.myProfile', 'My Profile & Passbook')}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePasswordClick}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                >
                  <KeyRound size={16} className="text-amber-700" />
                  <span>{t('menu.changePassword', 'Change Password / PIN')}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                subscribeToPushNotifications();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 font-medium transition-colors"
            >
              <span className="flex items-center gap-3">
                <BellRing size={16} className="text-emerald-700" />
                <span>{t('menu.webPush', 'Web Push Alerts')}</span>
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isPushSubscribed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {isPushSubscribed ? t('menu.active', 'Active') : t('menu.enable', 'Enable')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                triggerPwaInstall();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 font-medium transition-colors"
            >
              <Download size={16} className="text-slate-700" />
              <span>{t('menu.installApp', 'Install Mobile App (PWA)')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                openQrModal();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 font-medium transition-colors"
            >
              <QrCode size={16} className="text-slate-700" />
              <span>{t('menu.upiQr', 'Society UPI QR Code')}</span>
            </button>
          </div>
        </div>

        {/* Footer with Language and Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
          {/* Language selector in drawer */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <Globe2 size={14} className="text-emerald-800" />
              <span>{t('menu.language', 'Language')}:</span>
            </span>
            <select
              value={appLanguage}
              onChange={(e) => setAppLanguage(e.target.value as any)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              {APP_LANGUAGES.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Login / Logout button */}
          {currentUser ? (
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-red-200"
            >
              <LogOut size={14} />
              <span>{t('menu.logout', 'Log Out')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsLoginModalOpen(true);
              }}
              className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogIn size={14} />
              <span>{t('menu.login', 'Log In')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
