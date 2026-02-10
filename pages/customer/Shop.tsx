import React from 'react';
import { useApp } from '../../context/AppContext';
import { Plus } from 'lucide-react';

const Shop = () => {
  const { products, addToCart } = useApp();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Shop Groceries</h2>
        <p className="text-slate-500">Fresh quality products for your daily needs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-slate-100 relative">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-semibold text-slate-700 shadow-sm">
                {product.category}
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 line-clamp-1">{product.name}</h3>
                <span className="font-bold text-emerald-600">₹{product.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-500 mb-4 h-10 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                 <span className="text-xs text-slate-400">per {product.unit}</span>
                 <button 
                  onClick={() => addToCart(product)}
                  className="bg-emerald-50 text-emerald-700 p-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
                 >
                   <Plus size={20} />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;