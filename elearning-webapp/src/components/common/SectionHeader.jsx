import React from 'react';
import { ChevronRight } from 'lucide-react';

const SectionHeader = ({
  title,
  onViewAll,
  viewAllText = 'ดูทั้งหมด',
  badgeText = '',
  className = '',
  showViewAll = true,
}) => {
  return (
    <div className={`mb-7 flex items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0 flex-1">
        <span className="mb-3 block h-1.5 w-14 rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#f59e0b_45%,#e2e8f0_100%)]" />
        <div className="flex items-center gap-4">
          <h3 className="min-w-0 text-xl font-black tracking-tight text-slate-900 md:text-[1.55rem]">
            {title}
          </h3>
          {badgeText && (
            <span className="inline-flex shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
              {badgeText}
            </span>
          )}
          <span className="hidden h-px flex-1 bg-gradient-to-r from-slate-200 via-slate-100 to-transparent md:block" />
        </div>
      </div>

      {showViewAll && onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 active:scale-95 md:px-5 md:text-sm"
        >
          {viewAllText}
          <ChevronRight size={15} strokeWidth={2.5} className="shrink-0" />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
