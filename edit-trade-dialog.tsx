
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Account, Trade } from '@/types';

const formSchema = z.object({
  accountId: z.string().min(1, { message: 'Please select an account.' }),
  pair: z.string().min(1, 'Pair is required.').toUpperCase(),
  openTime: z.date(),
  direction: z.enum(['Long', 'Short']),
  profit: z.coerce.number(),
  commission: z.coerce.number().min(0).default(0),
  rewardRatio: z.string().optional(),
  conclusion: z.string().optional(),
  emotion: z.enum(['Calm', 'Fear', 'Greed', 'Neutral']).optional().default('Neutral'),
  remark: z.string().optional(),
});

type EditTradeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  trade: Trade;
};

export function EditTradeDialog({ open, onOpenChange, accounts, trade }: EditTradeDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: '',
      pair: '',
      openTime: new Date(),
      direction: 'Long',
      profit: 0,
      commission: 0,
      rewardRatio: '',
      conclusion: '',
      emotion: 'Neutral',
      remark: '',
    },
  });

  useEffect(() => {
    if (trade) {
      form.reset({
        accountId: trade.accountId,
        pair: trade.pair,
        openTime: new Date(trade.openTime.seconds * 1000),
        direction: trade.direction,
        profit: trade.profit,
        commission: trade.commission,
        rewardRatio: trade.rewardRatio || '',
        conclusion: trade.conclusion || '',
        emotion: trade.emotion || 'Neutral',
        remark: trade.remark || '',
      });
    }
  }, [trade, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const { profit, commission, ...rest } = values;
    const netProfit = profit - commission;
    const status = netProfit > 0 ? 'Win' : 'Loss';

    try {
      const tradeRef = doc(db, 'trades', trade.id);
      await updateDoc(tradeRef, {
        ...rest,
        profit,
        commission,
        netProfit,
        status,
        openTime: Timestamp.fromDate(values.openTime),
      });
      toast({ title: 'Success', description: 'Trade updated successfully.' });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating trade:", error)
      toast({ variant: 'destructive', title: 'Error updating trade', description: 'Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
          <DialogDescription>Update the details for your trade.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="accountId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select an account" /></SelectTrigger></FormControl>
                      <SelectContent>{accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="pair" render={({ field }) => (
                  <FormItem><FormLabel>Pair (e.g. EUR/USD)</FormLabel><FormControl><Input placeholder="EUR/USD" {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
              <FormField control={form.control} name="openTime" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Open Time/Date</FormLabel>
                    <Popover><PopoverTrigger asChild>
                        <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button></FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="direction" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="Long">Long</SelectItem><SelectItem value="Short">Short</SelectItem></SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="profit" render={({ field }) => (
                  <FormItem><FormLabel>Profit/Loss</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
              <FormField control={form.control} name="commission" render={({ field }) => (
                  <FormItem><FormLabel>Commission</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
              <FormField control={form.control} name="rewardRatio" render={({ field }) => (
                  <FormItem><FormLabel>Reward Ratio (e.g. 1:2)</FormLabel><FormControl><Input placeholder="1:3" {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
              <FormField control={form.control} name="emotion" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emotion</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Neutral">Neutral</SelectItem>
                        <SelectItem value="Calm">Calm</SelectItem>
                        <SelectItem value="Fear">Fear</SelectItem>
                        <SelectItem value="Greed">Greed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField control={form.control} name="conclusion" render={({ field }) => (
                <FormItem><FormLabel>Conclusion</FormLabel><FormControl><Textarea placeholder="What was the outcome?" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField control={form.control} name="remark" render={({ field }) => (
                <FormItem><FormLabel>Remark</FormLabel><FormControl><Textarea placeholder="Any final thoughts or lessons learned?" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
