import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Filter, Banknote, Smartphone } from 'lucide-react';
import { PaymentMethod } from '../../types';

const Orders = () => {
  const { orders } = useApp();

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Order Management</h2>
            <p className="text-slate-500">Track and manage all customer orders.</p>
         </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <Filter size={18} />
            Filter Status
         </button>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Order ID</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Total</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Paid</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {orders.map(order => (
                 <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-700">#{order.id}</td>
                    <td className="p-4 text-slate-600">{order.customerName}</td>
                    <td className="p-4 text-slate-500 text-sm">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="p-4 text-right font-medium text-slate-800">₹{order.total.toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-600">₹{order.amountPaid.toFixed(2)}</td>
                    <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'PARTIAL' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                            {order.status}
                        </span>
                    </td>
                    <td className="p-4 text-center">
                      {order.paymentMethod && order.paymentMethod !== 'N/A' && (
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
                          order.paymentMethod === PaymentMethod.CASH 
                            ? 'bg-slate-50 border-slate-200 text-slate-600'
                            : 'bg-blue-50 border-blue-100 text-blue-600'
                        }`}>
                          {order.paymentMethod === PaymentMethod.CASH ? <Banknote size={12} /> : <Smartphone size={12} />}
                          {order.paymentMethod === PaymentMethod.CASH ? 'Cash' : 'Online'}
                        </div>
                      )}
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
          {orders.length === 0 && (
             <div className="p-12 text-center text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                No orders found.
             </div>
          )}
       </div>
    </div>
  );
};

export default Orders;