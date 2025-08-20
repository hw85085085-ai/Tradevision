import { LineChart } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <LineChart className="h-7 w-7" />
      <h1 className="text-2xl font-bold">TradeVision</h1>
    </div>
  );
}
