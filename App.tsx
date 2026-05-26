
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, AppState, BusinessStatus } from './types';
import { STATUS_RATES } from './constants';
import { calculateFinancials, formatCurrency } from './utils/calculations';
import SummaryCard from './components/SummaryCard';
import TransactionForm from './components/TransactionForm';
import ChatModal from './components/ChatModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type ChartEntry = { name: string; value: number; color: string };

const DEFAULT_STATE: AppState = {
  transactions: [],
  status: BusinessStatus.MICRO_SERVICE,
  customChargeRate: 0.212,
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('compta_data');
      return saved ? JSON.parse(saved) : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('compta_data', JSON.stringify(state));
  }, [state]);

  const financials = useMemo(() => calculateFinancials(state), [state]);

  const chatContext = useMemo(() => ({
    status: state.status,
    totalRevenue: financials.totalRevenue,
    totalExpenses: financials.totalExpenses,
    socialCharges: financials.socialCharges,
    netProfit: financials.netProfit,
    chargeRate: financials.chargeRate,
  }), [state.status, financials]);

  const handleAddTransaction = useCallback((newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: crypto.randomUUID()
    };
    setState(prev => ({
      ...prev,
      transactions: [transaction, ...prev.transactions]
    }));
  }, []);

  const handleDeleteTransaction = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter((t: Transaction) => t.id !== id)
    }));
  }, []);

  const handleStatusChange = (status: BusinessStatus) => {
    setState(prev => ({
      ...prev,
      status,
      customChargeRate: status === BusinessStatus.CUSTOM ? prev.customChargeRate : STATUS_RATES[status]
    }));
  };

  const chartData = useMemo((): ChartEntry[] => [
    { name: 'CA Total', value: financials.totalRevenue, color: '#4F46E5' },
    { name: 'Dépenses', value: financials.totalExpenses, color: '#EF4444' },
    { name: 'Charges Sociales', value: financials.socialCharges, color: '#F59E0B' },
    { name: 'Bénéfice Net', value: financials.netProfit, color: '#10B981' },
  ], [financials]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2 mb-2">
            <i className="fas fa-calculator" aria-hidden="true"></i>
            ComptaExpert
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Barèmes 2025 inclus</p>
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
            <i className="fas fa-lightbulb" aria-hidden="true"></i>
            Conseil IA
          </p>
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="w-full py-2 px-4 rounded-xl text-sm font-bold transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            <i className="fas fa-comments" aria-hidden="true"></i>
            Discuter avec l'IA
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Input & History */}
          <div className="lg:col-span-2">
            <TransactionForm onAdd={handleAddTransaction} />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Historique des Transactions</h3>
                <span className="text-xs text-slate-500">{state.transactions.length} opérations</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th scope="col" className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Libellé</th>
                      <th scope="col" className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Catégorie</th>
                      <th scope="col" className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Montant</th>
                      <th scope="col" className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">Aucune transaction enregistrée.</td>
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
                              type="button"
                              onClick={() => handleDeleteTransaction(tx.id)}
                              aria-label={`Supprimer ${tx.label}`}
                              className="text-slate-300 hover:text-rose-500 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 rounded"
                            >
                              <i className="fas fa-trash-alt" aria-hidden="true"></i>
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
                    {chartData.map((entry: ChartEntry, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle" aria-hidden="true"></i>
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
      <footer className="w-full text-center py-4 text-xs text-slate-500 border-t border-slate-100">
        © {new Date().getFullYear()} ComptaExpert. Tous droits réservés.
      </footer>

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        context={chatContext}
      />
    </div>
  );
};

export default App;
