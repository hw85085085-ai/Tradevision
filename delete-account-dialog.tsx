'use client';

import { useState } from 'react';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
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
import { type Account } from '@/types';

type DeleteAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account;
};

export function DeleteAccountDialog({ open, onOpenChange, account }: DeleteAccountDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // Create a batch to delete the account and all its associated trades and transactions
      const batch = writeBatch(db);
      
      // Delete account
      const accountRef = doc(db, 'accounts', account.id);
      batch.delete(accountRef);

      // Find and delete associated trades
      const tradesQuery = query(collection(db, 'trades'), where('accountId', '==', account.id));
      const tradesSnapshot = await getDocs(tradesQuery);
      tradesSnapshot.forEach(doc => batch.delete(doc.ref));
      
      // Find and delete associated transactions
      const transactionsQuery = query(collection(db, 'transactions'), where('accountId', '==', account.id));
      const transactionsSnapshot = await getDocs(transactionsQuery);
      transactionsSnapshot.forEach(doc => batch.delete(doc.ref));

      await batch.commit();

      toast({
        title: 'Success',
        description: `Account "${account.name}" and all its data have been deleted.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        variant: 'destructive',
        title: 'Error deleting account',
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
            This action cannot be undone. This will permanently delete the account
            <span className="font-bold"> "{account.name}"</span> and all of its associated trades and transactions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
