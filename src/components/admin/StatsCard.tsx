import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose';
  isWarning?: boolean;
}

export default function StatsCard({ title, value, icon: Icon, description, trend, color = "blue", isWarning }: StatsCardProps) {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/10',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/10',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/10',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/10',
  };

  const warningClasses = isWarning ? 'ring-2 ring-amber-500/50 bg-amber-500/5 border-amber-500/20' : 'bg-zinc-900 border-zinc-800';

  return (
    <div className={`border rounded-3xl p-5 hover:border-zinc-700 transition-all shadow-sm ${warningClasses}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-bold text-zinc-100 font-mono tracking-tighter">{value}</h3>
          {description && <p className="text-zinc-500 text-[10px] italic">{description}</p>}
        </div>
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      
      {trend && (
        <div className="mt-6 flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </span>
            <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-tight">vs last period</span>
        </div>
      )}
    </div>
  );
}
