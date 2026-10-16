import { AppState, BusinessStatus, Transaction } from '../types';

export const STORAGE_KEY = 'compta_data';

export const DEFAULT_STATE: AppState = {
  transactions: [],
  status: BusinessStatus.MICRO_SERVICE,
  customChargeRate: 0.212,
};

const isTransaction = (t: unknown): t is Transaction => {
  if (typeof t !== 'object' || t === null) return false;
  const r = t as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.date === 'string' &&
    typeof r.label === 'string' &&
    typeof r.category === 'string' &&
    (r.type === 'INCOME' || r.type === 'EXPENSE') &&
    typeof r.amount === 'number' &&
    Number.isFinite(r.amount)
  );
};

export const clampRate = (rate: number): number =>
  Number.isFinite(rate) ? Math.min(1, Math.max(0, rate)) : 0;

/** Parse et valide les données stockées ; retombe sur DEFAULT_STATE si invalides. */
export const parseStoredState = (raw: string | null): AppState => {
  if (!raw) return DEFAULT_STATE;
  try {
    const data = JSON.parse(raw) as Partial<AppState> | null;
    if (!data || typeof data !== 'object') return DEFAULT_STATE;
    const status = Object.values(BusinessStatus).includes(data.status as BusinessStatus)
      ? (data.status as BusinessStatus)
      : DEFAULT_STATE.status;
    return {
      status,
      customChargeRate:
        typeof data.customChargeRate === 'number'
          ? clampRate(data.customChargeRate)
          : DEFAULT_STATE.customChargeRate,
      transactions: Array.isArray(data.transactions) ? data.transactions.filter(isTransaction) : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
};

/** Date locale au format YYYY-MM-DD (et non UTC). */
export const todayLocal = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
