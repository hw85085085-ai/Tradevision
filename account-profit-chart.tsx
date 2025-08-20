
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from 'next-themes';

interface ChartData {
  name: string;
  profit: number;
}

interface AccountProfitChartProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-1">
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className={`text-sm ${payload[0].value >= 0 ? 'text-accent' : 'text-destructive'}`}>
              Profit: {currency.format(payload[0].value)}
            </p>
          </div>
        </div>
      );
    }
  
    return null;
  };

export function AccountProfitChart({ data }: AccountProfitChartProps) {
    const { resolvedTheme } = useTheme();
    const accentColor = 'hsl(var(--accent))';
    const destructiveColor = 'hsl(var(--destructive))';
    const mutedColor = resolvedTheme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))'

  return (
    <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
            data={data}
            margin={{
                top: 5,
                right: 20,
                left: 20,
                bottom: 5,
            }}
            >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" stroke={mutedColor} tickLine={false} axisLine={false} />
                <YAxis stroke={mutedColor} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
                <Bar dataKey="profit">
                    {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? accentColor : destructiveColor} />
                    ))}
                </Bar>
            </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
