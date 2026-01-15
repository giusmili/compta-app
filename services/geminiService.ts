
import { GoogleGenAI } from "@google/genai";
import { AppState, FinancialStats } from "../types";

export const analyzeFinancials = async (state: AppState, stats: FinancialStats) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    En tant qu'expert comptable et conseiller business, analyse ces données financières :
    Statut : ${state.status}
    Chiffre d'Affaires : ${stats.totalRevenue.toFixed(2)} €
    Dépenses (hors charges sociales) : ${stats.totalExpenses.toFixed(2)} €
    Charges Sociales estimées : ${stats.socialCharges.toFixed(2)} €
    Bénéfice Net : ${stats.netProfit.toFixed(2)} €
    Taux de charge appliqué : ${(state.customChargeRate || 0) * 100}%
    
    Donne un résumé rapide de la santé financière, 3 conseils d'optimisation (fiscale ou business) et une prévision si cette tendance continue.
    Réponds en français, avec un ton professionnel et encourageant. Utilise du Markdown pour la structure.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Désolé, l'analyse IA n'est pas disponible pour le moment.";
  }
};
