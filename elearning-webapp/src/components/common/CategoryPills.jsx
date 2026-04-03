import React from 'react';
import { Grid } from 'lucide-react';

const CategoryPills = ({
  categories,
  activeCat,
  onSelect,
  onViewAll,
  showViewAll = true,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-10 bg-gradient-to-l from-[#f8fafc] to-transparent md:w-8" />

      <div className="flex items-center gap-3 overflow-x-auto px-5 py-2 no-scrollbar md:gap-6 md:px-0 md:pb-1 md:pt-0 md:border-b md:border-gray-200/60">
        {categories.map((category) => {
          const isActive = activeCat === category.name;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.name)}
              className={`relative shrink-0 whitespace-nowrap rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-200 md:rounded-none md:border-transparent md:px-0 md:py-0 md:pb-3 md:text-[15px] ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm md:bg-transparent md:text-slate-900 md:shadow-none'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800 md:bg-transparent md:text-slate-400 md:hover:border-transparent md:hover:text-slate-700'
              }`}
            >
              {category.name}
              {isActive && (
                <span className="absolute bottom-[-1px] left-0 hidden h-[3px] w-full rounded-t-full bg-slate-900 md:block" />
              )}
            </button>
          );
        })}

        {showViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="ml-1 flex min-h-[46px] shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/10 md:ml-2 md:min-h-0 md:rounded-none md:border-transparent md:bg-transparent md:px-0 md:py-0 md:pb-3 md:text-[15px]"
          >
            <Grid size={16} />
            ดูทั้งหมด
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryPills;
