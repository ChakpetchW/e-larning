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
    <div className={`card border-gray-100 flex flex-col h-full bg-white relative overflow-hidden group ${(isOutOfStock || isLimitReached) ? 'opacity-70 grayscale-[0.8]' : ''}`}>
      <div className={`${reward.image?.includes('/') ? 'bg-white border-b border-gray-50' : bgMap[reward.image] || bgMap.default} h-28 flex items-center justify-center relative overflow-hidden transition-colors duration-300 group-hover:bg-opacity-80 p-2`}>
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/30 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="transform group-hover:scale-105 transition-transform duration-300 flex items-center justify-center w-full h-full">
          {reward.image?.includes('/') ? (
            <img src={getFullUrl(reward.image)} alt={reward.name} className="w-full h-full object-contain mix-blend-multiply" />
          ) : (
            iconMap[reward.image] || iconMap.default
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <h4 className="font-bold text-[15px] leading-snug text-gray-900">{reward.name}</h4>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-end border-t border-gray-100 pt-3">
            <span className="font-black text-warning text-sm bg-orange-50 px-2 py-0.5 rounded text-warning/90 border border-orange-100">
              {reward.pointsCost} Pts
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
            className="w-full py-2 rounded-lg text-sm font-bold transition-all
                       disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none
                       bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md"
          >
            {isLimitReached ? 'เต็มสิทธิแล้ว' : isOutOfStock ? 'ครบจำนวนแลกแล้ว' : 'แลกรางวัล'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RewardCard);
