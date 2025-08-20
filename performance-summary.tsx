
'use client';

import { TrendingUp, TrendingDown, CirclePercent, Calculator, Sigma, DollarSign } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from 'next-themes';

export interface PerformanceData {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  averageProfit: number;
}

const StatCard = ({ icon: Icon, label, value, unit, className }: { icon: React.ElementType, label: string, value: string | number, unit?: string, className?: string }) => (
    <div className="flex items-center rounded-lg border p-4">
        <div className="mr-4 rounded-full bg-muted p-3">
            <Icon className={`h-6 w-6 ${className}`} />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value} <span className="text-sm font-normal">{unit}</span></p>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
            <p className="text-sm font-bold">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
};

export function PerformanceSummary({ data }: { data: PerformanceData }) {
    const { resolvedTheme } = useTheme();
    const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const accentColor = 'hsl(var(--accent))';
    const destructiveColor = 'hsl(var(--destructive))';
    
    const chartData = [
        { name: 'Wins', value: data.winningTrades, color: accentColor },
        { name: 'Losses', value: data.losingTrades, color: destructiveColor },
    ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="h-64 lg:col-span-1">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        stroke={resolvedTheme === 'dark' ? 'hsl(var(--background))' : 'hsl(var(--card))'}
                        strokeWidth={4}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:col-span-3">
            <StatCard icon={CirclePercent} label="Win Rate" value={data.winRate.toFixed(2)} unit="%" className={data.winRate >= 50 ? "text-accent" : "text-destructive"} />
            <StatCard icon={Sigma} label="Total Net P/L" value={currency.format(data.totalProfit)} className={data.totalProfit >= 0 ? "text-accent" : "text-destructive"} />
            <StatCard icon={DollarSign} label="Avg. P/L per Trade" value={currency.format(data.averageProfit)} className={data.averageProfit >= 0 ? "text-accent" : "text-destructive"} />
            <StatCard icon={Calculator} label="Total Trades" value={data.totalTrades} />
            <StatCard icon={TrendingUp} label="Winning Trades" value={data.winningTrades} className="text-accent" />
            <StatCard icon={TrendingDown} label="Losing Trades" value={data.losingTrades} className="text-destructive" />
       </div>
    </div>
  );
}
