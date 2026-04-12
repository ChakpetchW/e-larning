import React from 'react';
import { Loader2 } from 'lucide-react';

const DocViewerFooter = ({ 
  show, 
  completionReady, 
  submitting, 
  completionError, 
  onFinishReading 
}) => {
  if (!show) return null;

  return (
    <div className="flex md:hidden shrink-0 flex-col border-t border-white/10 bg-slate-950 p-6 pb-8 md:p-8">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
         {completionError && <p className="text-center text-xs font-medium text-red-400">{completionError}</p>}
         
         <button
           onClick={onFinishReading}
           disabled={submitting}
           className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black transition-all active:scale-95 sm:h-14 sm:text-base ${
             completionReady 
               ? 'border border-white/10 bg-white/10 text-white hover:bg-white/20' 
               : 'bg-primary text-white shadow-xl shadow-primary/20'
           }`}
         >
           {submitting ? (
             <>
               <Loader2 size={18} className="animate-spin" />
               กำลังบันทึก...
             </>
           ) : (
             <>
               {completionReady ? 'ปิดเอกสาร' : 'อ่านจบแล้ว • ปิดเอกสาร'}
             </>
           )}
         </button>
      </div>
    </div>
  );
};

export default DocViewerFooter;
