
'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { useTheme } from 'next-themes';

export interface PairProfitData {
  pair: string;
  profit: number;
  trades: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-1">
          <p className="text-sm font-bold text-foreground">{label}</p>
          <p className={`text-sm ${payload[0].value >= 0 ? 'text-accent' : 'text-destructive'}`}>
            Profit: {currency.format(payload[0].value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Trades: {data.trades}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export function PairProfitChart({ data }: { data: PairProfitData[] }) {
    const { resolvedTheme } = useTheme();
    const accentColor = 'hsl(var(--accent))';
    const destructiveColor = 'hsl(var(--destructive))';
    const mutedColor = resolvedTheme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))';

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} horizontal={false} />
                    <XAxis type="number" stroke={mutedColor} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <YAxis type="category" dataKey="pair" stroke={mutedColor} tickLine={false} axisLine={false} width={80} />
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
