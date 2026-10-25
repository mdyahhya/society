import { Society, Member, Contribution, Loan, LoanRepayment, MonthlyLedger } from '../types';

export const SEED_SOCIETY: Society = {
  id: 'soc-albadr-01',
  name: 'अल-बदर बिलासौदी को.ऑप. सोसायटी, सोलापूर.',
  upi_id: 'albadr.society@okaxis',
  currency: 'INR',
  opening_balance: 26820,
  contact_phone: '9800000000',
  address: 'बिलासौदी, सोलापूर, महाराष्ट्र (Bilasudi, Solapur, Maharashtra)',
  default_reminder_lang: 'mr',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-10-25T00:00:00.000Z',
};

export const RAW_40_MEMBERS: Array<{
  acc: number;
  mr: string;
  en: string;
  shares: number;
  installment: number;
  loanBal: number;
  newLoan?: number;
}> = [
  { acc: 1, mr: 'इम्रान सय्यद', en: 'Imran Sayyad', shares: 72100, installment: 6000, loanBal: 18000 },
  { acc: 2, mr: 'युनुस सय्यद', en: 'Yunus Sayyad', shares: 54100, installment: 0, loanBal: 0 },
  { acc: 3, mr: 'वाजिद गैबू', en: 'Wajid Gaibu', shares: 54100, installment: 4000, loanBal: 4000 },
  { acc: 4, mr: 'आतिक गैबू', en: 'Aatik Gaibu', shares: 54100, installment: 4000, loanBal: 28000 },
  { acc: 5, mr: 'I.Q. Motegaon', en: 'I.Q. Motegaon', shares: 72100, installment: 6000, loanBal: 174000 },
  { acc: 6, mr: 'अ.कदीर आळंदकर', en: 'A. Qadeer Alandkar', shares: 54100, installment: 0, loanBal: 0 },
  { acc: 7, mr: 'आसिफ एलाल', en: 'Aasif Elal', shares: 54100, installment: 4000, loanBal: 0 },
  { acc: 8, mr: 'इस्माईल मंगलगीरी', en: 'Ismail Mangalgiri', shares: 54100, installment: 4000, loanBal: 32000 },
  { acc: 9, mr: 'इसा मंगलगीरी', en: 'Isa Mangalgiri', shares: 54100, installment: 4000, loanBal: 36000 },
  { acc: 10, mr: 'इलियास मंगलगीरी', en: 'Ilyas Mangalgiri', shares: 54100, installment: 4000, loanBal: 40000 },
  { acc: 11, mr: 'इम्रान बेंगलोरे', en: 'Imran Bengalure', shares: 54100, installment: 0, loanBal: 0, newLoan: 180000 },
  { acc: 12, mr: 'जैनोद्दीन बेंगलोरे', en: 'Jainoddin Bengalure', shares: 54100, installment: 0, loanBal: 0 },
  { acc: 13, mr: 'मुज्जमिल बेंगलोरे', en: 'Muzzammil Bengalure', shares: 54100, installment: 0, loanBal: 0 },
  { acc: 14, mr: 'जाविद पठाण', en: 'Javid Pathan', shares: 72100, installment: 6000, loanBal: 12000 },
  { acc: 15, mr: 'मोहसिन MMM', en: 'Mohsin MMM', shares: 54100, installment: 6000, loanBal: 12000 },
  { acc: 16, mr: 'अरफान बागवान', en: 'Arfan Bagwan', shares: 54100, installment: 4000, loanBal: 20000 },
  { acc: 17, mr: 'अर्शिया बागवान', en: 'Arshiya Bagwan', shares: 54100, installment: 4000, loanBal: 20000 },
  { acc: 18, mr: 'आयेशा बागवान', en: 'Ayesha Bagwan', shares: 54100, installment: 0, loanBal: 0 },
  { acc: 19, mr: 'मिनाज पठाण', en: 'Minaj Pathan', shares: 54100, installment: 4000, loanBal: 16000 },
  { acc: 20, mr: 'रिजवान पठाण', en: 'Rizwan Pathan', shares: 54100, installment: 4000, loanBal: 24000 },
  { acc: 21, mr: 'वासिद शेख', en: 'Wasid Shaikh', shares: 72100, installment: 6000, loanBal: 162000 },
  { acc: 22, mr: 'इलियास तांबोळी', en: 'Ilyas Tamboli', shares: 72100, installment: 6000, loanBal: 144000 },
  { acc: 23, mr: 'माफिया तांबोळी', en: 'Mafiya Tamboli', shares: 54100, installment: 4000, loanBal: 40000 },
  { acc: 24, mr: 'जिदान बागवान', en: 'Zidan Bagwan', shares: 72100, installment: 6000, loanBal: 96000 },
  { acc: 25, mr: 'उमर बागवान', en: 'Umar Bagwan', shares: 44100, installment: 0, loanBal: 0 },
  { acc: 26, mr: 'अली बागवान', en: 'Ali Bagwan', shares: 54100, installment: 0, loanBal: 0 },
  { acc: 27, mr: 'उस्मान बागवान', en: 'Usman Bagwan', shares: 54100, installment: 4000, loanBal: 36000 },
  { acc: 28, mr: 'महिबूब शेख (दीला)', en: 'Mahibub Shaikh (Deela)', shares: 54100, installment: 0, loanBal: 0 },
  { acc: 29, mr: 'इनसिया शेख', en: 'Insiya Shaikh', shares: 72100, installment: 6000, loanBal: 126000 },
  { acc: 30, mr: 'फारुक मुल्ला', en: 'Faruk Mulla', shares: 72100, installment: 6000, loanBal: 102000 },
  { acc: 31, mr: 'इस्माईल मुल्ला', en: 'Ismail Mulla', shares: 72100, installment: 6000, loanBal: 132000 },
  { acc: 32, mr: 'इम्रान चौधरी', en: 'Imran Chaudhari', shares: 72100, installment: 6000, loanBal: 138000 },
  { acc: 33, mr: 'अब्दुल्ला चौधरी', en: 'Abdullah Chaudhari', shares: 54100, installment: 0, loanBal: 0 },
  { acc: 34, mr: 'आसिफ प्यारे', en: 'Aasif Pyare', shares: 72100, installment: 6000, loanBal: 168000 },
  { acc: 35, mr: 'उमेद प्यारे', en: 'Umed Pyare', shares: 54100, installment: 4000, loanBal: 8000 },
  { acc: 36, mr: 'मतीन बांगी', en: 'Matin Bangi', shares: 54100, installment: 0, loanBal: 0 },
  { acc: 37, mr: 'जुबेर बक्षी', en: 'Zuber Bakshi', shares: 72100, installment: 0, loanBal: 0 },
  { acc: 38, mr: 'वाहिद जमादार', en: 'Wahid Jamadar', shares: 72100, installment: 6000, loanBal: 114000 },
  { acc: 39, mr: 'गुफरान सय्यद', en: 'Gufran Sayyad', shares: 54100, installment: 6000, loanBal: 156000 },
  { acc: 40, mr: 'हारीस जमादार', en: 'Haris Jamadar', shares: 72100, installment: 0, loanBal: 0 },
];

