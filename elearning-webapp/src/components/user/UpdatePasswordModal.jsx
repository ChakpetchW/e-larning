import React, { useRef } from 'react';
import ModalPortal from '../../components/common/ModalPortal';
import useAccessibleOverlay from '../../hooks/useAccessibleOverlay';

const UpdatePasswordModal = ({
  isOpen,
  onClose,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  savingPassword,
  onSave,
  passwordDialogTitleId,
  currentPasswordId,
  newPasswordId
}) => {
  const editDialogRef = useRef(null);
  const editInputRef = useRef(null);

  useAccessibleOverlay({
    isOpen,
    onClose,
    containerRef: editDialogRef,
    initialFocusRef: editInputRef,
  });

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
        <button
          type="button"
          className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
          onClick={onClose}
          aria-label="ปิดหน้าต่างเปลี่ยนรหัสผ่าน"
        />
        <div
          ref={editDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={passwordDialogTitleId}
          tabIndex={-1}
          className="relative flex w-[calc(100%-2rem)] max-w-xl flex-col items-center rounded-[2.25rem] bg-white/95 p-6 shadow-[0_32px_100px_-32px_rgba(15,23,42,0.55)] animate-fade-in focus:outline-none outline-none md:p-8"
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
              onClick={onClose}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-200 focus:outline-none"
              disabled={savingPassword}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={onSave}
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
    </ModalPortal>
  );
};

export default UpdatePasswordModal;
