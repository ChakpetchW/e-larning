import React, { useState, useEffect } from 'react';
import { Gift, Zap, Ticket, Coffee, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../utils/api';
import RewardCard from '../../components/common/RewardCard';



const Rewards = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pointsRes, rewardsRes] = await Promise.allSettled([
        userAPI.getPoints(),
        userAPI.getRewards()
      ]);
      
      if (pointsRes.status === 'fulfilled') {
        const pData = pointsRes.value?.data || pointsRes.value;
        setPoints(pData?.balance || 0);
        setHistory(Array.isArray(pData?.history) ? pData.history : []);
      }
      
      if (rewardsRes.status === 'fulfilled') {
        const rData = rewardsRes.value?.data || rewardsRes.value;
        setRewards(Array.isArray(rData) ? rData : []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId, cost, max, userRedeemed) => {
    if (points < cost) return alert('แต้มไม่พอ');
    if (userRedeemed >= max) return alert('สิทธิของคุณเต็มแล้ว');
    if (confirm('ยืนยันการแลกของรางวัล?')) {
      try {
        setRedeeming(true);
        await userAPI.requestRedeem(rewardId);
        alert('ส่งคำร้องขอแลกของรางวัลสำเร็จ โปรดรอแอดมินอนุมัติ');
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Redeem error:', error);
        alert(error.response?.data?.message || 'การแลกรางวัลล้มเหลว');
      } finally {
        setRedeeming(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-8 pt-2">
      
      {/* Points Card */}
      <div className="relative flex flex-col items-center overflow-hidden rounded-[1.75rem] bg-gradient-primary p-6 text-white shadow-[0_28px_60px_-28px_rgba(67,56,202,0.6)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.12),_transparent_30%)]"></div>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent"></div>
        
        <div className="relative z-10 w-full">
          <div className="flex justify-between items-start w-full">
            <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">แต้มของคุณ</span>
            </div>
            <button 
              onClick={() => navigate('/user/points-history')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20">
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

      {/* Reward Catalog */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold tracking-tight text-gray-900">ของรางวัลสุดพิเศษ</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {rewards.map(reward => (
            <RewardCard 
              key={reward.id} 
              reward={reward} 
              points={points} 
              onRedeem={handleRedeem}
              redeeming={redeeming}
            />
          ))}
        </div>
      </section>

      {/* History */}
      <section>
        <h3 className="text-lg font-bold mb-3 tracking-tight text-gray-900">ประวัติล่าสุด</h3>
        <div className="flex flex-col gap-3">
          {history.length > 0 ? history.map(entry => (
            <div key={entry.id} className="card flex items-center justify-between border border-slate-100 bg-white p-4 transition-colors hover:border-slate-200">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${entry.points > 0 ? 'bg-green-50 text-success border-green-100' : 'bg-orange-50 text-warning border-orange-100'}`}>
                  {entry.points > 0 ? <CheckCircle size={20} strokeWidth={2}/> : <Gift size={20} strokeWidth={2}/>}
                </div>
                <div>
                  <h4 className="mb-1 max-w-[160px] truncate text-[15px] font-bold leading-tight text-slate-900">{entry.note}</h4>
                  <p className="text-xs font-medium text-slate-500">{new Date(entry.createdAt).toLocaleDateString('th-TH')}</p>
                </div>
              </div>
              <div className="text-right flex flex-col justify-center">
                <p className={`text-base font-black ${entry.points > 0 ? 'text-success' : 'text-danger'}`}>
                  {entry.points > 0 ? `+${entry.points}` : entry.points}
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{entry.sourceType}</p>
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-slate-500">
              <p className="font-medium">ยังไม่มีประวัติการรับแต้ม</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Rewards;
