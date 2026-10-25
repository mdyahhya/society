-- ==============================================================================
-- Al-Badr Bilasudi Co-Op Society, Solapur
-- Database Schema & Initial Data Migration
-- Single-Society Architecture with Direct Phone/PIN Authentication
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop any legacy tables if existing
DROP TABLE IF EXISTS public.ledger_entries CASCADE;
DROP TABLE IF EXISTS public.monthly_ledgers CASCADE;
DROP TABLE IF EXISTS public.loans CASCADE;
DROP TABLE IF EXISTS public.loan_repayments CASCADE;
DROP TABLE IF EXISTS public.contributions CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.society_members CASCADE;
DROP TABLE IF EXISTS public.society_profile CASCADE;
DROP TABLE IF EXISTS public.app_auth_users CASCADE;
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;
DROP TABLE IF EXISTS public.societies CASCADE;
DROP TABLE IF EXISTS public.society_admins CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- 3. Society Profile (Single Society)
CREATE TABLE public.society_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_mr TEXT NOT NULL DEFAULT 'अल-बदर बिलासौदी को.ऑप. सोसायटी, सोलापूर.',
    name_en TEXT NOT NULL DEFAULT 'Al-Badr Bilasudi Co-Op Society, Solapur',
    monthly_share_amount NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    upi_id TEXT NOT NULL DEFAULT 'albadr.society@okaxis',
    contact_phone TEXT NOT NULL DEFAULT '9800000000',
    address TEXT NOT NULL DEFAULT 'Bilasudi, Solapur, Maharashtra',
    cash_balance NUMERIC(12, 2) NOT NULL DEFAULT 820.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default single society record
INSERT INTO public.society_profile (name_mr, name_en, monthly_share_amount, upi_id, contact_phone, address, cash_balance)
VALUES ('अल-बदर बिलासौदी को.ऑप. सोसायटी, सोलापूर.', 'Al-Badr Bilasudi Co-Op Society, Solapur', 300.00, 'albadr.society@okaxis', '9800000000', 'Bilasudi, Solapur, Maharashtra', 820.00);

-- 4. Auth Users Table (Direct phone & password authentication - NO email verification needed)
CREATE TABLE public.app_auth_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
    account_no INTEGER UNIQUE, -- NULL for admin, 1-40 for members
    phone TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- Starting admin password: 'admin321', members: '1234' (editable in admin panel)
    full_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default Admin User (phone: '9800000000' or 'admin', password: 'admin321')
INSERT INTO public.app_auth_users (role, account_no, phone, password, full_name)
VALUES ('admin', 0, '9800000000', 'admin321', 'सेक्रेटरी / ॲडमिन (Secretary / Admin)');

-- 5. Members Table (All 40 Members with Marathi & English names and initial share balances)
CREATE TABLE public.society_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_no INTEGER NOT NULL UNIQUE CHECK (account_no BETWEEN 1 AND 100),
    name_mr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL DEFAULT '1234',
    monthly_share NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    cumulative_shares NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Active Loans Table
CREATE TABLE public.society_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_no INTEGER NOT NULL REFERENCES public.society_members(account_no) ON DELETE CASCADE,
    principal_amount NUMERIC(12, 2) NOT NULL CHECK (principal_amount > 0),
    monthly_installment NUMERIC(10, 2) NOT NULL CHECK (monthly_installment > 0),
    remaining_balance NUMERIC(12, 2) NOT NULL CHECK (remaining_balance >= 0),
    disbursed_period TEXT NOT NULL, -- e.g. 'Oct-2024'
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Monthly Ledgers (Registers)
CREATE TABLE public.monthly_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_label TEXT NOT NULL, -- e.g. 'Oct - 24'
    previous_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_shares_collected NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_installments_collected NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_gross_collected NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_cash_available NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    loan_disbursed_account_no INTEGER,
    loan_disbursed_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    closing_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_finalized BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(period_year, period_month)
);

-- 8. Ledger Entries (Line items for each of the 40 members for a given month)
CREATE TABLE public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ledger_id UUID NOT NULL REFERENCES public.monthly_ledgers(id) ON DELETE CASCADE,
    account_no INTEGER NOT NULL,
    name_mr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    monthly_share NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    cumulative_shares NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    loan_approved NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    loan_installment NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    loan_balance_remaining NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    fine NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    is_paid BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(ledger_id, account_no)
);

