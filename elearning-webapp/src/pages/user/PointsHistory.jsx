import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gift, CheckCircle, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../utils/api';

const PointsHistory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('earned'); // 'earned' | 'used'
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await userAPI.getPointsHistory();
        setHistory(res.data.history);
        setBalance(res.data.balance);
      } catch (error) {
        console.error('Fetch points history error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const earnedLogs = history.filter(log => log.points > 0);
  const usedLogs = history.filter(log => log.points < 0);

  const renderLogIcon = (type, points) => {
    if (points > 0) {
      if (type === 'course') return <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0"><CheckCircle size={20} /></div>;
      if (type === 'admin_edit') return <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><TrendingUp size={20} /></div>;
      return <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0"><TrendingUp size={20} /></div>;
    } else {
      if (type === 'redeem') return <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0"><Gift size={20} /></div>;
      return <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0"><TrendingDown size={20} /></div>;
    }
  };

  const currentList = activeTab === 'earned' ? earnedLogs : usedLogs;

  return (
    <div className="flex flex-col gap-6 animate-fade-in pt-4 md:pt-2 max-w-2xl mx-auto w-full">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors w-max font-bold mb-2">
        <ArrowLeft size={20} /> ย้อนกลับ
      </button>

      {/* Hero Header */}
      <div className="card mesh-bg relative overflow-hidden flex flex-col items-center justify-center text-center p-10 border-none shadow-sm rounded-3xl ring-1 ring-slate-200/50">
        <span className="inline-block px-4 py-1 rounded-full bg-white/60 backdrop-blur-md text-primary font-bold text-xs mb-4 shadow-sm border border-white/40">แต้มของคุณ</span>
        <h2 className="text-5xl font-black text-slate-800 flex items-end justify-center gap-2 tracking-tight">
          {balance} <span className="text-2xl font-bold text-slate-500 mb-1">PTS</span>
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm ring-1 ring-slate-100">
        <button 
          onClick={() => setActiveTab('earned')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'earned' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          ได้รับพ้อยท์
        </button>
        <button 
          onClick={() => setActiveTab('used')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'used' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          ประวัติการใช้พ้อยท์
        </button>
      </div>

      {/* History List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-extrabold text-slate-800 mb-2 mt-2 px-1">ประวัติล่าสุด</h3>
        
        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div></div>
        ) : currentList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm ring-1 ring-slate-100 flex flex-col items-center border-dashed">
            <Clock size={40} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">ยังไม่มีประวัติในหมวดหมู่นี้</p>
          </div>
        ) : (
          currentList.map(log => (
            <div key={log.id} className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] ring-1 ring-slate-100 flex items-center justify-between gap-4 transition-transform hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                {renderLogIcon(log.sourceType, log.points)}
                <div>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                    {log.sourceType === 'course' ? 'Completed course' : log.sourceType === 'redeem' ? 'Redeemed' : 'Admin adjustment'}: {log.note ? log.note.split(': ').pop() : (log.sourceType === 'course' ? 'การเรียนรู้' : 'ของรางวัล')}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">{new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-lg font-black ${log.points > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {log.points > 0 ? '+' : ''}{log.points}
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{log.sourceType === 'redeem' ? 'REDEEM' : log.sourceType === 'course' ? 'COURSE' : 'ADMIN'}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="h-8"></div>
    </div>
  );
};

export default PointsHistory;
