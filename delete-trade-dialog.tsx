
'use client';

import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { type Trade } from '@/types';

type DeleteTradeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade: Trade;
};

export function DeleteTradeDialog({ open, onOpenChange, trade }: DeleteTradeDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const tradeRef = doc(db, 'trades', trade.id);
      await deleteDoc(tradeRef);

      toast({
        title: 'Success',
        description: `Trade has been deleted.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast({
        variant: 'destructive',
        title: 'Error deleting trade',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this trade record.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className='bg-destructive hover:bg-destructive/90'>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
