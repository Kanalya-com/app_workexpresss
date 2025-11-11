import { CheckCircle, Clock, FileText, DollarSign } from "lucide-react";

export default function MetricCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-[#0b0f19] text-[#0b0f19] dark:text-gray-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm border border-gray-200 dark:border-gray-700  hover:border-gray-700 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-400">{title}</h4>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>

      <div>
        <p className="text-2xl font-semibold text-[#0b0f19]  dark:text-white">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
