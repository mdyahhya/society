# अल-बदर बिलासौदी को.ऑप. सोसायटी, सोलापूर
### Al-Badr Bilasudi Co-Op Society - Financial Register & Management PWA

A mobile-first Progressive Web App (PWA) tailored specifically for **Al-Badr Bilasudi Co-Op Society, Solapur**, a mutual welfare and interest-free loan society.

---

## 🌟 Key Capabilities

1. **Digital Register & Single-Sheet A4 Print Engine**:
   - Exact replication of the physical 40-member register book.
   - High-density landscape print engine (`@media print`) that fits all 40 members, totals, cash reconciliation, and secretary/president signatures on a single A4 sheet.
2. **Simplified Direct Authentication (Zero Email Verification)**:
   - Admin login with phone / username (`admin` or `9800000000`) and passcode.
   - Member login using **Account No (1–40)** or phone number + PIN (default `1234`).
   - Admin can add, edit, or delete any member, and reset member passwords with 1 click.
3. **OS-Level Web Push Notifications**:
   - Notifications trigger even when the PWA or browser is completely closed.
   - Automatic receipt push notifications on monthly share collection, loan installment payment, and loan disbursal.
   - Automated and manual due date reminders for unpaid members.
   - Broadcast announcements for meetings and society circulars.
4. **Member Self-Service Portal**:
   - Passbook overview showing accumulated shares and remaining loan balance.
   - Instant UPI payment QR code (`upi://pay?pa=...`) for monthly shares.
5. **Treasurer Export Center**:
   - 1-click CSV audit exports for monthly contributions, loan portfolios, and defaulters radar.
6. **Installable PWA**:
   - Native Android Chrome install prompt and guided iOS Safari instructions.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file based on `.env.example`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@albadr-society.org
```
*(See [docs/ENV_VARIABLES.md](docs/ENV_VARIABLES.md) for full setup instructions on Vercel.)*

### 3. Database Migration
Run the consolidated single migration script in your Supabase SQL Editor:
```
supabase/migrations/20261025000001_single_society_schema.sql
```

### 4. Run Locally
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
```
