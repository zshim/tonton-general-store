import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { generateProductDescription } from '../../services/geminiService';
import { Plus, Wand2, Package, Search, Upload, Image as ImageIcon, X, Camera, Tag, Calculator, Percent, ChevronDown } from 'lucide-react';

const Inventory = () => {
  const { products, addProduct, applyDiscount } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Discount Modal State
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountProduct, setDiscountProduct] = useState<Product | null>(null);
  const [newDiscountPrice, setNewDiscountPrice] = useState<string>('');
  
  // Refs & State for Image Handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  // Form State
  const [newItem, setNewItem] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    originalPrice: 0, // Used as MRP
    stock: 0,
    unit: 'pc',
    description: '',
    imageUrl: ''
  });

  // Specific state for the pricing calculator in the form
  const [priceForm, setPriceForm] = useState({
    mrp: '',
    discountPercent: '',
    sellingPrice: ''
  });

  const [generatingDesc, setGeneratingDesc] = useState(false);

  // 1. Get Unique Categories for Filter Tabs (Only those that exist in products)
  const categories = useMemo(() => {
    const uniqueCats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(uniqueCats).sort()];
  }, [products]);

  // 2. Extensive Predefined Categories for "Add Product" + Custom ones
  const PREDEFINED_CATEGORIES = [
    "Fruits", "Vegetables", "Dairy & Milk", "Bakery", "Eggs & Meat", 
    "Grains & Rice", "Spices & Masalas", "Oil & Ghee", "Snacks & Chips", 
    "Beverages", "Instant Food", "Household", "Personal Care", 
    "Baby Care", "Pet Food", "Frozen Food", "Health & Wellness"
  ];

  const formCategories = useMemo(() => {
    const uniqueCats = new Set([...PREDEFINED_CATEGORIES, ...products.map(p => p.category)]);
    return Array.from(uniqueCats).sort();
  }, [products]);

  // 3. Filter and Sort Products Alphabetically
  const displayedProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical Sort
  }, [products, selectedCategory, searchTerm]);

  // Camera Stream Management
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access camera. Please check permissions.");
        setIsCameraOpen(false);
      }
    };

    if (isCameraOpen) {
      startStream();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen]);

  // Pricing Calculation Logic
  const handlePriceChange = (field: 'mrp' | 'discount' | 'selling', value: string) => {
    let mrp = parseFloat(field === 'mrp' ? value : priceForm.mrp) || 0;
    let discount = parseFloat(field === 'discount' ? value : priceForm.discountPercent) || 0;
    let selling = parseFloat(field === 'selling' ? value : priceForm.sellingPrice) || 0;

    if (field === 'mrp') {
      // If MRP changes, recalculate selling price based on existing discount
      selling = mrp - (mrp * (discount / 100));
      setPriceForm({ mrp: value, discountPercent: priceForm.discountPercent, sellingPrice: selling.toFixed(2) });
    } else if (field === 'discount') {
      // If Discount changes, recalculate selling price
      if (value === '' || parseFloat(value) < 0) discount = 0;
      if (parseFloat(value) > 100) discount = 100;
      selling = mrp - (mrp * (discount / 100));
      setPriceForm({ mrp: priceForm.mrp, discountPercent: value, sellingPrice: selling.toFixed(2) });
    } else if (field === 'selling') {
      // If Selling Price changes, recalculate discount percentage
      if (mrp > 0) {
        discount = ((mrp - selling) / mrp) * 100;
        setPriceForm({ mrp: priceForm.mrp, discountPercent: discount.toFixed(1), sellingPrice: value });
      } else {
        setPriceForm({ ...priceForm, sellingPrice: value });
      }
    }
  };

  const handleGenerateDesc = async () => {
    if (!newItem.name) return;
    setGeneratingDesc(true);
    const desc = await generateProductDescription(newItem.name || '', newItem.category || '');
    setNewItem(prev => ({ ...prev, description: desc }));
    setGeneratingDesc(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setNewItem(prev => ({ ...prev, imageUrl: dataUrl }));
        setIsCameraOpen(false);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCameraOpen(false);
    setPriceForm({ mrp: '', discountPercent: '', sellingPrice: '' });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name && priceForm.sellingPrice) {
      const finalCategory = newItem.category?.trim() || 'General';
      addProduct({
        id: `p${Date.now()}`,
        name: newItem.name,
        category: finalCategory,
        price: parseFloat(priceForm.sellingPrice),
        originalPrice: parseFloat(priceForm.mrp) || parseFloat(priceForm.sellingPrice), // Store MRP as originalPrice
        stock: Number(newItem.stock),
        unit: newItem.unit!,
        description: newItem.description,
        imageUrl: newItem.imageUrl || `https://picsum.photos/200/200?random=${Date.now()}`
      });
      closeModal();
      setNewItem({ name: '', category: '', price: 0, originalPrice: 0, stock: 0, unit: 'pc', description: '', imageUrl: '' });
      setPriceForm({ mrp: '', discountPercent: '', sellingPrice: '' });
    }
  };

  // Discount Modal Logic (Existing feature)
  const openDiscountModal = (product: Product) => {
    setDiscountProduct(product);
    setNewDiscountPrice(product.price.toString());
    setIsDiscountModalOpen(true);
  };

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (discountProduct && newDiscountPrice) {
      applyDiscount(discountProduct.id, parseFloat(newDiscountPrice));
      setIsDiscountModalOpen(false);
      setDiscountProduct(null);
      alert(`Discount applied to ${discountProduct.name}. Customers have been notified.`);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
          <p className="text-slate-500">Track stock and add new products.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-48"
              />
           </div>
           <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              selectedCategory === cat 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-emerald-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 font-semibold text-slate-600 text-sm">Product</th>
              <th className="p-4 font-semibold text-slate-600 text-sm">Category</th>
              <th className="p-4 font-semibold text-slate-600 text-sm text-right">Price</th>
              <th className="p-4 font-semibold text-slate-600 text-sm text-right">Stock</th>
              <th className="p-4 font-semibold text-slate-600 text-sm">Unit</th>
              <th className="p-4 font-semibold text-slate-600 text-sm text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedProducts.length === 0 ? (
               <tr>
                 <td colSpan={6} className="p-8 text-center text-slate-400">
                    No products found in this category.
                 </td>
               </tr>
            ) : (
              displayedProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{product.name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-xs">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-800 font-medium text-right">
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <div>
                        <span className="text-xs line-through text-slate-400 mr-2">₹{product.originalPrice.toFixed(2)}</span>
                        <span className="text-emerald-600">₹{product.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      `₹${product.price.toFixed(2)}`
                    )}
                  </td>
                  <td className={`p-4 text-sm text-right font-medium ${product.stock < 20 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {product.stock}
                  </td>
                  <td className="p-4 text-sm text-slate-500">{product.unit}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => openDiscountModal(product)}
                      className="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors"
                      title="Apply Discount"
                    >
                      <Tag size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add New Product</h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                  <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                  <div className="relative">
                    <input 
                      required 
                      type="text" 
                      list="categoryOptions"
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                      value={newItem.category} 
                      onChange={e => setNewItem({...newItem, category: e.target.value})}
                      placeholder="Select or type..." 
                    />
                    <datalist id="categoryOptions">
                       {formCategories.map(cat => (
                         <option key={cat} value={cat} />
                       ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Pricing Section with Auto-Calculation */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                      <Calculator size={14} /> Pricing & Discounts
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                      <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">MRP (₹)</label>
                          <input 
                            required 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00"
                            className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                            value={priceForm.mrp}
                            onChange={e => handlePriceChange('mrp', e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Discount (%)</label>
                          <div className="relative">
                            <input 
                                type="number" 
                                step="0.1" 
                                placeholder="0"
                                className="w-full border p-2 pr-6 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                                value={priceForm.discountPercent}
                                onChange={e => handlePriceChange('discount', e.target.value)}
                            />
                            <Percent size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                          </div>
                      </div>
                      <div>
                          <label className="block text-[10px] font-semibold text-emerald-600 mb-1">Selling Price (₹)</label>
                          <input 
                            required 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00"
                            className="w-full border-2 border-emerald-100 p-2 rounded text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none bg-white" 
                            value={priceForm.sellingPrice}
                            onChange={e => handlePriceChange('selling', e.target.value)}
                          />
                      </div>
                  </div>
                  {parseFloat(priceForm.mrp) > parseFloat(priceForm.sellingPrice) && (
                      <div className="mt-2 text-right">
                          <span className="text-xs text-slate-500">Price Saving: </span>
                          <span className="text-xs font-bold text-emerald-600">
                              ₹{(parseFloat(priceForm.mrp) - parseFloat(priceForm.sellingPrice)).toFixed(2)}
                          </span>
                      </div>
                  )}
              </div>
              
              {/* Image Upload Section */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Product Image</label>
                
                {isCameraOpen ? (
                    <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video mb-2 shadow-inner">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                            <button 
                                type="button" 
                                onClick={() => setIsCameraOpen(false)} 
                                className="bg-red-500/80 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-red-600 backdrop-blur-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                onClick={capturePhoto} 
                                className="bg-white text-emerald-600 px-6 py-2 rounded-full text-xs font-bold hover:bg-slate-100 shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <Camera size={14} /> Capture
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start gap-4">
                        <div className="h-24 w-24 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative shrink-0">
                            {newItem.imageUrl ? (
                            <>
                                <img src={newItem.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                <button 
                                type="button"
                                onClick={() => setNewItem({...newItem, imageUrl: ''})}
                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl shadow-sm hover:bg-red-600 transition-colors"
                                >
                                <X size={14} />
                                </button>
                            </>
                            ) : (
                            <ImageIcon className="text-slate-300 h-8 w-8" />
                            )}
                        </div>
                        
                        <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    <Upload size={14} />
                                    Upload File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCameraOpen(true)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    <Camera size={14} />
                                    Take Photo
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Or paste image URL..." 
                                    className="w-full border p-2 pl-3 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={newItem.imageUrl || ''}
                                    onChange={(e) => setNewItem({...newItem, imageUrl: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Stock</label>
                  <input required type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={newItem.stock} onChange={e => setNewItem({...newItem, stock: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Unit</label>
                  <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                <div className="flex gap-2">
                  <textarea className="w-full border p-2 rounded text-sm h-20 focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                  <button 
                    type="button"
                    onClick={handleGenerateDesc}
                    disabled={generatingDesc || !newItem.name}
                    className="bg-purple-50 text-purple-700 p-2 rounded flex flex-col items-center justify-center w-20 text-xs font-medium hover:bg-purple-100 disabled:opacity-50 border border-purple-200"
                  >
                    <Wand2 size={16} className="mb-1" />
                    {generatingDesc ? '...' : 'AI Write'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 shadow-sm">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discount Modal (For applying discount to existing items) */}
      {isDiscountModalOpen && discountProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Tag className="text-amber-500" /> Apply Discount
              </h3>
              <button onClick={() => setIsDiscountModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleApplyDiscount}>
               <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-1">Product: <span className="font-semibold">{discountProduct.name}</span></p>
                  <p className="text-sm text-slate-600 mb-4">Current Price: <span className="font-semibold">₹{(discountProduct.originalPrice || discountProduct.price).toFixed(2)}</span></p>
                  
                  <label className="block text-xs font-bold text-slate-500 mb-2">New Sale Price (₹)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    className="w-full border p-3 rounded-lg text-lg font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={newDiscountPrice} 
                    onChange={e => setNewDiscountPrice(e.target.value)} 
                    placeholder="0.00"
                  />
               </div>
               
               <p className="text-xs text-slate-400 mb-4">
                 Setting this price will automatically send a promotional notification to all customers.
               </p>

               <div className="flex justify-end gap-3">
                 <button type="button" onClick={() => setIsDiscountModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm hover:bg-slate-100 rounded-lg">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 shadow-sm">
                   Apply Offer
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;