
import { BusinessStatus } from './types';

/**
 * Taux de cotisations sociales 2025 (France)
 * Source: URSSAF / Portail Auto-Entrepreneur
 */
export const STATUS_RATES: Record<BusinessStatus, number> = {
  [BusinessStatus.MICRO_SERVICE]: 0.212, // Prestations de services commerciales ou artisanales (21.2%)
  [BusinessStatus.MICRO_VENTE]: 0.123,   // Achat / Revente de marchandises (12.3%)
  [BusinessStatus.MICRO_LIBERALE]: 0.231, // Professions libérales non réglementées (23.1% en 2025)
  [BusinessStatus.SASU]: 0.45,           // Estimation charges sur salaire (Président)
  [BusinessStatus.EURL]: 0.35,           // Estimation charges TNS (Gérant)
  [BusinessStatus.CUSTOM]: 0.0,
};

export const CATEGORIES = [
  'Vente',
  'Prestation de service',
  'Matériel',
  'Logiciels/SaaS',
  'Marketing',
  'Loyer/Charges',
  'Transport',
  'Autres'
];
