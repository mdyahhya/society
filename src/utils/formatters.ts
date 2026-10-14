/**
 * Format numeric value to Indian Rupee (INR) currency format (e.g. ₹ 1,50,000)
 */
export function formatINR(val: number | string | undefined | null): string {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format INR without currency symbol (e.g. "1,50,000")
 */
export function formatNumber(val: number | string | undefined | null): string {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN');
}

/**
 * Clean mobile number to standard 10 digits
 */
export function cleanMobile(phone: string | undefined | null): string {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '').slice(-10);
}

/**
 * Format mobile number for UI display (+91 98765 43210)
 */
export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  const digits = cleanMobile(phone);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return digits ? `+91 ${digits}` : '';
}

/**
 * Format date into readable string (e.g. "15 Oct 2026")
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export type ReminderLanguage = 'en' | 'ur' | 'hi' | 'mr';

export const REMINDER_LANGUAGES: { key: ReminderLanguage; label: string; subLabel: string }[] = [
  { key: 'en', label: 'English', subLabel: 'English' },
  { key: 'ur', label: 'اردو', subLabel: 'Urdu' },
  { key: 'hi', label: 'हिंदी', subLabel: 'Hindi' },
  { key: 'mr', label: 'मराठी', subLabel: 'Marathi' },
];

/**
 * Month names lookup
 */
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_BY_LANG: Record<ReminderLanguage, string[]> = {
  en: MONTH_NAMES,
  ur: [
    'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
    'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
  ],
  hi: [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ],
  mr: [
    'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
    'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
  ],
};

export function getMonthName(monthNumber: number): string {
  const index = Math.max(1, Math.min(12, monthNumber)) - 1;
  return MONTH_NAMES[index] || '';
}

export function getLocalizedMonthName(monthNumber: number, lang: ReminderLanguage = 'en'): string {
  const index = Math.max(1, Math.min(12, monthNumber)) - 1;
  const list = MONTH_NAMES_BY_LANG[lang] || MONTH_NAMES;
  return list[index] || MONTH_NAMES[index] || '';
}

/**
 * Get current month & year
 */
export function getCurrentPeriod(): { year: number; month: number; monthName: string } {
  const now = new Date();
  const month = now.getMonth() + 1;
  return {
    year: now.getFullYear(),
    month,
    monthName: MONTH_NAMES[month - 1],
  };
}

/**
 * Build standard NPCI UPI Deep Link
 * upi://pay?pa={upi_id}&pn={payee_name}&am={amount}&cu=INR&tn={note}
 */
export function buildUpiUrl(params: {
  upiId: string;
  payeeName: string;
  amount?: number;
  note?: string;
}): string {
  const pa = encodeURIComponent(params.upiId.trim());
  const pn = encodeURIComponent(params.payeeName.trim());
  const tn = encodeURIComponent(params.note || 'Society Share');
  let url = `upi://pay?pa=${pa}&pn=${pn}&cu=INR&tn=${tn}`;
  if (params.amount && params.amount > 0) {
    url += `&am=${params.amount}`;
  }
  return url;
}

/**
 * Build polite, respectful WhatsApp reminder message for Qarz-e-Hasan mutual fund
 */
export interface WhatsAppMessagePayload {
  memberId?: string;
  memberName: string;
  memberPhone?: string;
  societyName: string;
  monthName: string;
  monthNumber?: number;
  monthlyShareDue?: number;
  loanDue?: number;
  totalDue: number;
  upiId: string;
  language?: ReminderLanguage;
}

