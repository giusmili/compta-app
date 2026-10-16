import { describe, it, expect } from 'vitest';
import { calculateFinancials } from '../utils/calculations';
import { parseStoredState, DEFAULT_STATE } from '../utils/storage';
import { AppState, BusinessStatus, Transaction } from '../types';

const tx = (type: Transaction['type'], amount: number): Transaction => ({
  id: String(Math.random()), date: '2025-01-01', label: 'x', category: 'Autres', type, amount,
});

describe('calculateFinancials', () => {
  it('applique le taux au CA, pas au bénéfice', () => {
    const state: AppState = {
      ...DEFAULT_STATE,
      status: BusinessStatus.MICRO_SERVICE,
      transactions: [tx('INCOME', 1000), tx('EXPENSE', 100)],
    };
    const r = calculateFinancials(state);
    expect(r.socialCharges).toBe(212);
    expect(r.netProfit).toBe(688);
  });

  it('évite les erreurs de flottants', () => {
    const state: AppState = { ...DEFAULT_STATE, transactions: [tx('INCOME', 0.1), tx('INCOME', 0.2)] };
    expect(calculateFinancials(state).totalRevenue).toBe(0.3);
  });

  it('utilise le taux personnalisé', () => {
    const state: AppState = {
      status: BusinessStatus.CUSTOM, customChargeRate: 0.5, transactions: [tx('INCOME', 200)],
    };
    expect(calculateFinancials(state).socialCharges).toBe(100);
  });
});

describe('parseStoredState', () => {
  it('retombe sur le défaut si JSON invalide ou vide', () => {
    expect(parseStoredState(null)).toEqual(DEFAULT_STATE);
    expect(parseStoredState('{oops')).toEqual(DEFAULT_STATE);
  });

  it('écarte les transactions invalides et corrige le taux manquant', () => {
    const raw = JSON.stringify({ status: 'inconnu', customChargeRate: null, transactions: [{ foo: 1 }, tx('INCOME', 5)] });
    const s = parseStoredState(raw);
    expect(s.status).toBe(DEFAULT_STATE.status);
    expect(s.customChargeRate).toBe(DEFAULT_STATE.customChargeRate);
    expect(s.transactions).toHaveLength(1);
  });
});
