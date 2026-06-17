export const CURRENCIES = [
  { code: 'IDR', symbol: 'Rp',   name: 'Indonesian Rupiah',  decimals: 0, locale: 'id-ID' },
  { code: 'USD', symbol: '$',    name: 'US Dollar',           decimals: 2, locale: 'en-US' },
  { code: 'EUR', symbol: '€',    name: 'Euro',                decimals: 2, locale: 'de-DE' },
  { code: 'GBP', symbol: '£',    name: 'British Pound',       decimals: 2, locale: 'en-GB' },
  { code: 'SGD', symbol: 'S$',   name: 'Singapore Dollar',    decimals: 2, locale: 'en-SG' },
  { code: 'MYR', symbol: 'RM',   name: 'Malaysian Ringgit',   decimals: 2, locale: 'ms-MY' },
  { code: 'JPY', symbol: '¥',    name: 'Japanese Yen',        decimals: 0, locale: 'ja-JP' },
  { code: 'AUD', symbol: 'A$',   name: 'Australian Dollar',   decimals: 2, locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$',   name: 'Canadian Dollar',     decimals: 2, locale: 'en-CA' },
  { code: 'THB', symbol: '฿',    name: 'Thai Baht',           decimals: 0, locale: 'th-TH' },
  { code: 'KRW', symbol: '₩',    name: 'South Korean Won',    decimals: 0, locale: 'ko-KR' },
  { code: 'CNY', symbol: 'CN¥',  name: 'Chinese Yuan',        decimals: 2, locale: 'zh-CN' },
];

export function getCurrency(code) {
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0];
}

export function formatAmount(amount, currencyCode) {
  const c = getCurrency(currencyCode);
  const num = c.decimals === 0 ? Math.round(amount) : amount;
  const str = num.toLocaleString(c.locale, {
    minimumFractionDigits: c.decimals,
    maximumFractionDigits: c.decimals,
  });
  return `${c.symbol}${str}`;
}

export function parseAmount(raw, currencyCode) {
  const c = getCurrency(currencyCode);
  const cleaned = String(raw).replace(/[^\d.]/g, '');
  return c.decimals === 0 ? parseInt(cleaned) || 0 : parseFloat(cleaned) || 0;
}

export function inputDisplayValue(amount, currencyCode) {
  const c = getCurrency(currencyCode);
  if (c.decimals === 0) return Math.round(amount).toLocaleString(c.locale);
  return Number(amount).toFixed(c.decimals);
}
