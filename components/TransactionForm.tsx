import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { Transaction } from '../types';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd }) => {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!label || !amount) return;

    onAdd({
      label,
      amount: parseFloat(amount),
      type,
      category,
      date,
    });

    setLabel('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 mb-8 transition-all hover:border-indigo-500/30">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
        <i className="fas fa-plus-circle text-indigo-400"></i>
        Nouvelle Transaction
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="tx-label" className="text-xs font-bold text-white uppercase tracking-wider">Libelle</label>
          <input
            id="tx-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Ex: Facture Client X"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="tx-amount" className="text-xs font-bold text-white uppercase tracking-wider">Montant (?)</label>
          <input
            id="tx-amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="tx-date" className="text-xs font-bold text-white uppercase tracking-wider">Date</label>
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="tx-type" className="text-xs font-bold text-white uppercase tracking-wider">Type</label>
          <select
            id="tx-type"
            aria-label="Type de transaction"
            value={type}
            onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
            className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="INCOME">Revenu (CA)</option>
            <option value="EXPENSE">Depense</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="tx-category" className="text-xs font-bold text-white uppercase tracking-wider">Categorie</label>
          <select
            id="tx-category"
            aria-label="Categorie de la transaction"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 lg:justify-end">
          <button
            type="submit"
            className="bg-indigo-500 text-white rounded-lg py-2 px-4 hover:bg-indigo-600 transition-all font-bold shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            Ajouter
          </button>
        </div>
      </div>
    </form>
  );
};

export default TransactionForm;
