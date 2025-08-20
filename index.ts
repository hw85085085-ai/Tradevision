
import { type Timestamp } from 'firebase/firestore';

export type Account = {
  id: string;
  name: string;
  type: 'Demo' | 'Real' | 'Challenge';
  initialBalance: number;
};

export type Trade = {
  id: string;
  accountId: string;
  pair: string;
  openTime: Timestamp | Date; // Allow Date for optimistic updates
  direction: 'Long' | 'Short';
  profit: number;
  commission: number;
  netProfit: number;
  status: 'Win' | 'Loss';
  rewardRatio?: string;
  conclusion?: string;
  emotion?: 'Calm' | 'Fear' | 'Greed' | 'Neutral';
  remark?: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  type: 'Deposit' | 'Withdrawal';
  amount: number;
  date: Timestamp;
};
