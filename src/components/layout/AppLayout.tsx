import {
  Home,
  Users,
  PlusCircle,
  HandCoins,
  Settings,
  QrCode,
  Calendar,
  ChevronDown,
  Building2,
  ShieldCheck,
  ArrowLeft,
  Globe2,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { getCurrentPeriod } from '../../utils/formatters';
import { APP_LANGUAGES, getLocalizedMonthName } from '../../i18n/translations';

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
  } = useSociety();

  const currentPeriod = getCurrentPeriod();

  // Navigation Items translated
  const navItems = [
    { key: 'home' as const, label: t('nav.home'), icon: Home },
    { key: 'members' as const, label: t('nav.members'), icon: Users },
    // Center [+] is special
    { key: 'create' as const, label: t('header.quickAction'), icon: PlusCircle, isAction: true },
    { key: 'loans' as const, label: t('nav.loans'), icon: HandCoins },
    { key: 'manage' as const, label: t('nav.manage'), icon: Settings },
  ];

  return (
    <div
      className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row antialiased"
      dir={appLanguage === 'ur' ? 'rtl' : 'ltr'}
    >
      {/* =========================================================================
          DESKTOP SIDE RAIL (Visible on md: and up)
         ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-slate-50/50 p-4 shrink-0 min-h-screen sticky top-0 justify-between">
        <div className="space-y-6">
          {/* Brand & Society Name */}
          <div
            onClick={() => navigateToTab('home')}
            className="flex items-center gap-3 px-2 py-1 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-2xl bg-forest-800 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 block">
                {t('header.tagline')}
              </span>
              <h1 className="text-sm font-bold text-slate-900 truncate" title={society.name}>
                {society.name}
              </h1>
            </div>
          </div>

          {/* Quick Create Action Button */}
          <button
            type="button"
            onClick={() => openCreateModal('contribution')}
            className="w-full py-2.5 px-4 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
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
                    onClick={() => navigateToTab(item.key as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-forest-800 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Footer info in desktop sidebar */}
        <div className="p-3 bg-white border border-slate-200 rounded-2xl text-[11px] space-y-2">
          {/* Language Switcher pill in sidebar */}
          <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
            <span className="flex items-center gap-1">
              <Globe2 size={13} className="text-forest-800" />
              <span>{t('manage.appLanguage')}</span>
            </span>
            <select
              value={appLanguage}
              onChange={(e) => setAppLanguage(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-lg px-2 py-0.5 focus:outline-none"
            >
              {APP_LANGUAGES.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <span>UPI ID</span>
            <button
              type="button"
              onClick={() => openQrModal()}
              className="text-forest-800 hover:underline"
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
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Left: Mobile Title / Active Screen Title + Back Button */}
          <div className="flex items-center gap-2 min-w-0">
            {activeTab !== 'home' ? (
              <button
                type="button"
                onClick={() => navigateToTab('home')}
                className="p-1.5 -ml-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1 shrink-0"
                aria-label="Back to Home"
                title="Back to Home"
              >
                <ArrowLeft size={18} />
                <span className="text-xs font-semibold hidden sm:inline">{t('header.home')}</span>
              </button>
            ) : (
              <div className="md:hidden w-8 h-8 rounded-xl bg-forest-800 text-white flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-forest-800 uppercase tracking-wider block leading-none truncate">
                {society.name}
              </span>
              <span className="text-sm font-extrabold text-slate-900 capitalize truncate block">
                {activeTab === 'home'
                  ? t('nav.home')
                  : activeTab === 'members'
                  ? t('nav.members')
                  : activeTab === 'loans'
                  ? t('nav.loans')
                  : t('nav.manage')}
              </span>
            </div>
          </div>

          {/* Right: Quick Language Switcher, Period Selector & Quick QR */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick App Language Selector */}
            <div className="relative">
              <select
                value={appLanguage}
                onChange={(e) => setAppLanguage(e.target.value as any)}
                className="appearance-none bg-emerald-50 border border-emerald-300 text-forest-900 rounded-xl px-2 sm:px-2.5 py-1.5 pr-5 sm:pr-6 text-[11px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-forest-800 shadow-2xs cursor-pointer hover:bg-emerald-100 transition-colors"
                aria-label="Application Language"
                title="Application Language / زبان منتخب کریں / भाषा बदलें"
              >
                {APP_LANGUAGES.map((lang) => (
                  <option key={lang.key} value={lang.key}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
              <Globe2
                size={12}
                className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-forest-800"
              />
            </div>

            {/* Period selector */}
            <div className="relative">
              <select
                value={`${selectedPeriod.year}-${selectedPeriod.month}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-').map(Number);
                  setSelectedPeriod({
                    year: y,
                    month: m,
                    monthName: getLocalizedMonthName(m, appLanguage),
                  });
                }}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-2 sm:px-2.5 py-1.5 pr-5 sm:pr-6 text-[11px] sm:text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-800"
              >
                {[0, -1, -2, -3].map((offset) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() + offset);
                  const y = d.getFullYear();
                  const m = d.getMonth() + 1;
                  return (
                    <option key={`${y}-${m}`} value={`${y}-${m}`}>
                      {getLocalizedMonthName(m, appLanguage)} {y}
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400"
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
        <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto">{children}</main>
      </div>

      {/* =========================================================================
          MOBILE BOTTOM TAB BAR (Sticky to bottom on mobile, hidden on desktop)
         ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around safe-area-bottom">
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
                <div className="w-12 h-12 rounded-full bg-forest-800 text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-forest-900 transition-transform active:scale-95">
                  <PlusCircle size={26} />
                </div>
                <span className="text-[10px] font-bold text-slate-700 mt-0.5">{t('header.quickAction')}</span>
              </button>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigateToTab(item.key as any)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
                isActive ? 'text-forest-800 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
