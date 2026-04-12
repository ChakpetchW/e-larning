import React from 'react';
import { Gift, ArrowRight } from 'lucide-react';

const HomeRewards = ({ onNavigate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
      <button
        type="button"
        onClick={() => onNavigate('/user/rewards')}
        className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-slate-800 p-8 text-left transition-all hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1"
      >
        <div className="flex justify-between items-start mb-10">
          <div className="relative z-10">
            <div className="bg-white/10 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 inline-block backdrop-blur-sm">
              Exclusive Rewards
            </div>
            <h4 className="text-2xl font-bold text-white mb-2 tracking-tight">เลือกแลกรางวัลพิเศษ</h4>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[240px]">
              ใช้แต้มสะสมของคุณเพื่อแลกรับรางวัลและส่วนลดพิเศษสำหรับคุณโดยเฉพาะ
            </p>
          </div>
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-white backdrop-blur-sm group-hover:rotate-12 transition-transform duration-500">
            <Gift size={32} className="text-warning/80" />
          </div>
        </div>
        
        <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest group-hover:gap-4 transition-all">
          ไปยังคลังของรางวัล <ArrowRight size={16} />
        </div>

        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 transition-colors"></div>
      </button>
    </div>
  );
};

export default HomeRewards;
