import React from 'react';
import { Filter, X } from 'lucide-react';

const FilterSidebar = ({ 
  isOpen, 
  onClose, 
  sortBy, 
  setSortBy, 
  categories, 
  activeCat, 
  setActiveCat,
  onReset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/30 backdrop-blur-sm animate-fade-in">
      {/* Click away area */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Slide Panel */}
      <div className="w-full max-w-sm bg-white h-full shadow-2xl relative flex flex-col animate-slide-in-right transform">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Filter size={20} className="text-primary"/> ตัวกรองขั้นสูง
          </h3>
          <button onClick={onClose} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          {/* Sort Section */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">การจัดเรียง (Sort By)</h4>
            {[
              { label: 'เพิ่มล่าสุด (Newest)', value: 'newest' },
              { label: 'เก่าที่สุด (Oldest)', value: 'oldest' },
              { label: 'เรียงตามพยัญชนะ (A-Z)', value: 'a-z' },
              { label: 'คะแนนสูงสุด (Max Points)', value: 'points_desc' }
            ].map((option) => (
              <label key={option.value} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="font-bold text-gray-700">{option.label}</span>
                <input 
                  type="radio" 
                  name="sort" 
                  checked={sortBy === option.value} 
                  onChange={() => setSortBy(option.value)} 
                  className="w-4 h-4 text-primary accent-primary" 
                />
              </label>
            ))}
          </div>

          {/* Category Section in Modal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">หมวดหมู่ (Category)</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCat(cat.name)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    activeCat === cat.name 
                      ? 'bg-primary/10 text-primary border-primary/30' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button 
            onClick={onReset}
            className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            ล้างค่า
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:bg-primary-hover transition-all"
          >
            ดูผลลัพธ์
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
