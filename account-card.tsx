
'use client';

import { useMemo, useState } from 'react';
import {
  Banknote,
  TrendingUp,
  TrendingDown,
  CirclePercent,
  Calculator,
  Wallet,
  Hash,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Account, type Trade, type Transaction } from '@/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { EditAccountDialog } from './edit-account-dialog';
import { DeleteAccountDialog } from './delete-account-dialog';
import { TransactionDialog } from './transaction-dialog';

interface AccountStats {
  totalProfit: number;
  currentBalance: number;
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  pairsTraded: number;
  winRate: number;
}

const StatItem = ({
  icon: Icon,
  label,
  value,
  className,
  isLoading = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  className?: string;
  isLoading?: boolean;
}) => (
  <div className="flex items-center justify-between text-sm h-5">
    <div className="flex items-center text-muted-foreground">
      <Icon className="mr-2 h-4 w-4" />
      <span>{label}</span>
    </div>
    {isLoading ? <Skeleton className="h-4 w-1/4" /> : <span className={`font-medium ${className}`}>{value}</span>}
  </div>
);

interface AccountCardProps {
  account: Account;
  trades: Trade[];
  transactions: Transaction[];
}

export function AccountCard({ account, trades, transactions }: AccountCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  
  const isLoading = account.id.startsWith('optimistic-');

  const stats: AccountStats | null = useMemo(() => {
    if (isLoading) return null;

    const totalProfit = trades.reduce((sum, trade) => sum + trade.netProfit, 0);
    const totalDeposits = transactions
      .filter((t) => t.type === 'Deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = transactions
      .filter((t) => t.type === 'Withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = account.initialBalance + totalProfit + totalDeposits - totalWithdrawals;
    const totalTrades = trades.length;
    const winTrades = trades.filter((trade) => trade.netProfit > 0).length;
    const lossTrades = totalTrades - winTrades;
    const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
    
    const pairs = new Set<string>();
    trades.forEach(trade => pairs.add(trade.pair));

    return {
      totalProfit,
      currentBalance,
      totalTrades,
      winTrades,
      lossTrades,
      pairsTraded: pairs.size,
      winRate,
    };
  }, [account.initialBalance, trades, transactions, isLoading]);
  
  const formattedStats = useMemo(() => {
    const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const initialBalance = currency.format(account.initialBalance);
    
    if (!stats) {
        return {
          initialBalance,
          totalProfit: '$0.00',
          currentBalance: currency.format(account.initialBalance),
          winRate: '0.00%',
        }
    }

    return {
      initialBalance,
      totalProfit: currency.format(stats.totalProfit),
      currentBalance: currency.format(stats.currentBalance),
      winRate: `${stats.winRate.toFixed(2)}%`,
    };
  }, [stats, account.initialBalance]);

  const badgeVariant =
    account.type === 'Real'
      ? 'default'
      : account.type === 'Challenge'
      ? 'destructive'
      : 'secondary';

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className='flex-1'>
              <CardTitle className="text-xl">{account.name}</CardTitle>
              <CardDescription>
                {formattedStats.initialBalance} Initial Balance
              </CardDescription>
            </div>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsDepositDialogOpen(true)}>
                  <ArrowUpRight className="mr-2 h-4 w-4" /> Deposit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsWithdrawDialogOpen(true)}>
                  <ArrowDownLeft className="mr-2 h-4 w-4" /> Withdrawal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
          <StatItem
            icon={Wallet}
            label="Current Balance"
            value={formattedStats.currentBalance}
            className={!isLoading && stats && stats.currentBalance >= account.initialBalance ? 'text-accent' : 'text-destructive'}
            isLoading={isLoading}
          />
          <StatItem
            icon={Banknote}
            label="Total Profit"
            value={formattedStats.totalProfit}
            className={!isLoading && stats && stats.totalProfit >= 0 ? 'text-accent' : 'text-destructive'}
            isLoading={isLoading}
          />
          <StatItem
            icon={CirclePercent}
            label="Win Rate"
            value={formattedStats.winRate}
            isLoading={isLoading}
          />
          <StatItem
            icon={Calculator}
            label="Total Trades"
            value={stats?.totalTrades ?? 0}
            isLoading={isLoading}
          />
          <StatItem
            icon={TrendingUp}
            label="Winning Trades"
            value={stats?.winTrades ?? 0}
            className="text-accent"
            isLoading={isLoading}
          />
          <StatItem
            icon={TrendingDown}
            label="Losing Trades"
            value={stats?.lossTrades ?? 0}
            className="text-destructive"
            isLoading={isLoading}
          />
          <StatItem
            icon={Hash}
            label="Pairs Traded"
            value={stats?.pairsTraded ?? 0}
            isLoading={isLoading}
          />
        </CardContent>
         <div className='flex justify-end p-4 gap-2'>
            <Badge variant={badgeVariant}>{account.type}</Badge>
        </div>
      </Card>
      
      <EditAccountDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        account={account}
      />
      <DeleteAccountDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        account={account}
      />
      <TransactionDialog
        open={isDepositDialogOpen}
        onOpenChange={setIsDepositDialogOpen}
        account={account}
        type="Deposit"
      />
      <TransactionDialog
        open={isWithdrawDialogOpen}
        onOpenChange={setIsWithdrawDialogOpen}
        account={account}
        type="Withdrawal"
      />
    </>
  );
}
