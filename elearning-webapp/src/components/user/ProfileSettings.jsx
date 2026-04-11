import React from 'react';
import { Settings, ChevronRight, Bell, Shield } from 'lucide-react';

const ProfileSettings = ({ 
  notificationsEnabled, 
  onToggleNotifications, 
  onShowPasswordModal, 
  onShowPrivacyModal 
}) => {
  return (
    <div className="mt-2 flex flex-col gap-1">
      <h4 className="mb-2 pl-2 text-xs font-bold tracking-[0.04em] text-gray-500">
        การตั้งค่า
      </h4>

      <div className="card flex flex-col divide-y divide-gray-100 overflow-hidden border border-gray-100 bg-white shadow-sm">
        <button
          type="button"
          onClick={onShowPasswordModal}
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
          onClick={onToggleNotifications}
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
          onClick={onShowPrivacyModal}
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
  );
};

export default ProfileSettings;