-- 9. Web Push Subscriptions for Android & iOS
CREATE TABLE public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_identifier TEXT NOT NULL, -- account_no or 'admin'
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'android',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- Seed All 40 Members From Physical Register
-- ==============================================================================

INSERT INTO public.society_members (account_no, name_mr, name_en, phone, password, monthly_share, cumulative_shares) VALUES
(1, 'इम्रान सय्यद', 'Imran Sayyad', '9800000001', '1234', 300.00, 72100.00),
(2, 'युनुस सय्यद', 'Yunus Sayyad', '9800000002', '1234', 300.00, 54100.00),
(3, 'वाजिद गैबू', 'Wajid Gaibu', '9800000003', '1234', 300.00, 54100.00),
(4, 'आतिक गैबू', 'Aatik Gaibu', '9800000004', '1234', 300.00, 54100.00),
(5, 'I.Q. Motegaon', 'I.Q. Motegaon', '9800000005', '1234', 300.00, 72100.00),
(6, 'अ.कदीर आळंदकर', 'A. Qadeer Alandkar', '9800000006', '1234', 300.00, 54100.00),
(7, 'आसिफ एलाल', 'Aasif Elal', '9800000007', '1234', 300.00, 54100.00),
(8, 'इस्माईल मंगलगीरी', 'Ismail Mangalgiri', '9800000008', '1234', 300.00, 54100.00),
(9, 'इसा मंगलगीरी', 'Isa Mangalgiri', '9800000009', '1234', 300.00, 54100.00),
(10, 'इलियास मंगलगीरी', 'Ilyas Mangalgiri', '9800000010', '1234', 300.00, 54100.00),
(11, 'इम्रान बेंगलोरे', 'Imran Bengalure', '9800000011', '1234', 300.00, 54100.00),
(12, 'जैनोद्दीन बेंगलोरे', 'Jainoddin Bengalure', '9800000012', '1234', 300.00, 54100.00),
(13, 'मुज्जमिल बेंगलोरे', 'Muzzammil Bengalure', '9800000013', '1234', 300.00, 54100.00),
(14, 'जाविद पठाण', 'Javid Pathan', '9800000014', '1234', 300.00, 72100.00),
(15, 'मोहसिन MMM', 'Mohsin MMM', '9800000015', '1234', 300.00, 54100.00),
(16, 'अरफान बागवान', 'Arfan Bagwan', '9800000016', '1234', 300.00, 54100.00),
(17, 'अर्शिया बागवान', 'Arshiya Bagwan', '9800000017', '1234', 300.00, 54100.00),
(18, 'आयेशा बागवान', 'Ayesha Bagwan', '9800000018', '1234', 300.00, 54100.00),
(19, 'मिनाज पठाण', 'Minaj Pathan', '9800000019', '1234', 300.00, 54100.00),
(20, 'रिजवान पठाण', 'Rizwan Pathan', '9800000020', '1234', 300.00, 54100.00),
(21, 'वासिद शेख', 'Wasid Shaikh', '9800000021', '1234', 300.00, 72100.00),
(22, 'इलियास तांबोळी', 'Ilyas Tamboli', '9800000022', '1234', 300.00, 72100.00),
(23, 'माफिया तांबोळी', 'Mafiya Tamboli', '9800000023', '1234', 300.00, 54100.00),
(24, 'जिदान बागवान', 'Zidan Bagwan', '9800000024', '1234', 300.00, 72100.00),
(25, 'उमर बागवान', 'Umar Bagwan', '9800000025', '1234', 300.00, 44100.00),
(26, 'अली बागवान', 'Ali Bagwan', '9800000026', '1234', 300.00, 54100.00),
(27, 'उस्मान बागवान', 'Usman Bagwan', '9800000027', '1234', 300.00, 54100.00),
(28, 'महिबूब शेख (दीला)', 'Mahibub Shaikh (Deela)', '9800000028', '1234', 300.00, 54100.00),
(29, 'इनसिया शेख', 'Insiya Shaikh', '9800000029', '1234', 300.00, 72100.00),
(30, 'फारुक मुल्ला', 'Faruk Mulla', '9800000030', '1234', 300.00, 72100.00),
(31, 'इस्माईल मुल्ला', 'Ismail Mulla', '9800000031', '1234', 300.00, 72100.00),
(32, 'इम्रान चौधरी', 'Imran Chaudhari', '9800000032', '1234', 300.00, 72100.00),
(33, 'अब्दुल्ला चौधरी', 'Abdullah Chaudhari', '9800000033', '1234', 300.00, 54100.00),
(34, 'आसिफ प्यारे', 'Aasif Pyare', '9800000034', '1234', 300.00, 72100.00),
(35, 'उमेद प्यारे', 'Umed Pyare', '9800000035', '1234', 300.00, 54100.00),
(36, 'मतीन बांगी', 'Matin Bangi', '9800000036', '1234', 300.00, 54100.00),
(37, 'जुबेर बक्षी', 'Zuber Bakshi', '9800000037', '1234', 300.00, 72100.00),
(38, 'वाहिद जमादार', 'Wahid Jamadar', '9800000038', '1234', 300.00, 72100.00),
(39, 'गुफरान सय्यद', 'Gufran Sayyad', '9800000039', '1234', 300.00, 54100.00),
(40, 'हारीस जमादार', 'Haris Jamadar', '9800000040', '1234', 300.00, 72100.00);

