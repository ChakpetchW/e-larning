import React from 'react';
import { ChevronRight } from 'lucide-react';

const SectionHeader = ({ 
  title, 
  onViewAll, 
  viewAllText = "ดูทั้งหมด", 
  className = "",
  showViewAll = true
}) => {
  return (
    <div className={`flex justify-between items-end mb-6 pl-2 ${className}`}>
      <h3 className="text-2xl md:text-[1.75rem] font-black text-slate-900 tracking-tight">{title}</h3>
      {showViewAll && onViewAll && (
        <button 
          onClick={onViewAll} 
          className="text-primary text-[11px] md:text-sm font-bold flex items-center gap-1 hover:text-primary-hover px-4 py-2 bg-primary/5 hover:bg-primary/10 rounded-full active:scale-95 transition-all"
        >
          {viewAllText} <ChevronRight size={14} strokeWidth={3} className="md:w-4 md:h-4" />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