export function buildWhatsAppReminderMessage(payload: WhatsAppMessagePayload): string {
  const lang = payload.language || 'en';
  const monthName = payload.monthNumber
    ? getLocalizedMonthName(payload.monthNumber, lang)
    : payload.monthName;

  if (lang === 'ur') {
    const parts: string[] = [];
    parts.push(`*${payload.societyName}*`);
    parts.push(`----------------------------------------`);
    parts.push(`السلام علیکم *${payload.memberName}* بھائی،`);
    parts.push(``);
    parts.push(`یہ ماہ *${monthName}* کے سوسائٹی کے واجبات کی یاد دہانی ہے:`);

    if (payload.monthlyShareDue && payload.monthlyShareDue > 0) {
      parts.push(`• *ماہانہ شیئر (حصہ):* ${formatINR(payload.monthlyShareDue)}`);
    }

    if (payload.loanDue && payload.loanDue > 0) {
      parts.push(`• *قرضِ حسنہ قسط:* ${formatINR(payload.loanDue)}`);
    }

    parts.push(`----------------------------------------`);
    parts.push(`*کل واجب الادا رقم:* ${formatINR(payload.totalDue)}`);
    parts.push(``);
    parts.push(`براہِ کرم سوسائٹی کے UPI اکاؤنٹ پر رقم ادا فرمائیں:`);
    parts.push(`*UPI ID:* \`${payload.upiId}\``);
    parts.push(``);
    parts.push(`آپ کا بروقت تعاون ہمارے فنڈ کو مضبوط بناتا ہے اور ضرورت مندوں کی مدد کرتا ہے۔`);
    parts.push(`_جزاک اللہ خیراً_`);

    return parts.join('\n');
  }

  if (lang === 'hi') {
    const parts: string[] = [];
    parts.push(`*${payload.societyName}*`);
    parts.push(`----------------------------------------`);
    parts.push(`नमस्ते / अस्सलाम अलैकुम *${payload.memberName}* जी,`);
    parts.push(``);
    parts.push(`यह *${monthName}* महीने के सोसाइटी शेयर और किस्त का छोटा सा रिमाइंडर है:`);

    if (payload.monthlyShareDue && payload.monthlyShareDue > 0) {
      parts.push(`• *महीने का शेयर:* ${formatINR(payload.monthlyShareDue)}`);
    }

    if (payload.loanDue && payload.loanDue > 0) {
      parts.push(`• *क़र्ज़-ए-हसना किस्त:* ${formatINR(payload.loanDue)}`);
    }

    parts.push(`----------------------------------------`);
    parts.push(`*कुल बाकी रकम:* ${formatINR(payload.totalDue)}`);
    parts.push(``);
    parts.push(`आप सीधे सोसाइटी के इस UPI ID पर पैसे भेज सकते हैं:`);
    parts.push(`*UPI ID:* \`${payload.upiId}\``);
    parts.push(``);
    parts.push(`आपके समय पर सहयोग से फंड मजबूत होता है और सभी भाइयों को वक्त पर मदद मिलती है।`);
    parts.push(`_शुक्रिया / जज़ाकल्लाह खैर_`);

    return parts.join('\n');
  }

  if (lang === 'mr') {
    const parts: string[] = [];
    parts.push(`*${payload.societyName}*`);
    parts.push(`----------------------------------------`);
    parts.push(`सस्नेह नमस्कार *${payload.memberName}*,`);
    parts.push(``);
    parts.push(`हे *${monthName}* महिन्याच्या सोसायटीच्या वर्गणी व हप्त्याबद्दलचे स्मरणपत्र आहे:`);

    if (payload.monthlyShareDue && payload.monthlyShareDue > 0) {
      parts.push(`• *महिन्याची वर्गणी (Share):* ${formatINR(payload.monthlyShareDue)}`);
    }

    if (payload.loanDue && payload.loanDue > 0) {
      parts.push(`• *कर्ज-ए-हसना हप्ता:* ${formatINR(payload.loanDue)}`);
    }

    parts.push(`----------------------------------------`);
    parts.push(`*एकूण बाकी रक्कम:* ${formatINR(payload.totalDue)}`);
    parts.push(``);
    parts.push(`आपण थेट सोसायटीच्या या UPI आयडीवर पैसे पाठवू शकता:`);
    parts.push(`*UPI ID:* \`${payload.upiId}\``);
    parts.push(``);
    parts.push(`वेळेवर सहकार्य केल्याने फंड मजबूत राहतो आणि सर्वांना वेळेवर मदत मिळते.`);
    parts.push(`_धन्यवाद / जझाकल्ला खैर_`);

    return parts.join('\n');
  }

  // Default English (en)
  const parts: string[] = [];
  parts.push(`*${payload.societyName}*`);
  parts.push(`----------------------------------------`);
  parts.push(`Assalamu Alaikum / Greetings *${payload.memberName}*,`);
  parts.push(``);
  parts.push(`This is a gentle reminder regarding your monthly welfare society dues for *${monthName}*:`);

  if (payload.monthlyShareDue && payload.monthlyShareDue > 0) {
    parts.push(`• *Monthly Share:* ${formatINR(payload.monthlyShareDue)}`);
  }

  if (payload.loanDue && payload.loanDue > 0) {
    parts.push(`• *Qarz-e-Hasan Installment Due:* ${formatINR(payload.loanDue)}`);
  }

  parts.push(`----------------------------------------`);
  parts.push(`*Total Amount Due:* ${formatINR(payload.totalDue)}`);
  parts.push(``);
  parts.push(`You can pay directly via UPI to our society account:`);
  parts.push(`*UPI ID:* \`${payload.upiId}\``);
  parts.push(``);
  parts.push(`Your timely share payment strengthens the mutual fund pool and helps our brothers in need.`);
  parts.push(`_Jazakallah Khair / Thank you._`);

  return parts.join('\n');
}

/**
 * Generate wa.me deep link for opening WhatsApp with prefilled message
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
  const clean = cleanMobile(phone);
  if (!clean) return '';
  return `https://wa.me/91${clean}?text=${encodeURIComponent(text)}`;
}