-- Also add each member to app_auth_users so they can immediately log in with their phone/account number and password '1234'
INSERT INTO public.app_auth_users (role, account_no, phone, password, full_name)
SELECT 'member', account_no, phone, password, name_mr || ' (' || name_en || ')'
FROM public.society_members;

-- ==============================================================================
-- Seed October 2024 Active Loans (From Ledger Image)
-- ==============================================================================

INSERT INTO public.society_loans (account_no, principal_amount, monthly_installment, remaining_balance, disbursed_period, status) VALUES
(1, 180000.00, 6000.00, 18000.00, 'Pre-Oct-2024', 'active'),
(3, 120000.00, 4000.00, 4000.00, 'Pre-Oct-2024', 'active'),
(4, 120000.00, 4000.00, 28000.00, 'Pre-Oct-2024', 'active'),
(5, 180000.00, 6000.00, 174000.00, 'Pre-Oct-2024', 'active'),
(7, 120000.00, 4000.00, 0.00, 'Pre-Oct-2024', 'closed'),
(8, 120000.00, 4000.00, 32000.00, 'Pre-Oct-2024', 'active'),
(9, 120000.00, 4000.00, 36000.00, 'Pre-Oct-2024', 'active'),
(10, 120000.00, 4000.00, 40000.00, 'Pre-Oct-2024', 'active'),
(11, 180000.00, 6000.00, 180000.00, 'Oct-2024', 'active'), -- New loan disbursed in Oct 2024!
(14, 180000.00, 6000.00, 12000.00, 'Pre-Oct-2024', 'active'),
(15, 180000.00, 6000.00, 12000.00, 'Pre-Oct-2024', 'active'),
(16, 120000.00, 4000.00, 20000.00, 'Pre-Oct-2024', 'active'),
(17, 120000.00, 4000.00, 20000.00, 'Pre-Oct-2024', 'active'),
(19, 120000.00, 4000.00, 16000.00, 'Pre-Oct-2024', 'active'),
(20, 120000.00, 4000.00, 24000.00, 'Pre-Oct-2024', 'active'),
(21, 180000.00, 6000.00, 162000.00, 'Pre-Oct-2024', 'active'),
(22, 180000.00, 6000.00, 144000.00, 'Pre-Oct-2024', 'active'),
(23, 120000.00, 4000.00, 40000.00, 'Pre-Oct-2024', 'active'),
(24, 180000.00, 6000.00, 96000.00, 'Pre-Oct-2024', 'active'),
(27, 120000.00, 4000.00, 36000.00, 'Pre-Oct-2024', 'active'),
(29, 180000.00, 6000.00, 126000.00, 'Pre-Oct-2024', 'active'),
(30, 180000.00, 6000.00, 102000.00, 'Pre-Oct-2024', 'active'),
(31, 180000.00, 6000.00, 132000.00, 'Pre-Oct-2024', 'active'),
(32, 180000.00, 6000.00, 138000.00, 'Pre-Oct-2024', 'active'),
(34, 180000.00, 6000.00, 168000.00, 'Pre-Oct-2024', 'active'),
(35, 120000.00, 4000.00, 8000.00, 'Pre-Oct-2024', 'active'),
(38, 180000.00, 6000.00, 114000.00, 'Pre-Oct-2024', 'active'),
(39, 180000.00, 6000.00, 156000.00, 'Pre-Oct-2024', 'active');

