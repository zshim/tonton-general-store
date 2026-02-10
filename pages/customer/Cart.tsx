import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trash2, Minus, Plus, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { TAX_RATE } from '../../constants';
import { BillCalculator } from '../../components/Calculators';
import { PaymentMethod } from '../../types';

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity, placeOrder } = useApp();
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.ONLINE);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const paid = parseFloat(paymentAmount || '0');
    placeOrder(paid, paymentMethod);
    setIsCheckingOut(false);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <CreditCard className="h-16 w-16 mb-4 opacity-20" />
        <h3 className="text-xl font-semibold">Your cart is empty</h3>
        <p>Go back to the shop to add some fresh goodies!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Shopping Cart</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                 <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded object-cover bg-slate-100" />
                 <div>
                   <h4 className="font-semibold text-slate-800">{item.name}</h4>
                   <p className="text-emerald-600 font-medium">₹{item.price.toFixed(2)} <span className="text-slate-400 text-xs">/ {item.unit}</span></p>
                 </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 bg-slate-50 rounded-lg p-1">
                  <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm"><Minus size={14} /></button>
                  <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm"><Plus size={14} /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
           <h3 className="font-bold text-slate-800 mb-4 text-lg">Order Summary</h3>
           
           <BillCalculator subtotal={subtotal} />

           <div className="mt-6">
             {!isCheckingOut ? (
               <button 
                onClick={() => setIsCheckingOut(true)}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
               >
                 Proceed to Checkout
               </button>
             ) : (
               <form onSubmit={handleCheckout} className="space-y-4 bg-slate-50 p-4 rounded-lg animate-fade-in">
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Enter Payment Amount</label>
                   <div className="relative">
                     <span className="absolute left-3 top-2 text-slate-400">₹</span>
                     <input 
                      type="number" 
                      step="0.01" 
                      required
                      min="0"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full pl-6 pr-2 py-2 border rounded text-sm outline-none focus:border-emerald-500 transition-colors"
                      placeholder="0.00"
                     />
                   </div>
                   <p className="text-xs text-slate-400 mt-1">
                     {parseFloat(paymentAmount || '0') < total 
                      ? "Partial payment will be added to Pending Dues." 
                      : "Fully paid."}
                   </p>
                 </div>

                 {parseFloat(paymentAmount || '0') > 0 && (
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 mb-2">Payment Method</label>
                     <div className="flex gap-2">
                       <button
                         type="button"
                         onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                         className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-semibold transition-all ${
                           paymentMethod === PaymentMethod.CASH 
                             ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                             : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                         }`}
                       >
                         <Banknote size={16} />
                         Cash
                       </button>
                       <button
                         type="button"
                         onClick={() => setPaymentMethod(PaymentMethod.ONLINE)}
                         className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-semibold transition-all ${
                           paymentMethod === PaymentMethod.ONLINE 
                             ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                             : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                         }`}
                       >
                         <Smartphone size={16} />
                         Online
                       </button>
                     </div>
                   </div>
                 )}

                 <div className="flex gap-2 pt-2">
                   <button type="button" onClick={() => setIsCheckingOut(false)} className="flex-1 py-2 text-slate-500 text-sm hover:bg-slate-200 rounded">Cancel</button>
                   <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white text-sm font-bold rounded hover:bg-emerald-700">Confirm</button>
                 </div>
               </form>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;