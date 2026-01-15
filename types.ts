
export enum BusinessStatus {
  MICRO_SERVICE = 'Micro-Entrepreneur (Services)',
  MICRO_VENTE = 'Micro-Entrepreneur (Vente)',
  MICRO_LIBERALE = 'Micro-Entrepreneur (Libérale)',
  SASU = 'SASU (Indicateur)',
  EURL = 'EURL (Indicateur)',
  CUSTOM = 'Personnalisé'
}

export interface Transaction {
  id: string;
  date: string;
  label: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
}

export interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  socialCharges: number;
  netProfit: number;
  chargeRate: number;
}

export interface AppState {
  transactions: Transaction[];
  status: BusinessStatus;
  customChargeRate: number;
}
