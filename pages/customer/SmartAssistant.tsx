import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { suggestRecipes } from '../../services/geminiService';
import { ChefHat, Sparkles } from 'lucide-react';

const SmartAssistant = () => {
  const { orders } = useApp();
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  // Get items from the last order to simulate "current pantry"
  const lastOrderItems = orders.length > 0 ? orders[0].items : [];

  const handleGetRecipes = async () => {
    setLoading(true);
    const result = await suggestRecipes(lastOrderItems);
    setSuggestion(result);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-8 rounded-2xl mb-8">
        <ChefHat className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Smart Chef Assistant</h2>
        <p className="text-slate-600 mb-6">
          Not sure what to cook? Let our AI suggest recipes based on your recent purchases!
        </p>

        {lastOrderItems.length > 0 ? (
          <div className="bg-white/50 p-4 rounded-lg mb-6 text-sm text-slate-600">
            <strong>Based on:</strong> {lastOrderItems.map(i => i.name).join(', ')}
          </div>
        ) : (
          <p className="text-amber-600 text-sm mb-6">No recent purchases found. Place an order first!</p>
        )}

        <button
          onClick={handleGetRecipes}
          disabled={loading || lastOrderItems.length === 0}
          className="bg-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
             <span className="animate-pulse">Thinking...</span>
          ) : (
             <>
               <Sparkles size={18} />
               Suggest Recipes
             </>
          )}
        </button>
      </div>

      {suggestion && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-left animate-fade-in">
           <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Chef's Recommendations</h3>
           <div 
             className="prose prose-emerald prose-sm max-w-none text-slate-700"
             dangerouslySetInnerHTML={{ __html: suggestion.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} 
           />
        </div>
      )}
    </div>
  );
};

export default SmartAssistant;