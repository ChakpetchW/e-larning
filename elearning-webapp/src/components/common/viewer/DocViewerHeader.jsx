import React from 'react';
import { FileText, ShieldAlert, X, Loader2 } from 'lucide-react';

const DocViewerHeader = ({ title, onClose, submitting }) => {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-950 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/20 text-primary">
          <FileText size={18} strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">{title || 'เอกสารประกอบ'}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <ShieldAlert size={11} className="text-amber-400" />
            <p className="text-[11px] font-bold tracking-[0.04em] text-amber-300">Protected • ห้ามดาวน์โหลด</p>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        disabled={submitting}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:scale-105 hover:bg-white/20 active:scale-95 disabled:opacity-50"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <X size={18} />}
      </button>
    </div>
  );
};

export default DocViewerHeader;
