export type PaymentMethod = 'upi' | 'cash' | 'bank_transfer';
export type MemberStatus = 'active' | 'inactive' | 'suspended';
export type LoanStatus = 'active' | 'closed' | 'defaulted';

export interface Society {
  id: string;
  name: string;
  upi_id: string; // e.g. society@okaxis or treasurer@upi
  currency: string;
  opening_balance: number;
  contact_phone?: string;
  address?: string;
  default_reminder_lang?: 'en' | 'ur' | 'hi' | 'mr';
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  society_id: string;
  member_no: string; // e.g. "M-101"
  name: string;
  phone: string; // 10 digit phone
  monthly_share: number; // committed monthly contribution (e.g. 1000)
  join_date: string; // YYYY-MM-DD
  status: MemberStatus;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Contribution {
  id: string;
  society_id: string;
  member_id: string;
  period_year: number; // e.g. 2026
  period_month: number; // 1 - 12
  amount: number;
  payment_date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  reference_note?: string;
  created_at: string;
}

export interface Loan {
  id: string;
  society_id: string;
  member_id: string;
  loan_no: string; // e.g. "LN-2026-001"
  principal_amount: number;
  remaining_balance: number;
  monthly_installment: number; // expected monthly repayment
  disbursed_date: string; // YYYY-MM-DD
  repayment_start_date: string; // YYYY-MM-DD
  purpose?: string;
  status: LoanStatus;
  created_at: string;
  updated_at: string;
}

export interface LoanRepayment {
  id: string;
  society_id: string;
  loan_id: string;
  member_id: string;
  amount: number;
  repayment_date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  notes?: string;
  created_at: string;
}

export interface DefaulterItem {
  member: Member;
  type: 'contribution' | 'loan' | 'both';
  contributionMonthsOverdue: number;
  contributionAmountDue: number;
  loanOverdueAmount: number;
  totalDue: number;
  activeLoan?: Loan;
  severityDays: number;
}

export interface PoolMetrics {
  openingBalance: number;
  totalContributions: number;
  totalDisbursedLoans: number;
  totalRepayments: number;
  availablePoolBalance: number; // opening + contributions + repayments - disbursed
  activeLoansCount: number;
  totalActiveLoanBalance: number;
  totalMembersCount: number;
  activeMembersCount: number;
}

export interface MonthMetrics {
  year: number;
  month: number;
  monthName: string;
  expectedCollection: number;
  collectedAmount: number;
  pendingAmount: number;
  paidMembersCount: number;
  unpaidMembersCount: number;
  collectionPercentage: number;
}
