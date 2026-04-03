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
    <div className={`relative ${className}`}>
      {/* Right fade edge for pure tab design */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#f8fafc] to-transparent pointer-events-none z-10"></div>
      
      <div className="flex gap-6 overflow-x-auto pb-1 no-scrollbar border-b border-gray-200/60 items-center">
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => onSelect(cat.name)}
            className={`shrink-0 whitespace-nowrap pb-3 text-sm font-bold transition-all relative ${
              activeCat === cat.name 
                ? 'text-slate-900' 
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {cat.name}
            {activeCat === cat.name && (
              <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-slate-900 rounded-t-full"></span>
            )}
          </button>
        ))}
        
        {showViewAll && (
          <button 
            onClick={onViewAll}
            className="shrink-0 pb-3 text-sm font-bold text-primary hover:text-primary-dark transition-all whitespace-nowrap flex items-center gap-1.5 ml-2"
          >
            <Grid size={14} /> ดูทั้งหมด
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryPills;
