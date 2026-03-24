import React from 'react';
import { Grid } from 'lucide-react';

const CategoryPills = ({ 
  categories, 
  activeCat, 
  onSelect, 
  onViewAll, 
  showViewAll = true,
  className = "" 
}) => {
  return (
    <div className={`flex gap-2.5 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 items-center ${className}`}>
      {categories.map(cat => (
        <button 
          key={cat.id}
          onClick={() => onSelect(cat.name)}
          className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all min-w-[100px] shadow-sm ${
            activeCat === cat.name 
              ? 'bg-primary text-white shadow-primary/30' 
              : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-gray-100'
          }`}
        >
          {cat.name}
        </button>
      ))}
      
      {showViewAll && (
        <button 
          onClick={onViewAll}
          className="shrink-0 px-6 py-2.5 bg-primary/5 text-primary border border-primary/20 rounded-full font-black text-sm uppercase tracking-widest hover:bg-primary/10 active:scale-95 transition-all shadow-sm whitespace-nowrap flex items-center gap-2 ml-2"
        >
          <Grid size={14} /> ดูทั้งหมด
        </button>
      )}
    </div>
  );
};

export default CategoryPills;
