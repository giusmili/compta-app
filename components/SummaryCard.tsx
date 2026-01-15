
import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color, trend }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <i className={`fas ${icon} text-white text-xl`}></i>
        </div>
        {trend && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-600">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
};

export default SummaryCard;
