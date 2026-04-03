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
      <h3 className="text-2xl md:text-[1.75rem] font-black text-slate-900 tracking-tight">{title}</h3>
      {showViewAll && onViewAll && (
        <button 
          onClick={onViewAll} 
          className="flex items-center gap-1 rounded-full bg-primary/5 px-4 py-2 text-[11px] font-bold text-primary transition-all hover:bg-primary/10 hover:text-primary-hover active:scale-95 md:text-sm"
        >
          {viewAllText} <ChevronRight size={14} strokeWidth={3} className="md:w-4 md:h-4" />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
