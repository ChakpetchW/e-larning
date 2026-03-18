import React, { useState, useEffect } from 'react';
import { User as UserIcon, LogOut, Settings, Award, Clock, ChevronRight, Bell, Shield, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../../utils/api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, pointsRes] = await Promise.all([
          authAPI.getCurrentUser(),
          userAPI.getPoints()
        ]);
        setUser(userRes.data);
        setPoints(pointsRes.data.balance);
      } catch (error) {
        console.error('Fetch profile error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const statBoxes = [
    { label: 'แต้มสะสม', value: points.toLocaleString(), icon: <Award size={18} className="text-warning"/>, color: 'text-warning', bg: 'bg-orange-50' },
    { label: 'ชั่วโมงเรียน', value: '0', icon: <Clock size={18} className="text-primary"/>, color: 'text-primary', bg: 'bg-indigo-50' },
    { label: 'คอร์สที่จบ', value: '0', icon: <BookOpen size={18} className="text-success"/>, color: 'text-success', bg: 'bg-green-50' }
  ];

  const menuItems = [
    { icon: <Settings size={20}/>, label: 'การตั้งค่าบัญชี', desc: 'รหัสผ่าน, ข้อมูลส่วนตัว', color: 'text-gray-700', bg: 'bg-gray-100' },
    { icon: <Bell size={20}/>, label: 'การแจ้งเตือน', desc: 'เปิด/ปิด เสียงเตือน', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: <Shield size={20}/>, label: 'ความเป็นส่วนตัว', desc: 'นโยบายและเงื่อนไข', color: 'text-indigo-600', bg: 'bg-indigo-50' }
  ];

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
     );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8 pt-2 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">โปรไฟล์</h2>
        <button className="text-gray-400 hover:text-gray-600"><Settings size={24} /></button>
      </div>
      
      {/* Profile Header Card */}
      <div className="card p-0 bg-white border border-gray-100 overflow-hidden shadow-sm relative">
        <div className="h-32 bg-gradient-to-r from-primary to-indigo-400 relative">
            <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        </div>
        
        <div className="px-6 flex flex-col items-center pb-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg relative -mt-12 z-10 p-1">
            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors">
                <UserIcon size={40} className="text-gray-400" />
            </div>
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-success border-2 border-white rounded-full"></div>
          </div>
          
          <h3 className="text-xl font-bold mt-3 text-gray-900">{user?.name || 'User'}</h3>
          <p className="text-sm font-medium text-gray-500 mb-1">{user?.email}</p>
          <div className="badge bg-indigo-50 text-primary mt-2 border border-indigo-100">
            {user?.department || 'พนักงาน'}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {statBoxes.map((stat, idx) => (
            <div key={idx} className="card bg-white p-4 flex flex-col items-center justify-center border border-gray-100 text-center gap-1.5 hover:border-gray-200 transition-colors">
                <div className={`p-2 rounded-full ${stat.bg} mb-1`}>
                    {stat.icon}
                </div>
                <h4 className={`text-xl font-black ${stat.color} leading-none`}>{stat.value}</h4>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{stat.label}</p>
            </div>
        ))}
      </div>

      {/* Settings / Actions List */}
      <div className="flex flex-col gap-1 mt-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2 mb-2">การตั้งค่า</h4>
        
        <div className="card bg-white border border-gray-100 overflow-hidden flex flex-col divide-y divide-gray-100">
            {menuItems.map((item, idx) => (
                <button key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group">
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} group-hover:scale-105 transition-transform`}>
                        {item.icon}
                    </div>
                    <div>
                        <span className="font-bold text-gray-900 block text-sm mb-0.5">{item.label}</span>
                        <span className="text-xs font-medium text-gray-400 block">{item.desc}</span>
                    </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
            ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-4 mb-8">
        <button 
          onClick={handleLogout}
          className="w-full card bg-white border border-red-100 p-4 flex items-center justify-center gap-2 text-danger hover:bg-red-50 transition-colors font-bold shadow-sm"
        >
          <LogOut size={20}/>
          <span>ออกจากระบบ</span>
        </button>
      </div>
      
    </div>
  );
};

export default Profile;
