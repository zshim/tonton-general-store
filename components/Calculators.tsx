import React from 'react';
import { TAX_RATE } from '../constants';

const formatCurrency = (val: number) => `₹${val.toFixed(2)}`;

interface BillCalculatorProps {
  subtotal: number;
  taxRate?: number;
  discount?: number;
  className?: string;
}

/**
 * Calculates and displays the breakdown of a bill: Subtotal, Tax, Discount, and Total.
 */
export const BillCalculator: React.FC<BillCalculatorProps> = ({ 
  subtotal, 
  taxRate = TAX_RATE, 
  discount = 0, 
  className = "" 
}) => {
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;

  return (
    <div className={`space-y-3 text-sm text-slate-600 ${className}`}>
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
        <span>{formatCurrency(tax)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-emerald-600">
          <span>Discount</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      )}
      <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-800 text-base">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

interface DuesCalculatorProps {
  totalAmount: number;
  amountPaid: number;
  className?: string;
}

/**
 * Calculates remaining dues based on Total and Amount Paid.
 * Displays dynamic status (Paid, Partial, Pending).
 */
export const DuesCalculator: React.FC<DuesCalculatorProps> = ({ 
  totalAmount, 
  amountPaid,
  className = "" 
}) => {
  const remaining = Math.max(0, totalAmount - amountPaid);
  
  // Determine Status
  let status = 'PENDING';
  let statusColor = 'text-amber-600 bg-amber-50 border-amber-100';
  
  if (amountPaid >= totalAmount) {
    status = 'PAID';
    statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
  } else if (amountPaid > 0) {
    status = 'PARTIAL';
    statusColor = 'text-blue-600 bg-blue-50 border-blue-100';
  }

  return (
    <div className={`mt-4 p-3 rounded-lg border flex items-center justify-between ${statusColor} ${className}`}>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Payment Status</span>
        <span className="font-bold">{status}</span>
      </div>
      <div className="text-right">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">Remaining Due</span>
        <span className={`font-bold text-lg ${remaining > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
           {remaining > 0 ? formatCurrency(remaining) : 'Cleared'}
        </span>
      </div>
    </div>
  );
};