import React, { useState } from 'react';
import {
  Home,
  Users,
  PlusCircle,
  HandCoins,
  Settings,
  QrCode,
  ChevronDown,
  ShieldCheck,
  ArrowLeft,
  Globe2,
  BookOpen,
  Bell,
  BellRing,
  Download,
  User,
  Menu,
} from 'lucide-react';
import { useSociety, NavigationTab } from '../../context/SocietyContext';
import { APP_LANGUAGES, getLocalizedMonthName, getLocalizedSocietyName, getLocalizedEntityName } from '../../i18n/translations';
import { AppDrawerMenu } from './AppDrawerMenu';
import { ProfileModal } from '../common/ProfileModal';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeTab,
    navigateToTab,
    openCreateModal,
    openQrModal,
    society,
    selectedPeriod,
    setSelectedPeriod,
    t,
    appLanguage,
    setAppLanguage,
    currentUser,
    setIsLoginModalOpen,
    isPushSubscribed,
    subscribeToPushNotifications,
    triggerPwaInstall,
  } = useSociety();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Navigation Items translated
  const navItems: Array<{
    key: NavigationTab | 'create';
    label: string;
    icon: any;
    isAction?: boolean;
  }> = [
    { key: 'home', label: t('nav.home'), icon: Home },
    { key: 'members', label: t('nav.members'), icon: Users },
    { key: 'register', label: t('nav.register', 'Register'), icon: BookOpen },
    { key: 'create', label: t('header.quickAction'), icon: PlusCircle, isAction: true },
    { key: 'loans', label: t('nav.loans'), icon: HandCoins },
    { key: 'manage', label: t('nav.manage'), icon: Settings },
  ];

  const handleTogglePush = async () => {
    if (!isPushSubscribed) {
      await subscribeToPushNotifications();
    }
  };

  const handleProfileClick = () => {
    if (currentUser) {
      setIsProfileModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const localizedSocietyName = getLocalizedSocietyName(society, appLanguage);

  return (
    <div
      className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row antialiased"
      dir={appLanguage === 'ur' ? 'rtl' : 'ltr'}
    >
      {/* =========================================================================
          DESKTOP SIDE RAIL (Visible on md: and up)
         ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-slate-50/50 p-4 shrink-0 min-h-screen sticky top-0 justify-between">
        <div className="space-y-5">
          {/* Brand & Society Name */}
          <div
            onClick={() => navigateToTab('home')}
            className="flex items-center gap-3 px-2 py-1 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-sm font-bold text-base">
              {appLanguage === 'mr' ? 'अ' : 'A'}
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                {t('header.tagline')}
              </span>
              <h1 className="text-sm font-bold text-slate-900 truncate" title={localizedSocietyName}>
                {localizedSocietyName}
              </h1>
            </div>
          </div>

          {/* User Profile Button Card with click to open My Profile */}
          <div
            onClick={handleProfileClick}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer transition-all flex items-center justify-between shadow-2xs group"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                  currentUser?.role === 'admin'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {currentUser?.role === 'admin' ? '👑' : <User size={15} />}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 truncate text-xs group-hover:text-emerald-800 transition-colors">
                  {currentUser ? getLocalizedEntityName(currentUser, appLanguage) : (appLanguage === 'mr' ? 'लॉगिन करा' : 'Log In')}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {currentUser?.role === 'admin'
                    ? t('menu.secretaryAdmin', 'Secretary / Admin')
                    : currentUser
                    ? `${t('menu.memberAcc', 'Member')} #${currentUser.account_no}`
                    : t('menu.guestMode', 'Guest Mode')}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 group-hover:underline">
              {appLanguage === 'mr' ? 'प्रोफाइल →' : 'Profile →'}
            </span>
          </div>

          {/* Quick Create Action Button */}
          <button
            type="button"
            onClick={() => openCreateModal('contribution')}
            className="w-full py-2.5 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <PlusCircle size={16} />
            <span>{t('header.quickAction')}</span>
          </button>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems
              .filter((item) => !item.isAction)
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigateToTab(item.key as NavigationTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Footer info in desktop sidebar */}
        <div className="p-3 bg-white border border-slate-200 rounded-2xl text-[11px] space-y-2">
          {/* PWA & Push Quick actions */}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleTogglePush}
              title={isPushSubscribed ? 'Web Push सूचना सक्रिय आहेत' : 'Web Push सूचना सुरू करा'}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
                isPushSubscribed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isPushSubscribed ? <BellRing size={12} className="text-emerald-700" /> : <Bell size={12} />}
              <span>{isPushSubscribed ? 'सूचना चालू' : 'सूचना घ्या'}</span>
            </button>
            <button
              type="button"
              onClick={triggerPwaInstall}
              title="Install App"
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
            >
              <Download size={12} />
              <span>इन्स्टॉल</span>
            </button>
          </div>

          {/* Language Switcher pill in sidebar */}
          <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px] pt-1 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Globe2 size={13} className="text-emerald-800" />
              <span>{t('manage.appLanguage')}</span>
            </span>
            <select
              value={appLanguage}
              onChange={(e) => setAppLanguage(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-lg px-2 py-0.5 focus:outline-none"
            >
              {APP_LANGUAGES.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <span>UPI ID</span>
            <button
              type="button"
              onClick={() => openQrModal()}
              className="text-emerald-800 hover:underline"
            >
              {t('manage.showQr')}
            </button>
          </div>
          <div className="font-mono text-slate-700 truncate text-[11px]" title={society.upi_id}>
            {society.upi_id}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN APPLICATION AREA
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar with FIXED Menu Button on top-left across each and every section */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Left: Top-Left Hamburger Menu Button + Screen Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Top-Left Menu Button (Fixed across all sections) */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 -ml-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs"
              aria-label="Open Full Navigation Menu"
              title={appLanguage === 'mr' ? 'मेनू उघडा' : 'Open Navigation Menu'}
            >
              <Menu size={19} />
            </button>

            {/* Back button if not home (optional shortcut) */}
            {activeTab !== 'home' && (
              <button
                type="button"
                onClick={() => navigateToTab('home')}
                className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors hidden sm:flex items-center gap-1 shrink-0"
                aria-label="Back to Home"
                title={t('header.backToHome', 'Back to Home')}
              >
                <ArrowLeft size={16} />
              </button>
            )}

            <div className="min-w-0">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block leading-none truncate">
                {localizedSocietyName}
              </span>
              <span className="text-sm font-extrabold text-slate-900 capitalize truncate block">
                {activeTab === 'home'
                  ? t('nav.home')
                  : activeTab === 'members'
                  ? t('nav.members')
                  : activeTab === 'register'
                  ? t('nav.register', 'Register')
                  : activeTab === 'loans'
                  ? t('nav.loans')
                  : t('nav.manage')}
              </span>
            </div>
          </div>

          {/* Right: User Profile Button, Push Bell, Language & Period Selectors */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Top Header User Profile Button (Click opens My Profile with history) */}
            <button
              type="button"
              onClick={handleProfileClick}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                currentUser?.role === 'admin'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : currentUser
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
              title={appLanguage === 'mr' ? 'माझे प्रोफाइल व भरणा इतिहास पहा' : 'View Profile & Payment History'}
            >
              <span>{currentUser?.role === 'admin' ? '👑' : <User size={13} className="inline mr-0.5" />}</span>
              <span className="truncate max-w-[100px] sm:max-w-[140px]">
                {currentUser ? getLocalizedEntityName(currentUser, appLanguage) : (appLanguage === 'mr' ? 'लॉगिन' : 'Login')}
              </span>
            </button>

            {/* Web Push Notification Bell */}
            <button
              type="button"
              onClick={handleTogglePush}
              title={isPushSubscribed ? (appLanguage === 'mr' ? 'Web Push सूचना सक्रिय आहेत' : 'Web Push notifications active') : (appLanguage === 'mr' ? 'Web Push सूचना सुरू करा' : 'Enable Web Push notifications')}
              className={`p-1.5 rounded-xl border transition-colors ${
                isPushSubscribed
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isPushSubscribed ? <BellRing size={16} /> : <Bell size={16} />}
            </button>

            {/* Quick App Language Selector */}
            <div className="relative hidden sm:block">
              <select
                value={appLanguage}
                onChange={(e) => setAppLanguage(e.target.value as any)}
                className="appearance-none bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl px-2.5 py-1.5 pr-6 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer hover:bg-emerald-100 transition-colors"
                aria-label="Application Language"
                title="Application Language"
              >
                {APP_LANGUAGES.map((lang) => (
                  <option key={lang.key} value={lang.key}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <Globe2
                size={12}
                className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-emerald-800"
              />
            </div>

            {/* Quick UPI QR Trigger */}
            <button
              type="button"
              onClick={() => openQrModal()}
              className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
              title="Show Society UPI QR Code"
              aria-label="Show QR Code"
            >
              <QrCode size={17} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto pb-24 md:pb-8">{children}</main>
      </div>

      {/* =========================================================================
          MOBILE BOTTOM TAB BAR (Sticky to bottom on mobile, hidden on desktop)
         ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1.5 py-1 flex items-center justify-around safe-area-bottom print:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          if (item.isAction) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => openCreateModal('contribution')}
                className="flex flex-col items-center justify-center -mt-5"
                aria-label="Create transaction"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-emerald-900 transition-transform active:scale-95">
                  <PlusCircle size={24} />
                </div>
                <span className="text-[9px] font-bold text-slate-700 mt-0.5">{t('header.quickAction')}</span>
              </button>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigateToTab(item.key as NavigationTab)}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                isActive ? 'text-emerald-800 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Slide-out Menu Drawer */}
      <AppDrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* My Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
