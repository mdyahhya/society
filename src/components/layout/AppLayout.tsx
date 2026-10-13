import React from 'react';
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
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { getCurrentPeriod, getMonthName } from '../../utils/formatters';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    openCreateModal,
    openQrModal,
    society,
    selectedPeriod,
    setSelectedPeriod,
  } = useSociety();

  const currentPeriod = getCurrentPeriod();

  // Navigation Items
  const navItems = [
    { key: 'home' as const, label: 'Home', icon: Home },
    { key: 'members' as const, label: 'Members', icon: Users },
    // Center [+] is special
    { key: 'create' as const, label: 'Create', icon: PlusCircle, isAction: true },
    { key: 'loans' as const, label: 'Loans', icon: HandCoins },
    { key: 'manage' as const, label: 'Manage', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row antialiased">
      {/* =========================================================================
          DESKTOP SIDE RAIL (Visible on md: and up)
         ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-slate-50/50 p-4 shrink-0 min-h-screen sticky top-0 justify-between">
        <div className="space-y-6">
          {/* Brand & Society Name */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-2xl bg-forest-800 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 block">
                Qarz-e-Hasan PWA
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
            <span>New Transaction</span>
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
                    onClick={() => setActiveTab(item.key as any)}
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
        <div className="p-3 bg-white border border-slate-200 rounded-2xl text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <span>UPI ID</span>
            <button
              type="button"
              onClick={() => openQrModal()}
              className="text-forest-800 hover:underline"
            >
              Show QR
            </button>
          </div>
          <div className="font-mono text-slate-700 truncate" title={society.upi_id}>
            {society.upi_id}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN APPLICATION AREA
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Left: Mobile Title / Active Screen Title */}
          <div className="flex items-center gap-2.5">
            <div className="md:hidden w-8 h-8 rounded-xl bg-forest-800 text-white flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-forest-800 uppercase tracking-wider block leading-none">
                {society.name}
              </span>
              <span className="text-sm font-extrabold text-slate-900 capitalize">
                {activeTab} Overview
              </span>
            </div>
          </div>

          {/* Right: Period Selector & Quick QR */}
          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="relative">
              <select
                value={`${selectedPeriod.year}-${selectedPeriod.month}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-').map(Number);
                  setSelectedPeriod({
                    year: y,
                    month: m,
                    monthName: getMonthName(m),
                  });
                }}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pr-7 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-800"
              >
                {[0, -1, -2, -3].map((offset) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() + offset);
                  const y = d.getFullYear();
                  const m = d.getMonth() + 1;
                  return (
                    <option key={`${y}-${m}`} value={`${y}-${m}`}>
                      {getMonthName(m)} {y}
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
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
              <QrCode size={18} />
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
                <span className="text-[10px] font-bold text-slate-700 mt-0.5">Create</span>
              </button>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key as any)}
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
