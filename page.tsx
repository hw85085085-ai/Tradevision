
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
} from 'date-fns';

import { db } from '@/lib/firebase';
import { type Trade } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PerformanceSummary, type PerformanceData } from '@/components/analytics/performance-summary';
import { DailyProfitCalendar, type CalendarData } from '@/components/analytics/daily-profit-calendar';
import { PairProfitChart, type PairProfitData } from '@/components/analytics/pair-profit-chart';

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tradesQuery = query(collection(db, 'trades'));
    const unsubscribe = onSnapshot(tradesQuery, (snapshot) => {
      const userTrades: Trade[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Trade));
      setTrades(userTrades);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching trades:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const performanceData: PerformanceData | null = useMemo(() => {
    if (!trades.length) return null;
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.netProfit > 0).length;
    const losingTrades = totalTrades - winningTrades;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const totalProfit = trades.reduce((acc, t) => acc + t.netProfit, 0);
    const averageProfit = totalTrades > 0 ? totalProfit / totalTrades : 0;

    return {
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        totalProfit,
        averageProfit,
    };
  }, [trades]);

  const calendarData: CalendarData[] = useMemo(() => {
    if (!trades.length) return [];
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return daysInMonth.map(day => {
        const tradesOnDay = trades.filter(trade => isSameDay(new Date(trade.openTime.seconds * 1000), day));
        const profit = tradesOnDay.reduce((acc, trade) => acc + trade.netProfit, 0);
        const longTrades = tradesOnDay.filter(t => t.direction === 'Long').length;
        const shortTrades = tradesOnDay.filter(t => t.direction === 'Short').length;
        return {
            date: format(day, 'yyyy-MM-dd'),
            profit: tradesOnDay.length > 0 ? profit : null,
            tradeCount: tradesOnDay.length,
            longTrades,
            shortTrades,
        };
    });
  }, [trades]);

  const pairProfitData: PairProfitData[] = useMemo(() => {
    if (!trades.length) return [];
    
    const profitByPair = trades.reduce((acc, trade) => {
        if (!acc[trade.pair]) {
            acc[trade.pair] = { profit: 0, trades: 0 };
        }
        acc[trade.pair].profit += trade.netProfit;
        acc[trade.pair].trades += 1;
        return acc;
    }, {} as Record<string, { profit: number, trades: number }>);

    return Object.entries(profitByPair).map(([pair, data]) => ({
        pair,
        profit: data.profit,
        trades: data.trades,
    })).sort((a,b) => b.profit - a.profit);
  }, [trades]);

  const renderSkeletons = () => (
    <div className="grid gap-6">
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trading Analytics</h1>
        <p className="text-muted-foreground">
          A graphical review of your trading performance.
        </p>
      </div>

      {isLoading ? (
        renderSkeletons()
      ) : trades.length > 0 ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Overall statistics of your trading activity.</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData && <PerformanceSummary data={performanceData} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Profitability by Pair</CardTitle>
               <CardDescription>Net profit and trade count for each currency pair.</CardDescription>
            </CardHeader>
            <CardContent>
              <PairProfitChart data={pairProfitData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>This Month's P/L</CardTitle>
              <CardDescription>Your daily profit and loss for the current month.</CardDescription>
            </CardHeader>
            <CardContent>
                <DailyProfitCalendar data={calendarData} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">No Trade Data</h3>
            <p className="text-sm text-muted-foreground">Log some trades in the Journal to see your analytics.</p>
        </div>
      )}
    </div>
  );
}
