import React from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';

export const DocViewerLoading = ({ show }) => {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm font-medium animate-pulse text-white/80">กำลังเตรียมเอกสารแบบปลอดภัย...</p>
    </div>
  );
};

export const DocViewerTimeout = ({ show, isRetrying, onRetry, onClose }) => {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 transition-opacity bg-slate-950/50">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm font-medium animate-pulse text-white/80">
        {isRetrying ? 'กำลังลองเชื่อมต่อเอกสารอีกครั้ง...' : 'กำลังโหลดเอกสาร...'}
      </p>
      
      <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
        <div className="text-center px-6">
          <p className="text-sm font-bold text-white mb-1">หน้าจอค้างหรือไม่ยอมโหลด?</p>
          <p className="text-xs text-white/50">บริการพรีวิวอาจใช้เวลานานกว่าปกติ</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onRetry}
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
          >
            ลองโหลดใหม่
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg"
          >
            ปิดเอกสาร
          </button>
        </div>
      </div>
    </div>
  );
};

export const DocViewerError = ({ error, onClose }) => {
  if (!error) return null;
  return (
    <div className="max-w-sm rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center">
      <ShieldAlert className="mx-auto mb-3 h-12 w-12 text-red-500" />
      <p className="mb-1 font-bold text-white">เกิดข้อผิดพลาด</p>
      <p className="text-sm text-red-400">{error}</p>
      <button onClick={onClose} className="mt-4 rounded-xl bg-white/10 px-6 py-2 text-sm font-bold text-white">
        ปิดหน้าต่าง
      </button>
    </div>
  );
};
