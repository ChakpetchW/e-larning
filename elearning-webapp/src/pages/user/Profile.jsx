import React, { useEffect, useId, useRef, useState } from 'react';
import {
  User as UserIcon,
  LogOut,
  Settings,
  Award,
  ChevronRight,
  Bell,
  Shield,
  X,
  PlayCircle,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../../utils/api';
import useAccessibleOverlay from '../../hooks/useAccessibleOverlay';
import { getRoleLabel } from '../../utils/roles';

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [courses, setCourses] = useState([]);

  const editDialogRef = useRef(null);
  const editInputRef = useRef(null);
  const policyDialogRef = useRef(null);
  const policyCloseButtonRef = useRef(null);
  const passwordDialogTitleId = useId();
  const policyDialogTitleId = useId();
  const currentPasswordId = useId();
  const newPasswordId = useId();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, pointsRes, coursesRes] = await Promise.all([
          authAPI.getCurrentUser(),
          userAPI.getPoints(),
          userAPI.getCourses(),
        ]);
        setUser(userRes?.data || userRes);
        setPoints(pointsRes?.data?.balance ?? pointsRes?.balance ?? 0);
        setCourses(Array.isArray(coursesRes?.data) ? coursesRes.data : Array.isArray(coursesRes) ? coursesRes : []);
      } catch (error) {
        console.error('Fetch profile error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useAccessibleOverlay({
    isOpen: showEditModal,
    onClose: () => setShowEditModal(false),
    containerRef: editDialogRef,
    initialFocusRef: editInputRef,
  });

  useAccessibleOverlay({
    isOpen: showPolicyModal,
    onClose: () => setShowPolicyModal(false),
    containerRef: policyDialogRef,
    initialFocusRef: policyCloseButtonRef,
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert('กรุณากรอกรหัสผ่านให้ครบถ้วน');
      return;
    }

    if (newPassword.length < 6) {
      alert('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      setSavingPassword(true);
      await userAPI.updateProfile({ currentPassword, newPassword });
      setShowEditModal(false);
      setCurrentPassword('');
      setNewPassword('');
      alert('เปลี่ยนรหัสผ่านสำเร็จ');
    } catch (error) {
      console.error('Update password error', error);
      alert(error.response?.data?.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    } finally {
      setSavingPassword(false);
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled((current) => !current);
    alert(notificationsEnabled ? 'ปิดการแจ้งเตือนแล้ว' : 'เปิดการแจ้งเตือนแล้ว');
  };

  const statBoxes = [
    {
      label: 'แต้มสะสม',
      value: points.toLocaleString(),
      icon: <Award size={18} className="text-warning" />,
      color: 'text-warning',
      bg: 'bg-orange-50',
    },
    {
      label: 'สถานะ',
      value: user?.status === 'ACTIVE' ? 'ปกติ' : '-',
      icon: <Shield size={18} className="text-primary" />,
      color: 'text-primary',
      bg: 'bg-indigo-50',
    },
    {
      label: 'บทบาท',
      value: getRoleLabel(user),
      icon: <UserIcon size={18} className="text-success" />,
      color: 'text-success',
      bg: 'bg-green-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 animate-fade-in pb-8 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">โปรไฟล์</h2>
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          aria-label="เปิดหน้าต่างเปลี่ยนรหัสผ่าน"
          className="text-gray-400 transition-colors hover:text-gray-600"
        >
          <Settings size={24} />
        </button>
      </div>

      <div className="relative overflow-hidden border border-gray-100 bg-white p-0 card shadow-sm">
        <div className="relative h-32 bg-gradient-to-r from-primary to-indigo-400">
          <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
        </div>

        <div className="flex flex-col items-center px-6 pb-6">
          <div className="relative z-10 -mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white p-1 shadow-lg">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-100">
              <UserIcon size={40} className="text-slate-400" />
            </div>
          </div>

          <h3 className="mt-3 text-xl font-bold text-gray-900">{user?.name || 'User'}</h3>
          <p className="mb-1 text-sm font-medium text-gray-500">{user?.email}</p>
          <div className="badge mt-2 flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-primary">
            {user?.department || 'พนักงาน'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statBoxes.map((stat) => (
          <div
            key={stat.label}
            className="card flex flex-col items-center justify-center gap-1.5 border border-gray-100 bg-white p-4 text-center transition-colors hover:border-gray-200"
          >
            <div className={`mb-1 rounded-full p-2 ${stat.bg}`}>{stat.icon}</div>
            <h4 className={`w-full px-1 text-[1.15rem] font-black leading-tight ${stat.color}`}>
              {stat.value}
            </h4>
            <p className="text-[11px] font-bold tracking-[0.04em] text-gray-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <h4 className="mb-2 pl-2 text-xs font-bold tracking-[0.04em] text-gray-500">
          กิจกรรมการเรียน
        </h4>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/user/ongoing')}
            className="group relative flex flex-col items-start rounded-3xl border border-slate-100 bg-white p-5 text-left transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-transform group-hover:scale-110">
              <PlayCircle size={24} />
            </div>
            <p className="text-[11px] font-bold tracking-[0.04em] text-slate-500">กำลังเรียนอยู่</p>
            <div className="mt-1 flex w-full items-end justify-between">
              <h5 className="text-xl font-black text-slate-800">
                {courses.filter(c => c.isEnrolled && c.enrollmentStatus === 'IN_PROGRESS').length} คอร์ส
              </h5>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 opacity-0 transition-opacity group-hover:opacity-100">
                <ChevronRight size={16} className="text-slate-400" />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/user/completed')}
            className="group relative flex flex-col items-start rounded-3xl border border-slate-100 bg-white p-5 text-left transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
              <CheckCircle size={24} />
            </div>
            <p className="text-[11px] font-bold tracking-[0.04em] text-slate-500">เรียนจบแล้ว</p>
            <div className="mt-1 flex w-full items-end justify-between">
              <h5 className="text-xl font-black text-slate-800">
                {courses.filter(c => c.enrollmentStatus === 'COMPLETED').length} คอร์ส
              </h5>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 opacity-0 transition-opacity group-hover:opacity-100">
                <ChevronRight size={16} className="text-slate-400" />
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <h4 className="mb-2 pl-2 text-xs font-bold tracking-[0.04em] text-gray-500">
          การตั้งค่า
        </h4>

        <div className="card flex flex-col divide-y divide-gray-100 overflow-hidden border border-gray-100 bg-white">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="group flex items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gray-100 p-2.5 text-gray-700 transition-transform group-hover:scale-105">
                <Settings size={20} />
              </div>
              <div>
                <span className="mb-0.5 block text-sm font-bold text-gray-900">
                  เปลี่ยนรหัสผ่าน
                </span>
                <span className="block text-xs font-medium text-gray-400">
                  อัปเดตรหัสผ่านใหม่เพื่อความปลอดภัย
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 transition-colors group-hover:text-gray-500" />
          </button>

          <button
            type="button"
            onClick={toggleNotifications}
            aria-pressed={notificationsEnabled}
            className="group flex items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-transform group-hover:scale-105">
                <Bell size={20} />
              </div>
              <div>
                <span className="mb-0.5 block text-sm font-bold text-gray-900">การแจ้งเตือน</span>
                <span className="block text-xs font-medium text-gray-400">
                  {notificationsEnabled ? 'เปิดการแจ้งเตือนอยู่' : 'ปิดการแจ้งเตือนแล้ว'}
                </span>
              </div>
            </div>
            <div
              className={`flex h-6 w-12 items-center rounded-full p-1 transition-colors ${
                notificationsEnabled ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : ''
                }`}
              />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowPolicyModal(true)}
            className="group flex items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 transition-transform group-hover:scale-105">
                <Shield size={20} />
              </div>
              <div>
                <span className="mb-0.5 block text-sm font-bold text-gray-900">
                  ความเป็นส่วนตัว
                </span>
                <span className="block text-xs font-medium text-gray-400">
                  นโยบายและเงื่อนไข
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 transition-colors group-hover:text-gray-500" />
          </button>
        </div>
      </div>

      <div className="mb-8 mt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="card flex w-full items-center justify-center gap-2 border border-red-100 bg-white p-4 font-bold text-danger shadow-sm transition-colors hover:bg-red-50"
        >
          <LogOut size={20} />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
            aria-label="ปิดหน้าต่างเปลี่ยนรหัสผ่าน"
          />
          <div
            ref={editDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={passwordDialogTitleId}
            tabIndex={-1}
            className="relative flex w-full max-w-sm flex-col items-center rounded-[2rem] bg-white p-6 shadow-2xl animate-fade-in md:p-8"
          >
            <h3 id={passwordDialogTitleId} className="mb-6 w-full text-center text-2xl font-black text-slate-800">
              เปลี่ยนรหัสผ่าน
            </h3>

            <div className="mb-4 w-full">
              <label htmlFor={currentPasswordId} className="mb-2 block text-sm font-bold text-slate-700">
                รหัสผ่านปัจจุบัน
              </label>
              <input
                ref={editInputRef}
                id={currentPasswordId}
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="กรอกรหัสผ่านปัจจุบัน"
              />
            </div>

            <div className="mb-6 w-full">
              <label htmlFor={newPasswordId} className="mb-2 block text-sm font-bold text-slate-700">
                รหัสผ่านใหม่
              </label>
              <input
                id={newPasswordId}
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
              />
            </div>

            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                }}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-200 focus:outline-none"
                disabled={savingPassword}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={savingPassword}
                className="flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-md transition-colors hover:bg-primary-hover focus:outline-none"
              >
                {savingPassword ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'เปลี่ยนรหัสผ่าน'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPolicyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowPolicyModal(false)}
            aria-label="ปิดหน้าต่างนโยบายความเป็นส่วนตัว"
          />
          <div
            ref={policyDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={policyDialogTitleId}
            tabIndex={-1}
            className="relative flex h-[80vh] w-full max-w-md flex-col rounded-[2rem] bg-white p-6 shadow-2xl animate-fade-in"
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 id={policyDialogTitleId} className="flex items-center gap-2 text-xl font-black text-slate-800">
                <Shield size={22} className="text-primary" />
                นโยบายความเป็นส่วนตัว
              </h3>
              <button
                ref={policyCloseButtonRef}
                type="button"
                onClick={() => setShowPolicyModal(false)}
                aria-label="ปิดหน้าต่างนโยบายความเป็นส่วนตัว"
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <div className="custom-scrollbar mb-6 flex-1 space-y-4 overflow-y-auto pr-2 text-sm font-medium leading-relaxed text-slate-600">
              <p>
                ยินดีต้อนรับสู่แพลตฟอร์มการเรียนรู้ของเรา การปกป้องข้อมูลส่วนบุคคลของคุณคือสิ่งสำคัญที่สุด
              </p>
              <h4 className="text-base font-bold text-slate-800">1. การจัดเก็บข้อมูล</h4>
              <p>
                เราจัดเก็บข้อมูลที่จำเป็นต่อการให้บริการ เช่น ชื่อ อีเมล และประวัติการเรียนรู้ของคุณ
                เพื่อมอบประสบการณ์ที่ดีที่สุด
              </p>
              <h4 className="text-base font-bold text-slate-800">2. การใช้ข้อมูล</h4>
              <p>
                ข้อมูลของคุณจะถูกใช้เพื่อการวิเคราะห์และออกใบรับรองการจบหลักสูตร
                ทีมงานไม่มีนโยบายขายข้อมูลส่วนบุคคลของท่านให้กับบุคคลที่สามอย่างเด็ดขาด
              </p>
              <h4 className="text-base font-bold text-slate-800">3. สิทธิของคุณ</h4>
              <p>
                คุณสามารถขอแก้ไขหรือลบข้อมูลบัญชีของตนเองได้ตลอดเวลาตามกฎหมาย PDPA
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPolicyModal(false)}
              className="w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg focus:outline-none"
            >
              ฉันเข้าใจและยอมรับ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
