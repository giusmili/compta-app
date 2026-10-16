
import { AppState, FinancialStats, BusinessStatus } from '../types';
import { STATUS_RATES } from '../constants';

const round2 = (n: number) => Math.round(n * 100) / 100;

export const calculateFinancials = (state: AppState): FinancialStats => {
  const totalRevenue = state.transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Math.round(t.amount * 100), 0) / 100;

  const totalExpenses = state.transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Math.round(t.amount * 100), 0) / 100;

  const chargeRate = state.status === BusinessStatus.CUSTOM 
    ? state.customChargeRate 
    : STATUS_RATES[state.status];

  // For Micro-entrepreneurs, charges are usually calculated on Revenue
  // For other statuses, it's more complex, but we simplify as a % of Revenue for this simulator
  const socialCharges = round2(totalRevenue * chargeRate);
  const netProfit = round2(totalRevenue - totalExpenses - socialCharges);

  return {
    totalRevenue,
    totalExpenses,
    socialCharges,
    netProfit,
    chargeRate
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};
