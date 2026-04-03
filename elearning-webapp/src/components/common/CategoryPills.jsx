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
    <div className={`relative fade-right-edge ${className}`}>
      <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 items-center">
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => onSelect(cat.name)}
            className={`shrink-0 whitespace-nowrap px-5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all md:min-w-[90px] ${
              activeCat === cat.name 
                ? 'bg-slate-900 text-white shadow-md shadow-slate-200 ring-1 ring-slate-900' 
                : 'bg-white text-slate-500 hover:text-primary border border-slate-200 shadow-sm hover:border-primary/50'
            }`}
          >
            {cat.name}
          </button>
        ))}
        
        {showViewAll && (
          <button 
            onClick={onViewAll}
            className="shrink-0 px-5 py-2 bg-primary/5 text-primary border border-primary/20 rounded-xl font-bold text-xs md:text-sm hover:bg-primary/10 transition-all shadow-sm whitespace-nowrap flex items-center gap-1.5 md:ml-1 pr-8 md:pr-5"
          >
            <Grid size={14} /> ดูทั้งหมด
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryPills;
