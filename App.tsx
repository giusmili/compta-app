
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, AppState, BusinessStatus } from './types';
import { STATUS_RATES } from './constants';
import { calculateFinancials, formatCurrency } from './utils/calculations';
import SummaryCard from './components/SummaryCard';
import TransactionForm from './components/TransactionForm';
import { analyzeFinancials } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('compta_data');
    return saved ? JSON.parse(saved) : {
      transactions: [],
      status: BusinessStatus.MICRO_SERVICE,
      customChargeRate: 0.212
    };
  });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    localStorage.setItem('compta_data', JSON.stringify(state));
  }, [state]);

  const financials = useMemo(() => calculateFinancials(state), [state]);

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9)
    };
    setState(prev => ({
      ...prev,
      transactions: [transaction, ...prev.transactions]
    }));
  };

  const handleDeleteTransaction = (id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const handleStatusChange = (status: BusinessStatus) => {
    setState(prev => ({
      ...prev,
      status,
      customChargeRate: status === BusinessStatus.CUSTOM ? prev.customChargeRate : STATUS_RATES[status]
    }));
  };

  const handleAiAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const result = await analyzeFinancials(state, financials);
    setAiAnalysis(result || "Erreur d'analyse");
    setIsAnalyzing(false);
  };

  const chartData = useMemo(() => {
    return [
      { name: 'CA Total', value: financials.totalRevenue, color: '#4F46E5' },
      { name: 'Dépenses', value: financials.totalExpenses, color: '#EF4444' },
      { name: 'Charges Sociales', value: financials.socialCharges, color: '#F59E0B' },
      { name: 'Bénéfice Net', value: financials.netProfit, color: '#10B981' },
    ];
  }, [financials]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2 mb-2">
            <i className="fas fa-calculator"></i>
            ComptaExpert
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Barèmes 2025 inclus</p>
        </div>

        <nav className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="business-status" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statut Juridique</label>
            <select
              id="business-status"
              value={state.status}
              onChange={(e) => handleStatusChange(e.target.value as BusinessStatus)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              {Object.values(BusinessStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {state.status === BusinessStatus.CUSTOM && (
            <div className="flex flex-col gap-1">
              <label htmlFor="custom-charge-rate" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taux personnalisé (%)</label>
              <input
                id="custom-charge-rate"
                type="number"
                step="0.1"
                value={state.customChargeRate * 100}
                onChange={(e) => setState(prev => ({ ...prev, customChargeRate: parseFloat(e.target.value) / 100 }))}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium outline-none"
              />
            </div>
          )}
        </nav>

        <div className="mt-auto p-4 bg-indigo-50 rounded-2xl">
          <p className="text-indigo-800 text-sm font-semibold mb-2 flex items-center gap-2">
            <i className="fas fa-lightbulb"></i>
            Conseil IA
          </p>
          <button
            onClick={handleAiAnalyze}
            disabled={isAnalyzing}
            className={`w-full py-2 px-4 rounded-xl text-sm font-bold transition-all ${
              isAnalyzing 
                ? 'bg-indigo-200 text-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
            }`}
          >
            {isAnalyzing ? 'Analyse...' : 'Lancer l\'Analyse'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard 
            title="Chiffre d'Affaires" 
            value={formatCurrency(financials.totalRevenue)} 
            icon="fa-wallet" 
            color="bg-blue-500" 
          />
          <SummaryCard 
            title="Bénéfice Net" 
            value={formatCurrency(financials.netProfit)} 
            icon="fa-chart-line" 
            color="bg-emerald-500" 
          />
          <SummaryCard 
            title="Charges Sociales" 
            value={formatCurrency(financials.socialCharges)} 
            icon="fa-landmark" 
            color="bg-amber-500" 
          />
          <SummaryCard 
            title="Dépenses Directes" 
            value={formatCurrency(financials.totalExpenses)} 
            icon="fa-receipt" 
            color="bg-rose-500" 
          />
        </div>

        {/* AI Insight Section */}
        {aiAnalysis && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-indigo-500 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-robot text-indigo-600"></i>
                Analyse Expert Gemini
              </h3>
              <button onClick={() => setAiAnalysis(null)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="prose prose-indigo max-w-none text-slate-600 text-sm whitespace-pre-line">
              {aiAnalysis}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Input & History */}
          <div className="lg:col-span-2">
            <TransactionForm onAdd={handleAddTransaction} />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Historique des Transactions</h3>
                <span className="text-xs text-slate-400">{state.transactions.length} opérations</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Libellé</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Catégorie</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Montant</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">Aucune transaction enregistrée.</td>
                      </tr>
                    ) : (
                      state.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-sm text-slate-500">{new Date(tx.date).toLocaleDateString('fr-FR')}</td>
                          <td className="p-4">
                            <span className="text-sm font-medium text-slate-900">{tx.label}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{tx.category}</span>
                          </td>
                          <td className={`p-4 text-sm font-bold text-right ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="text-slate-300 hover:text-rose-500 transition-colors"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Charts & Info */}
          <div className="flex flex-col gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80">
              <h3 className="font-bold text-slate-800 mb-6">Répartition Financière</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle"></i>
                Cotisations 2025
              </h3>
              <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                Pour le statut <strong>{state.status}</strong>, le taux appliqué est de 
                <strong> {(financials.chargeRate * 100).toFixed(1)}%</strong>. Ces taux incluent les réformes récentes sur la retraite complémentaire.
              </p>
              <div className="bg-white/10 p-4 rounded-xl text-xs font-mono">
                Bénéfice = CA - Frais - (CA * {financials.chargeRate})
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
      <footer className="w-full text-center py-4 text-xs text-slate-400 border-t border-slate-100">
        © {new Date().getFullYear()} ComptaExpert. Tous droits réservés.
      </footer>
    </div>
  );
};

export default App;
