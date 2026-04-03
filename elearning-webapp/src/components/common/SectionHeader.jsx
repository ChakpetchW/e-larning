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
    <div className={`mb-6 flex items-end justify-between pl-2 ${className}`}>
      <h3 className="text-xl md:text-[1.5rem] font-bold text-slate-800 tracking-tight">{title}</h3>
      {showViewAll && onViewAll && (
        <button 
          onClick={onViewAll} 
          className="flex items-center gap-1 rounded-full bg-slate-100 px-4 py-2 text-[11px] font-semibold text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-800 active:scale-95 md:text-sm"
        >
          {viewAllText} <ChevronRight size={14} strokeWidth={2.5} className="md:w-4 md:h-4" />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
