# Qarz-e-Hasan Society Management PWA

A mobile-first, multi-tenant Progressive Web App (PWA) designed specifically for community-run **No-Interest (Qarz-e-Hasan / Bila Soodi)** welfare societies.

---

## Key Features

- **Mutual Liquidity Pool**: Real-time pool accounting where monthly member shares expand available cash, interest-free loans disburse capital, and repayments replenish the fund.
- **Member Management**: Track member directory, contact details, join dates, and committed monthly shares.
- **Monthly Share Tracking**: One-tap logging of monthly shares with payment methods (UPI, Cash, Bank Transfer).
- **Qarz-e-Hasan Loan Cycles**: Disburse zero-interest loans with installment plans and auto-calculated remaining balances.
- **Defaulters Radar**: Real-time detection of overdue monthly shares and delayed loan installments.
- **1-Tap WhatsApp Reminders**: Direct `wa.me` deep links with prefilled polite Islamic welfare notices and exact amount breakdown.
- **Direct Society UPI QR Code**: Dynamic NPCI UPI QR code generator (`upi://pay?pa=...`) directly linked to the society's own bank account with zero platform custody, plus printable standee mode.
- **Treasurer Export Center**: Download formatted CSV audits for monthly collections, loan portfolios, and defaulter lists.
- **Installable PWA**: Installable on Android Chrome, iOS Safari, and desktop browsers with offline support.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons (SVG only, zero emojis)
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **QR Code Engine**: `qrcode.react`
- **PWA**: Service Worker (`sw.js`) and Web App Manifest (`manifest.json`)

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file from `.env.example`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
*(Note: If Supabase credentials are not provided, the app automatically runs in offline/local storage demo mode with full persistence.)*

### 3. Database Migration
Run the SQL migration script in your Supabase SQL Editor:
```
supabase/migrations/20261013000001_initial_schema.sql
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```
