export type Region = 'TZ' | 'KE' | 'UG' | 'RW' | 'BI';

interface RegionConfig {
  locale: string;
  currency: string;
  symbol: string;
  flag: string;
  nameEn: string;
  nameSw: string;
  dailyWarnThreshold: number;   // Amount above which daily spend triggers a caution
  maxTransactionAmount: number; // Reasonable per-transaction cap
  quickAmounts: [number[], number[], number[], number[]]; // morning/lunch/evening/other
  goalDefaults: {
    schoolFees: number;
    bills: number;
    emergencyFund: number;
    data: number;
    travel: number;
  };
}

export const REGION_CONFIG: Record<Region, RegionConfig> = {
  TZ: {
    locale: 'sw-TZ', currency: 'TZS', symbol: 'TSh', flag: '🇹🇿',
    nameEn: 'Tanzania', nameSw: 'Tanzania',
    dailyWarnThreshold: 30000,
    maxTransactionAmount: 99_999_999,
    quickAmounts: [
      [2000, 3000, 5000, 10000],
      [3000, 5000, 8000, 15000],
      [5000, 10000, 20000, 30000],
      [2000, 5000, 10000, 20000],
    ],
    goalDefaults: { schoolFees: 500000, bills: 200000, emergencyFund: 300000, data: 50000, travel: 1000000 },
  },
  KE: {
    locale: 'en-KE', currency: 'KES', symbol: 'KSh', flag: '🇰🇪',
    nameEn: 'Kenya', nameSw: 'Kenya',
    dailyWarnThreshold: 3000,
    maxTransactionAmount: 9_999_999,
    quickAmounts: [
      [50, 200, 500, 1000],
      [200, 500, 1000, 2000],
      [500, 1000, 2000, 5000],
      [200, 500, 1000, 3000],
    ],
    goalDefaults: { schoolFees: 50000, bills: 20000, emergencyFund: 30000, data: 5000, travel: 100000 },
  },
  UG: {
    locale: 'en-UG', currency: 'UGX', symbol: 'USh', flag: '🇺🇬',
    nameEn: 'Uganda', nameSw: 'Uganda',
    dailyWarnThreshold: 80000,
    maxTransactionAmount: 999_999_999,
    quickAmounts: [
      [3000, 8000, 15000, 30000],
      [5000, 10000, 20000, 50000],
      [10000, 20000, 50000, 100000],
      [5000, 10000, 20000, 50000],
    ],
    goalDefaults: { schoolFees: 2000000, bills: 800000, emergencyFund: 1000000, data: 200000, travel: 4000000 },
  },
  RW: {
    locale: 'en-RW', currency: 'RWF', symbol: 'Fr', flag: '🇷🇼',
    nameEn: 'Rwanda', nameSw: 'Rwanda',
    dailyWarnThreshold: 15000,
    maxTransactionAmount: 99_999_999,
    quickAmounts: [
      [500, 1000, 2000, 5000],
      [1000, 2000, 5000, 10000],
      [2000, 5000, 10000, 20000],
      [1000, 2000, 5000, 10000],
    ],
    goalDefaults: { schoolFees: 200000, bills: 80000, emergencyFund: 120000, data: 20000, travel: 400000 },
  },
  BI: {
    locale: 'sw-BI', currency: 'BIF', symbol: 'Fr', flag: '🇧🇮',
    nameEn: 'Burundi', nameSw: 'Burundi',
    dailyWarnThreshold: 50000,
    maxTransactionAmount: 999_999_999,
    quickAmounts: [
      [1000, 2000, 5000, 10000],
      [2000, 5000, 10000, 20000],
      [5000, 10000, 20000, 50000],
      [2000, 5000, 10000, 20000],
    ],
    goalDefaults: { schoolFees: 100000, bills: 40000, emergencyFund: 60000, data: 10000, travel: 200000 },
  },
};

export function formatCurrency(amount: number, region: Region): string {
  const cfg = REGION_CONFIG[region];
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${cfg.symbol} ${amount.toLocaleString()}`;
  }
}

export function formatCurrencyShort(amount: number, region: Region): string {
  const { symbol } = REGION_CONFIG[region];
  if (amount >= 1_000_000) return `${symbol} ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${symbol} ${(amount / 1_000).toFixed(0)}K`;
  return `${symbol} ${amount}`;
}
