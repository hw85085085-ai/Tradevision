
'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { startOfMonth } from 'date-fns';

export interface CalendarData {
  date: string;
  profit: number | null;
  tradeCount: number;
  longTrades: number;
  shortTrades: number;
}

const DayCell = ({ day, data }: { day: Date | null, data?: CalendarData }) => {
  if (!day) return <div className="h-8 w-8 rounded-sm border border-transparent" />;

  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  
  const tooltipContent = () => {
    if (data?.tradeCount) {
        return (
            <div>
                <p className="font-bold">{format(day, 'PPP')}</p>
                <p className={cn(data.profit! >= 0 ? 'text-accent' : 'text-destructive')}>
                    Profit: {currency.format(data.profit!)}
                </p>
                <p className="text-muted-foreground">Trades: {data.tradeCount} (Long: {data.longTrades}, Short: {data.shortTrades})</p>
            </div>
        )
    }
    return <p>{format(day, 'PPP')}: No trades</p>
  }

  let bgColor = 'bg-muted/50';
  if (data?.profit !== null) {
      if (data!.profit! > 0) bgColor = 'bg-accent/80 hover:bg-accent';
      else if (data!.profit! < 0) bgColor = 'bg-destructive/80 hover:bg-destructive';
      else bgColor = 'bg-muted hover:bg-muted/80';
  }

  return (
    <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={cn("h-8 w-8 rounded-sm border border-border/20", bgColor)} />
            </TooltipTrigger>
            <TooltipContent>
                {tooltipContent()}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
};

export function DailyProfitCalendar({ data }: { data: CalendarData[] }) {
  if (!data || data.length === 0) return null;
  const monthStart = startOfMonth(new Date(data[0].date));
  const firstDayOfWeek = monthStart.getDay(); // 0 for Sunday, 1 for Monday...
  
  const calendarGrid = [];
  // Add empty cells for days before the start of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarGrid.push(<DayCell key={`empty-${i}`} day={null} />);
  }

  data.forEach((dayData, index) => {
    const dayDate = new Date(dayData.date);
    calendarGrid.push(<DayCell key={index} day={dayDate} data={dayData} />);
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => (
                <div key={day} className="text-center text-xs text-muted-foreground font-semibold">{day}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
           {calendarGrid}
        </div>
    </div>
  );
}
