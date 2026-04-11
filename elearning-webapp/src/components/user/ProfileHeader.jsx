import React from 'react';
import { User as UserIcon, Settings } from 'lucide-react';

const ProfileHeader = ({ user, onOpenSettings }) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">โปรไฟล์</h2>
        <button
          type="button"
          onClick={onOpenSettings}
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

          <h3 className="mt-3 text-xl font-bold text-gray-900 text-center truncate w-full px-4">{user?.name || 'User'}</h3>
          <p className="mb-1 text-sm font-medium text-gray-500 text-center break-all w-full px-4">{user?.email}</p>
          <div className="badge mt-2 flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-primary">
            {user?.department || 'พนักงาน'}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
