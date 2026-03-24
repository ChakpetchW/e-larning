import React, { useState, useEffect, useRef } from 'react';
import { User as UserIcon, LogOut, Settings, Award, Clock, ChevronRight, Bell, Shield, BookOpen, Camera, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI, userAPI, getFullUrl } from '../../utils/api';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [userRes, pointsRes] = await Promise.all([
        authAPI.getCurrentUser(),
        userAPI.getPoints()
      ]);
      setUser(userRes.data);
      setNewName(userRes.data.name);
      setPoints(pointsRes.data.balance);
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const uploadRes = await userAPI.uploadFile(file);
      const imageUrl = uploadRes.data.url;
      
      // Update profile with new avatar
      await userAPI.updateProfile({ avatar: imageUrl });
      
      // Refresh local state
      setUser({ ...user, avatar: imageUrl });
      
      // Update local storage so Header gets it too
      const localData = JSON.parse(localStorage.getItem('user') || '{}');
      localData.avatar = imageUrl;
      localStorage.setItem('user', JSON.stringify(localData));
      
      alert('อัปเดตรูปโปรไฟล์สำเร็จ');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('ไม่สามารถอัปโหลดรูปภาพได้');
    } finally {
      setUploadingAvatar(false);
      e.target.value = null; // reset input
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return alert('กรุณากรอกชื่อ');
    try {
      setSavingName(true);
      await userAPI.updateProfile({ name: newName });
      
      setUser({ ...user, name: newName });
      
      const localData = JSON.parse(localStorage.getItem('user') || '{}');
      localData.name = newName;
      localStorage.setItem('user', JSON.stringify(localData));
      
      setShowEditModal(false);
      alert('บันทึกชื่อสำเร็จ');
    } catch (error) {
      console.error('Update name error', error);
      alert('บันทึกชื่อไม่สำเร็จ');
    } finally {
      setSavingName(false);
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    alert(notificationsEnabled ? 'ปิดการแจ้งเตือนแล้ว' : 'เปิดการแจ้งเตือนแล้ว');
  };

  const statBoxes = [
    { label: 'แต้มสะสม', value: points.toLocaleString(), icon: <Award size={18} className="text-warning"/>, color: 'text-warning', bg: 'bg-orange-50' },
    { label: 'สถานะ', value: user?.status === 'ACTIVE' ? 'ปกติ' : '-', icon: <Shield size={18} className="text-primary"/>, color: 'text-primary', bg: 'bg-indigo-50' },
    { label: 'บทบาท', value: user?.role === 'admin' ? 'Admin' : 'User', icon: <UserIcon size={18} className="text-success"/>, color: 'text-success', bg: 'bg-green-50' }
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
        <button onClick={() => setShowEditModal(true)} className="text-gray-400 hover:text-gray-600 transition-colors"><Settings size={24} /></button>
      </div>
      
      {/* Profile Header Card */}
      <div className="card p-0 bg-white border border-gray-100 overflow-hidden shadow-sm relative">
        <div className="h-32 bg-gradient-to-r from-primary to-indigo-400 relative">
            <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        </div>
        
        <div className="px-6 flex flex-col items-center pb-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg relative -mt-12 z-10 p-1 group">
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            <div 
              onClick={handleAvatarClick}
              className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center relative overflow-hidden cursor-pointer group-hover:bg-slate-200 transition-colors"
            >
                {uploadingAvatar ? (
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                ) : user?.avatar ? (
                  <img src={getFullUrl(user.avatar)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={40} className="text-slate-400" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mt-3 text-gray-900">{user?.name || 'User'}</h3>
          <p className="text-sm font-medium text-gray-500 mb-1">{user?.email}</p>
          <div className="badge bg-indigo-50 text-primary mt-2 flex items-center gap-1 border border-indigo-100 font-bold px-3 py-1 rounded-full text-xs">
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
                <h4 className={`text-[1.15rem] font-black ${stat.color} leading-none truncate w-full px-1`}>{stat.value}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate">{stat.label}</p>
            </div>
        ))}
      </div>

      {/* Settings / Actions List */}
      <div className="flex flex-col gap-1 mt-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2 mb-2">การตั้งค่า</h4>
        
        <div className="card bg-white border border-gray-100 overflow-hidden flex flex-col divide-y divide-gray-100">
            {/* Account Settings */}
            <button onClick={() => setShowEditModal(true)} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group">
              <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-gray-100 text-gray-700 group-hover:scale-105 transition-transform">
                      <Settings size={20}/>
                  </div>
                  <div>
                      <span className="font-bold text-gray-900 block text-sm mb-0.5">การตั้งค่าบัญชี</span>
                      <span className="text-xs font-medium text-gray-400 block">แก้ไขชื่อโปรไฟล์ส่วนตัว</span>
                  </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </button>

            {/* Notifications */}
            <button onClick={toggleNotifications} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group">
              <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                      <Bell size={20}/>
                  </div>
                  <div>
                      <span className="font-bold text-gray-900 block text-sm mb-0.5">การแจ้งเตือน</span>
                      <span className="text-xs font-medium text-gray-400 block">{notificationsEnabled ? 'เปิดการแจ้งเตือนอยู่' : 'ปิดการแจ้งเตือนแล้ว'}</span>
                  </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-gray-200'}`}>
                 <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : ''}`}></div>
              </div>
            </button>

            {/* Policy */}
            <button onClick={() => setShowPolicyModal(true)} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group">
              <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
                      <Shield size={20}/>
                  </div>
                  <div>
                      <span className="font-bold text-gray-900 block text-sm mb-0.5">ความเป็นส่วนตัว</span>
                      <span className="text-xs font-medium text-gray-400 block">นโยบายและเงื่อนไข</span>
                  </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </button>
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-2xl animate-fade-in flex flex-col items-center">
            <h3 className="text-2xl font-black text-slate-800 mb-6 w-full text-center">แก้ใขโปรไฟล์</h3>
            
            <div className="w-full mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อแสดงผล</label>
              <input 
                type="text" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                placeholder="กรอกชื่อของคุณ"
              />
            </div>

            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                disabled={savingName}
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleUpdateName}
                disabled={savingName}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-md transition-colors flex justify-center items-center"
              >
                {savingName ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 max-w-md w-full shadow-2xl animate-fade-in flex flex-col h-[80vh]">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Shield size={22} className="text-primary"/> นโยบายความเป็นส่วนตัว</h3>
              <button onClick={() => setShowPolicyModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-sm text-slate-600 mb-6 space-y-4 leading-relaxed font-medium">
              <p>ยินดีต้อนรับสู่แพลตฟอร์มการเรียนรู้ของเรา การปกป้องข้อมูลส่วนบุคคลของคุณคือสิ่งสำคัญที่สุด</p>
              <h4 className="font-bold text-slate-800 text-base">1. การจัดเก็บข้อมูล</h4>
              <p>เราจัดเก็บข้อมูลที่จำเป็นต่อการให้บริการ เช่น ชื่อ อีเมล และประวัติการเรียนรู้ของคุณ เพื่อมอบประสบการณ์ที่ดีที่สุด</p>
              <h4 className="font-bold text-slate-800 text-base">2. การใช้ข้อมูล</h4>
              <p>ข้อมูลของคุณจะถูกใช้เพื่อการวิเคราะห์และออกใบรับรองการจบหลักสูตร ทีมงานไม่มีนโยบายขายข้อมูลส่วนบุลคลของท่านให้กับบุคคลที่สามอย่างเด็ดขาด</p>
              <h4 className="font-bold text-slate-800 text-base">3. สิทธิ์ของคุณ</h4>
              <p>คุณสามารถขอแก้ไขหรือขอลบข้อมูลบัญชีของตนเองได้ตลอดเวลาตามกฎหมาย PDPA.</p>
            </div>

            <button onClick={() => setShowPolicyModal(false)} className="w-full py-3.5 rounded-xl font-bold bg-primary text-white shadow-md hover:shadow-lg hover:bg-primary-hover transition-all">
              ฉันเข้าใจและยอมรับ
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
