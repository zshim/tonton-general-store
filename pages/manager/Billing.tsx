import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, User as UserIcon, Plus, Trash2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { Product, CartItem, PaymentMethod } from '../../types';
import { TAX_RATE } from '../../constants';
import { BillCalculator, DuesCalculator } from '../../components/Calculators';

const Billing = () => {
  const { products, users, placeOrder } = useApp();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [billCart, setBillCart] = useState<CartItem[]>([]);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  // Derived state
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const subtotal = billCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const addToBill = (product: Product) => {
    setBillCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
            return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromBill = (id: string) => {
    setBillCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCreateOrder = () => {
      if (!selectedUser || billCart.length === 0) return;
      placeOrder(parseFloat(amountPaid || '0'), paymentMethod, selectedUser);
      setBillCart([]);
      setAmountPaid('');
      setSelectedUser('');
      setPaymentMethod(PaymentMethod.CASH);
      alert("Order created successfully!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Product Selection */}
      <div className="lg:col-span-2 flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
             <input 
               type="text" 
               placeholder="Search products..." 
               className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-emerald-500"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
                <button 
                  key={product.id} 
                  onClick={() => addToBill(product)}
                  className="bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 p-3 rounded-xl text-left transition-all flex flex-col h-32 justify-between group"
                >
                    <div>
                        <p className="font-semibold text-slate-700 text-sm line-clamp-2">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.unit}</p>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="font-bold text-emerald-600">₹{product.price.toFixed(2)}</span>
                        <div className="bg-white p-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={16} className="text-emerald-600" />
                        </div>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Bill Details */}
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CreditCard size={20} />
                Current Bill
            </h3>
         </div>
         
         <div className="p-4 border-b border-slate-100">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Select Customer</label>
            <select 
               className="w-full p-2 border rounded-lg text-sm bg-slate-50"
               value={selectedUser}
               onChange={e => setSelectedUser(e.target.value)}
            >
                <option value="">-- Choose Customer --</option>
                {users.filter(u => u.role === 'CUSTOMER').map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
            </select>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {billCart.length === 0 ? (
                 <div className="text-center text-slate-400 py-8 text-sm">
                     No items added
                 </div>
             ) : (
                 billCart.map(item => (
                     <div key={item.id} className="flex justify-between items-center text-sm">
                         <div className="flex-1">
                             <p className="font-medium text-slate-700">{item.name}</p>
                             <p className="text-xs text-slate-500">{item.quantity} x ₹{item.price.toFixed(2)}</p>
                         </div>
                         <div className="flex items-center gap-3">
                             <span className="font-semibold">₹{(item.quantity * item.price).toFixed(2)}</span>
                             <button onClick={() => removeFromBill(item.id)} className="text-slate-400 hover:text-red-500">
                                 <Trash2 size={16} />
                             </button>
                         </div>
                     </div>
                 ))
             )}
         </div>

         <div className="p-4 bg-slate-50 border-t border-slate-100">
             <BillCalculator subtotal={subtotal} />
             
             <div className="my-4">
                 <label className="block text-xs font-semibold text-slate-500 mb-1">Amount Paid</label>
                 <input 
                   type="number" 
                   className="w-full p-2 border rounded text-sm outline-none focus:border-emerald-500 transition-colors" 
                   placeholder="0.00"
                   value={amountPaid}
                   onChange={e => setAmountPaid(e.target.value)}
                 />
                 
                 {/* Payment Method Selector */}
                 {parseFloat(amountPaid) > 0 && (
                   <div className="mt-3">
                     <label className="block text-xs font-semibold text-slate-500 mb-2">Payment Method</label>
                     <div className="flex gap-2">
                       <button
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

                 {/* Live Dues Calculation Preview */}
                 <DuesCalculator 
                    totalAmount={total} 
                    amountPaid={parseFloat(amountPaid || '0')} 
                    className="mt-3 text-xs" 
                 />
             </div>

             <button 
               onClick={handleCreateOrder}
               disabled={!selectedUser || billCart.length === 0}
               className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
             >
                 Generate Invoice
             </button>
         </div>
      </div>
    </div>
  );
};

export default Billing;