export const SEED_MEMBERS: Member[] = RAW_40_MEMBERS.map((m) => ({
  id: `mem-${m.acc}`,
  society_id: 'soc-albadr-01',
  account_no: m.acc,
  member_no: String(m.acc),
  name: m.mr,
  name_mr: m.mr,
  name_en: m.en,
  phone: `98000000${m.acc < 10 ? '0' + m.acc : m.acc}`,
  password: '1234',
  monthly_share: 300,
  cumulative_shares: m.shares,
  join_date: '2024-01-01',
  status: 'active',
  address: 'सोलापूर (Solapur)',
  notes: `अकौंट नं. ${m.acc}`,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-10-25T00:00:00.000Z',
}));

export const SEED_LOANS: Loan[] = RAW_40_MEMBERS.filter((m) => m.loanBal > 0 || m.newLoan).map((m) => {
  const isNewLoan = Boolean(m.newLoan);
  const principal = isNewLoan ? 180000 : (m.installment === 6000 ? 180000 : 120000);
  const remaining = isNewLoan ? 180000 : m.loanBal;
  const installment = isNewLoan ? 6000 : m.installment;

  return {
    id: `loan-${m.acc}`,
    society_id: 'soc-albadr-01',
    member_id: `mem-${m.acc}`,
    loan_no: `LN-2024-${m.acc < 10 ? '0' + m.acc : m.acc}`,
    principal_amount: principal,
    remaining_balance: remaining,
    monthly_installment: installment,
    disbursed_date: isNewLoan ? '2024-10-01' : '2024-01-01',
    repayment_start_date: isNewLoan ? '2024-11-01' : '2024-02-01',
    purpose: isNewLoan ? 'नवीन मंजूर कर्ज (Oct 2024 Sanctioned Loan)' : 'परस्पर सहाय्य बिनव्याजी कर्ज (Qarz-e-Hasan)',
    status: 'active',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-10-25T00:00:00.000Z',
  };
});

export const SEED_OCTOBER_LEDGER: MonthlyLedger = {
  id: 'ledger-2024-10',
  period_year: 2024,
  period_month: 10,
  period_label: 'Oct - 24',
  previous_balance: 26820,
  total_shares_collected: 12000,
  total_installments_collected: 142000,
  total_gross_collected: 154000,
  total_cash_available: 180820,
  loan_disbursed_account_no: 11,
  loan_disbursed_amount: 180000,
  closing_balance: 820,
  is_finalized: true,
  entries: RAW_40_MEMBERS.map((m) => {
    const monthlyShare = 300;
    const installment = m.installment;
    const fine = 0;
    const total = monthlyShare + installment + fine;
    return {
      account_no: m.acc,
      name_mr: m.mr,
      name_en: m.en,
      monthly_share: monthlyShare,
      cumulative_shares: m.shares,
      loan_approved: m.newLoan || 0,
      loan_installment: installment,
      loan_balance_remaining: m.loanBal,
      fine: fine,
      total_amount: total,
      is_paid: true,
    };
  }),
};

export const SEED_CONTRIBUTIONS: Contribution[] = SEED_MEMBERS.map((m) => ({
  id: `contrib-2024-10-${m.account_no}`,
  society_id: 'soc-albadr-01',
  member_id: m.id,
  period_year: 2024,
  period_month: 10,
  amount: 300,
  payment_date: '2024-10-10',
  payment_method: 'cash',
  reference_note: 'ऑक्टोबर २०२४ मासिक वर्गणी',
  created_at: '2024-10-10T00:00:00.000Z',
}));

export const SEED_REPAYMENTS: LoanRepayment[] = RAW_40_MEMBERS.filter((m) => m.installment > 0).map((m) => ({
  id: `repay-2024-10-${m.acc}`,
  society_id: 'soc-albadr-01',
  loan_id: `loan-${m.acc}`,
  member_id: `mem-${m.acc}`,
  amount: m.installment,
  repayment_date: '2024-10-10',
  payment_method: 'cash',
  notes: 'ऑक्टोबर २०२४ कर्जाचा हप्ता',
  created_at: '2024-10-10T00:00:00.000Z',
}));
