import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, TransactionType, PaymentMethod } from '../../types';
import { ArrowDownLeft, ArrowUpRight, DollarSign, Banknote, Smartphone } from 'lucide-react';

const History = () => {
  const { user, transactions, payDues } = useApp();
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>(PaymentMethod.ONLINE);

  const relevantTransactions = user?.role === UserRole.MANAGER 
    ? transactions 
    : transactions.filter(t => t.userId === user?.id);

  const handlePay = (e: React.FormEvent) => {
      e.preventDefault();
      const val = parseFloat(payAmount);
      if (val > 0) {
          payDues(val, payMethod);
          setPayAmount('');
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       <div className="lg:col-span-2 space-y-6">
          <header>
             <h2 className="text-2xl font-bold text-slate-800">Transaction History</h2>
             <p className="text-slate-500">Record of all payments and purchases.</p>
          </header>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             {relevantTransactions.length === 0 ? (
                 <div className="p-8 text-center text-slate-400">No transactions recorded.</div>
             ) : (
                 <div className="divide-y divide-slate-100">
                     {relevantTransactions.map(tx => (
                         <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                             <div className="flex items-center gap-4">
                                 <div className={`p-2 rounded-full ${tx.type === TransactionType.CREDIT ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                     {tx.type === TransactionType.CREDIT ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                 </div>
                                 <div>
                                     <div className="flex items-center gap-2">
                                       <p className="font-medium text-slate-800">{tx.description}</p>
                                       {tx.paymentMethod && tx.paymentMethod !== 'N/A' && (
                                          <span className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                                            tx.paymentMethod === PaymentMethod.CASH 
                                              ? 'bg-slate-50 border-slate-200 text-slate-500' 
                                              : 'bg-blue-50 border-blue-100 text-blue-500'
                                          }`}>
                                            {tx.paymentMethod === PaymentMethod.CASH ? <Banknote size={10} /> : <Smartphone size={10} />}
                                            {tx.paymentMethod === PaymentMethod.CASH ? 'Cash' : 'Online'}
                                          </span>
                                       )}
                                     </div>
                                     <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString()}</p>
                                 </div>
                             </div>
                             <div className={`font-bold ${tx.type === TransactionType.CREDIT ? 'text-emerald-600' : 'text-slate-800'}`}>
                                 {tx.type === TransactionType.CREDIT ? '+' : '-'}₹{tx.amount.toFixed(2)}
                             </div>
                         </div>
                     ))}
                 </div>
             )}
          </div>
       </div>

       {/* Sidebar for Dues Payment (Customer Only) */}
       {user?.role === UserRole.CUSTOMER && (
           <div className="space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
                   <p className="text-slate-500 font-medium mb-1">Total Pending Dues</p>
                   <h3 className="text-4xl font-bold text-slate-800 mb-6">₹{user.pendingDues.toFixed(2)}</h3>
                   
                   <form onSubmit={handlePay} className="space-y-4">
                       <div>
                           <label className="block text-left text-xs font-bold text-slate-500 mb-1">Make a Payment</label>
                           <div className="relative">
                               <span className="absolute left-3 top-2 text-slate-400">₹</span>
                               <input 
                                 type="number" 
                                 step="0.01"
                                 required
                                 className="w-full pl-7 pr-4 py-2 border rounded-lg"
                                 placeholder="0.00"
                                 value={payAmount}
                                 onChange={e => setPayAmount(e.target.value)}
                               />
                           </div>
                       </div>
                       
                       <div>
                         <label className="block text-left text-xs font-bold text-slate-500 mb-2">Payment Method</label>
                         <div className="flex gap-2">
                           <button
                             type="button"
                             onClick={() => setPayMethod(PaymentMethod.CASH)}
                             className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-semibold transition-all ${
                               payMethod === PaymentMethod.CASH 
                                 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                                 : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                             }`}
                           >
                             <Banknote size={16} />
                             Cash
                           </button>
                           <button
                             type="button"
                             onClick={() => setPayMethod(PaymentMethod.ONLINE)}
                             className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-semibold transition-all ${
                               payMethod === PaymentMethod.ONLINE 
                                 ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                 : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                             }`}
                           >
                             <Smartphone size={16} />
                             Online
                           </button>
                         </div>
                       </div>

                       <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
                           Pay Now
                       </button>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};

export default History;