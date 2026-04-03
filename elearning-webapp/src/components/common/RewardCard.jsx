import React from 'react';
import { Gift, Zap, Ticket, Coffee } from 'lucide-react';
import { getFullUrl } from '../../utils/api';

const iconMap = {
  coffee: <Coffee className="text-green-600" size={32} strokeWidth={1.5}/>,
  ticket: <Ticket className="text-red-600" size={32} strokeWidth={1.5}/>,
  food: <Zap className="text-green-500" size={32} strokeWidth={1.5}/>,
  voucher: <Gift className="text-orange-500" size={32} strokeWidth={1.5}/>,
  default: <Gift className="text-primary" size={32} strokeWidth={1.5}/>
};

const bgMap = {
  coffee: 'bg-green-50',
  ticket: 'bg-red-50',
  food: 'bg-green-50',
  voucher: 'bg-orange-50',
  default: 'bg-indigo-50'
};

const RewardCard = ({ reward, points, onRedeem, redeeming }) => {
  const isLimitReached = reward.userRedeemedCount >= reward.maxPerUser;
  const isOutOfStock = reward.stock === 0;
  const isDisabled = isLimitReached || isOutOfStock || points < reward.pointsCost || redeeming;

  return (
    <div className={`card relative flex h-full flex-col overflow-hidden border-slate-100 bg-white group ${(isOutOfStock || isLimitReached) ? 'opacity-70 grayscale-[0.8]' : ''}`}>
      <div className={`${reward.image?.includes('/') ? 'bg-white border-b border-slate-100' : bgMap[reward.image] || bgMap.default} relative flex h-28 items-center justify-center overflow-hidden p-2 transition-colors duration-300 group-hover:bg-opacity-80`}>
        <div className="absolute top-0 right-0 h-16 w-16 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-xl"></div>
        <div className="flex h-full w-full transform items-center justify-center transition-transform duration-300 group-hover:scale-105">
          {reward.image?.includes('/') ? (
            <img src={getFullUrl(reward.image)} alt={reward.name} className="w-full h-full object-contain mix-blend-multiply" />
          ) : (
            iconMap[reward.image] || iconMap.default
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <h4 className="text-[15px] font-bold leading-snug text-slate-900">{reward.name}</h4>
        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between border-t border-slate-100 pt-3">
            <span className="rounded border border-orange-100 bg-orange-50 px-2 py-0.5 text-sm font-black text-warning/90">
              {reward.pointsCost} แต้ม
            </span>
            {reward.stock > 0 ? (
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">เหลือ {reward.stock}</span>
            ) : (
              <span className="text-[10px] text-danger font-bold uppercase tracking-wide">หมดสต๊อก</span>
            )}
          </div>
          
          <button 
            onClick={() => onRedeem(reward.id, reward.pointsCost, reward.maxPerUser, reward.userRedeemedCount)}
            disabled={isDisabled}
            className="w-full rounded-lg bg-primary py-2 text-sm font-bold text-white transition-all hover:bg-primary-hover hover:shadow-md disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
          >
            {isLimitReached ? 'เต็มสิทธิแล้ว' : isOutOfStock ? 'ครบจำนวนแลกแล้ว' : 'แลกรางวัล'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RewardCard);
