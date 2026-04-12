import React from 'react';
import { ArrowRight } from 'lucide-react';

const PointsCard = ({ points, onNavigate }) => {
  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-[1.75rem] bg-gradient-primary p-6 text-white shadow-[0_28px_60px_-28px_rgba(67,56,202,0.6)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.12),_transparent_30%)]"></div>
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent"></div>
      
      <div className="relative z-10 w-full">
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            <span className="text-xs font-bold tracking-[0.04em] text-white">แต้มของคุณ</span>
          </div>
          <button 
            type="button"
            onClick={() => onNavigate('/user/points-history')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ArrowRight size={16} className="text-white" />
          </button>
        </div>
        
        <div className="mt-6 flex flex-col items-center md:items-start md:flex-row md:justify-between md:items-end">
          <div>
            <h2 className="flex items-baseline gap-2 text-5xl font-black tracking-tight text-white tabular-nums drop-shadow-sm">
              {points.toLocaleString()} <span className="text-xl font-bold opacity-80">แต้ม</span>
            </h2>
          </div>
          <p className="mt-4 rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm md:mt-0">
            หมดอายุ 31 ธ.ค. 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default PointsCard;