-- ==============================================================================
-- Seed October 2024 Monthly Ledger & All 40 Entries (Image 2)
-- ==============================================================================

DO $$
DECLARE
    v_ledger_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.monthly_ledgers (
        id, period_year, period_month, period_label,
        previous_balance, total_shares_collected, total_installments_collected,
        total_gross_collected, total_cash_available,
        loan_disbursed_account_no, loan_disbursed_amount, closing_balance, is_finalized
    ) VALUES (
        v_ledger_id, 2024, 10, 'Oct - 24',
        26820.00, 12000.00, 142000.00,
        154000.00, 180820.00,
        11, 180000.00, 820.00, true
    );

    INSERT INTO public.ledger_entries (
        ledger_id, account_no, name_mr, name_en, monthly_share,
        cumulative_shares, loan_approved, loan_installment, loan_balance_remaining, fine, total_amount, is_paid
    ) VALUES
    (v_ledger_id, 1, 'इम्रान सय्यद', 'Imran Sayyad', 300, 72100, 0, 6000, 18000, 0, 6300, true),
    (v_ledger_id, 2, 'युनुस सय्यद', 'Yunus Sayyad', 300, 54100, 0, 0, 0, 0, 300, true),
    (v_ledger_id, 3, 'वाजिद गैबू', 'Wajid Gaibu', 300, 54100, 0, 4000, 4000, 0, 4300, true),
    (v_ledger_id, 4, 'आतिक गैबू', 'Aatik Gaibu', 300, 54100, 0, 4000, 28000, 0, 4300, true),
    (v_ledger_id, 5, 'I.Q. Motegaon', 'I.Q. Motegaon', 300, 72100, 0, 6000, 174000, 0, 6300, true),
    (v_ledger_id, 6, 'अ.कदीर आळंदकर', 'A. Qadeer Alandkar', 300, 54100, 0, 0, 0, 0, 300, true),
    (v_ledger_id, 7, 'आसिफ एलाल', 'Aasif Elal', 300, 54100, 0, 4000, 0, 0, 4300, true),
    (v_ledger_id, 8, 'इस्माईल मंगलगीरी', 'Ismail Mangalgiri', 300, 54100, 0, 4000, 32000, 0, 4300, true),
    (v_ledger_id, 9, 'इसा मंगलगीरी', 'Isa Mangalgiri', 300, 54100, 0, 4000, 36000, 0, 4300, true),
    (v_ledger_id, 10, 'इलियास मंगलगीरी', 'Ilyas Mangalgiri', 300, 54100, 0, 4000, 40000, 0, 4300, true),
    (v_ledger_id, 11, 'इम्रान बेंगलोरे', 'Imran Bengalure', 300, 54100, 180000, 0, 0, 0, 300, true),
    (v_ledger_id, 12, 'जैनोद्दीन बेंगलोरे', 'Jainoddin Bengalure', 300, 54100, 0, 0, 0, 0, 300, true),
    (v_ledger_id, 13, 'मुज्जमिल बेंगलोरे', 'Muzzammil Bengalure', 300, 54100, 0, 0, 0, 0, 300, true),
    (v_ledger_id, 14, 'जाविद पठाण', 'Javid Pathan', 300, 72100, 0, 6000, 12000, 0, 6300, true),
    (v_ledger_id, 15, 'मोहसिन MMM', 'Mohsin MMM', 300, 54100, 0, 6000, 12000, 0, 6300, true),
    (v_ledger_id, 16, 'अरफान बागवान', 'Arfan Bagwan', 300, 54100, 0, 4000, 20000, 0, 4300, true),
    (v_ledger_id, 17, 'अर्शिया बागवान', 'Arshiya Bagwan', 300, 54100, 0, 4000, 20000, 0, 4300, true),
    (v_ledger_id, 18, 'आयेशा बागवान', 'Ayesha Bagwan', 300, 54100, 0, 0, 0, 0, 300, true),
    (v_ledger_id, 19, 'मिनाज पठाण', 'Minaj Pathan', 300, 54100, 0, 4000, 16000, 0, 4300, true),
    (v_ledger_id, 20, 'रिजवान पठाण', 'Rizwan Pathan', 300, 54100, 0, 4000, 24000, 0, 4300, true),
    (v_ledger_id, 21, 'वासिद शेख', 'Wasid Shaikh', 300, 72100, 0, 6000, 162000, 0, 6300, true),
    (v_ledger_id, 22, 'इलियास तांबोळी', 'Ilyas Tamboli', 300, 72100, 0, 6000, 144000, 0, 6300, true),
    (v_ledger_id, 23, 'माफिया तांबोळी', 'Mafiya Tamboli', 300, 54100, 0, 4000, 40000, 0, 4300, true),
    (v_ledger_id, 24, 'जिदान बागवान', 'Zidan Bagwan', 300, 72100, 0, 6000, 96000, 0, 6300, true),
    (v_ledger_id, 25, 'उमर बागवान', 'Umar Bagwan', 300, 44100, 0, 0, 0, 0, 300, true),
    (v_ledger_id, 26, 'अली बागवान', 'Ali Bagwan', 300, 54100, 0, 0, 0, 0, 300, true),
    (v_ledger_id, 27, 'उस्मान बागवान', 'Usman Bagwan', 300, 54100, 0, 4000, 36000, 0, 4300, true),
    (v_ledger_id, 28, 'महिबूब शेख (दीला)', 'Mahibub Shaikh (Deela)', 300, 54100, 0, 0, 0, 0, 300, true),
    (v_ledger_id, 29, 'इनसिया शेख', 'Insiya Shaikh', 300, 72100, 0, 6000, 126000, 0, 6300, true),
    (v_ledger_id, 30, 'फारुक मुल्ला', 'Faruk Mulla', 300, 72100, 0, 6000, 102000, 0, 6300, true),
    (v_ledger_id, 31, 'इस्माईल मुल्ला', 'Ismail Mulla', 300, 72100, 0, 6000, 132000, 0, 6300, true),
    (v_ledger_id, 32, 'इम्रान चौधरी', 'Imran Chaudhari', 300, 72100, 0, 6000, 138000, 0, 6300, true),
    (v_ledger_id, 33, 'अब्दुल्ला चौधरी', 'Abdullah Chaudhari', 300, 54100, 0, 0, 0, 0, 300, true),
    (v_ledger_id, 34, 'आसिफ प्यारे', 'Aasif Pyare', 300, 72100, 0, 6000, 168000, 0, 6300, true),
    (v_ledger_id, 35, 'उमेद प्यारे', 'Umed Pyare', 300, 54100, 0, 4000, 8000, 0, 4300, true),
    (v_ledger_id, 36, 'मतीन बांगी', 'Matin Bangi', 300, 54100, 0, 0, 0, 0, 300, true),
    (v_ledger_id, 37, 'जुबेर बक्षी', 'Zuber Bakshi', 300, 72100, 0, 0, 0, 0, 300, true),
    (v_ledger_id, 38, 'वाहिद जमादार', 'Wahid Jamadar', 300, 72100, 0, 6000, 114000, 0, 6300, true),
    (v_ledger_id, 39, 'गुफरान सय्यद', 'Gufran Sayyad', 300, 54100, 0, 6000, 156000, 0, 6300, true),
    (v_ledger_id, 40, 'हारीस जमादार', 'Haris Jamadar', 300, 72100, 0, 0, 0, 0, 300, true);
END $$;

-- 10. Enable Row Level Security with Full Anon Access
-- Since the application operates with custom direct phone/password auth without Supabase email confirmation,
-- we grant anon role full access to interact with the database directly.
ALTER TABLE public.society_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full access to society_profile" ON public.society_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to app_auth_users" ON public.app_auth_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to society_members" ON public.society_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to society_loans" ON public.society_loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to monthly_ledgers" ON public.monthly_ledgers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to ledger_entries" ON public.ledger_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to push_subscriptions" ON public.push_subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Grant privileges to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Enable Realtime publication
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.society_profile, public.society_members, public.monthly_ledgers, public.ledger_entries, public.app_auth_users;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;
