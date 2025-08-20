
'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreHorizontal, ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { type Trade } from '@/types';
import { cn } from '@/lib/utils';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

type ColumnsConfig = {
  accountMap: Map<string, string>;
  onEdit: (trade: Trade) => void;
  onDelete: (trade: Trade) => void;
};

export const columns = ({ accountMap, onEdit, onDelete }: ColumnsConfig): ColumnDef<Trade>[] => [
  {
    accessorKey: 'openTime',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.getValue('openTime') as { seconds: number; nanoseconds: number; };
      // Handle optimistic trade date which is a Date object
      if (date instanceof Date) {
        return <div>{format(date, 'PP')}</div>;
      }
      return <div>{format(new Date(date.seconds * 1000), 'PP')}</div>;
    },
  },
  {
    accessorKey: 'pair',
    header: 'Pair',
  },
   {
    accessorKey: 'accountId',
    header: 'Account',
    cell: ({ row }) => accountMap.get(row.getValue('accountId')) || 'Unknown',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'direction',
    header: 'Direction',
    cell: ({ row }) => {
      const direction = row.getValue('direction') as string;
      const isLong = direction === 'Long';
      return (
        <div className={cn('flex items-center', isLong ? 'text-accent' : 'text-destructive')}>
          {isLong ? <ArrowUp className="mr-2 h-4 w-4" /> : <ArrowDown className="mr-2 h-4 w-4" />}
          {direction}
        </div>
      );
    },
  },
  {
    accessorKey: 'profit',
    header: 'P/L',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('profit'));
      return (
        <div className={cn(amount >= 0 ? 'text-accent' : 'text-destructive', 'font-medium')}>
          {currencyFormatter.format(amount)}
        </div>
      );
    },
  },
    {
    accessorKey: 'netProfit',
    header: 'Net P/L',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('netProfit'));
      return (
        <div className={cn(amount >= 0 ? 'text-accent' : 'text-destructive', 'font-medium')}>
          {currencyFormatter.format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant = status === 'Win' ? 'default' : 'destructive';
      const className = status === 'Win' ? 'bg-accent hover:bg-accent/80' : 'bg-destructive hover:bg-destructive/80';
      return <Badge className={className} variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'rewardRatio',
    header: 'R:R',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const trade = row.original;
      const isOptimistic = trade.id.startsWith('optimistic-');

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isOptimistic}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(trade.id)}
            >
              Copy Trade ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(trade)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Trade
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(trade)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Trade
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
