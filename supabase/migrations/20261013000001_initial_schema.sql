-- ==============================================================================
-- Migration: 20261013000001_initial_schema.sql
-- Description: Initial schema for No-Interest (Qarz-e-Hasan) Society Management
-- Features: Multi-tenant societies, member tracking, monthly contributions,
--           interest-free loan cycles, repayments, pool accounting, RLS policies.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Societies Table (Tenant Root)
CREATE TABLE IF NOT EXISTS public.societies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    upi_id TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    contact_phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Society Admins / Treasurers
CREATE TABLE IF NOT EXISTS public.society_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'treasurer', -- 'treasurer', 'president', 'auditor'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, society_id)
);

-- 4. Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
    member_no TEXT NOT NULL, -- e.g. 'M-101'
    name TEXT NOT NULL,
    phone TEXT NOT NULL, -- 10 digit Indian mobile number
    monthly_share NUMERIC(10, 2) NOT NULL DEFAULT 1000.00, -- Committed monthly contribution
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(society_id, member_no)
);

-- 5. Monthly Contributions / Member Shares
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'upi' CHECK (payment_method IN ('upi', 'cash', 'bank_transfer')),
    reference_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(society_id, member_id, period_year, period_month)
);

-- 6. Interest-Free Loans (Qarz-e-Hasan)
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    loan_no TEXT NOT NULL, -- e.g. 'LN-2026-001'
    principal_amount NUMERIC(12, 2) NOT NULL CHECK (principal_amount > 0),
    remaining_balance NUMERIC(12, 2) NOT NULL CHECK (remaining_balance >= 0),
    monthly_installment NUMERIC(10, 2) NOT NULL CHECK (monthly_installment > 0),
    disbursed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    repayment_start_date DATE NOT NULL,
    purpose TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'defaulted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(society_id, loan_no)
);

-- 7. Loan Repayments
CREATE TABLE IF NOT EXISTS public.loan_repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    repayment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'upi' CHECK (payment_method IN ('upi', 'cash', 'bank_transfer')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    performed_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_members_society_status ON public.members(society_id, status);
CREATE INDEX IF NOT EXISTS idx_contributions_period ON public.contributions(society_id, period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_loans_society_status ON public.loans(society_id, status);
CREATE INDEX IF NOT EXISTS idx_repayments_loan ON public.loan_repayments(loan_id);

-- 10. Automatic Trigger to keep Loan Balance & Status accurate
CREATE OR REPLACE FUNCTION public.fn_sync_loan_repayment_balance()
RETURNS TRIGGER AS $$
DECLARE
    v_total_repaid NUMERIC(12, 2);
    v_principal NUMERIC(12, 2);
    v_loan_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_loan_id := OLD.loan_id;
    ELSE
        v_loan_id := NEW.loan_id;
    END IF;

    SELECT principal_amount INTO v_principal
    FROM public.loans
    WHERE id = v_loan_id;

    SELECT COALESCE(SUM(amount), 0) INTO v_total_repaid
    FROM public.loan_repayments
    WHERE loan_id = v_loan_id;

    UPDATE public.loans
    SET remaining_balance = GREATEST(0, v_principal - v_total_repaid),
        status = CASE 
            WHEN (v_principal - v_total_repaid) <= 0 THEN 'closed'
            ELSE 'active'
        END,
        updated_at = NOW()
    WHERE id = v_loan_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_sync_loan_balance_after_repayment
AFTER INSERT OR UPDATE OR DELETE ON public.loan_repayments
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_loan_repayment_balance();

-- 11. Row Level Security (RLS)
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's society ids
CREATE OR REPLACE FUNCTION public.get_auth_society_ids()
RETURNS TABLE (society_id UUID) AS $$
    SELECT society_id FROM public.society_admins WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS Policies
CREATE POLICY "Admins can manage their societies"
ON public.societies FOR ALL
USING (id IN (SELECT get_auth_society_ids()));

CREATE POLICY "Admins can view their admin record"
ON public.society_admins FOR ALL
USING (society_id IN (SELECT get_auth_society_ids()));

CREATE POLICY "Admins can manage their members"
ON public.members FOR ALL
USING (society_id IN (SELECT get_auth_society_ids()));

CREATE POLICY "Admins can manage contributions"
ON public.contributions FOR ALL
USING (society_id IN (SELECT get_auth_society_ids()));

CREATE POLICY "Admins can manage loans"
ON public.loans FOR ALL
USING (society_id IN (SELECT get_auth_society_ids()));

CREATE POLICY "Admins can manage loan repayments"
ON public.loan_repayments FOR ALL
USING (society_id IN (SELECT get_auth_society_ids()));

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR ALL
USING (society_id IN (SELECT get_auth_society_ids()));
