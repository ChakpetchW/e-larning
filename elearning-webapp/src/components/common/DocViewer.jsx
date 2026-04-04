import React, { useEffect, useRef, useState } from 'react';
import { X, FileText, ShieldAlert, Loader2 } from 'lucide-react';

/**
 * SecureDocViewer - แสดงเอกสารภายในแอป โดยหลีกเลี่ยงการสร้าง blob URL
 * เพราะ Chrome บน production บางกรณีจะไม่ยอมโหลด blob: ภายใน iframe
 */
const DocViewer = ({ url, title, onClose, onComplete }) => {
  const overlayRef = useRef(null);
  const [viewerUrl, setViewerUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === 's' || event.key === 'p')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    setLoading(true);

    if (!url) {
      setViewerUrl('');
      setError('ไม่พบ URL เอกสาร');
      setLoading(false);

      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    }

    const resolvedUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    const normalizedUrl = resolvedUrl.toLowerCase().split('?')[0];
    const isPdf = normalizedUrl.endsWith('.pdf') || normalizedUrl.includes('/documents/');

    if (isPdf) {
      setViewerUrl(`${resolvedUrl}#toolbar=0&navpanes=0&scrollbar=0`);
    } else {
      const encoded = encodeURIComponent(resolvedUrl);
      setViewerUrl(`https://docs.google.com/viewer?url=${encoded}&embedded=true`);
    }

    setError(null);
    setLoading(false);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [url]);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/80 backdrop-blur-md animate-fade-in"
      onContextMenu={(event) => event.preventDefault()}
    >
      <style>{`@media print { .doc-viewer-print-guard { display: none !important; } }`}</style>

      <div className="doc-viewer-print-guard flex h-full w-full flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/20 text-primary">
              <FileText size={18} strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-white">{title || 'เอกสารบทเรียน'}</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <ShieldAlert size={11} className="text-amber-400" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Protected • ห้ามดาวน์โหลด</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-slate-800">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-white/60">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium animate-pulse">กำลังเตรียมเอกสารแบบปลอดภัย...</p>
            </div>
          ) : error ? (
            <div className="max-w-sm rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center">
              <ShieldAlert className="mx-auto mb-3 h-12 w-12 text-red-500" />
              <p className="mb-1 font-bold text-white">เกิดข้อผิดพลาด</p>
              <p className="text-sm text-red-400">{error}</p>
              <button onClick={onClose} className="mt-4 rounded-xl bg-white/10 px-6 py-2 text-sm font-bold text-white">
                ปิดหน้าต่าง
              </button>
            </div>
          ) : (
            <iframe
              src={viewerUrl}
              title={title || 'เอกสาร'}
              className="absolute inset-0 h-full w-full border-0"
              referrerPolicy="no-referrer"
            />
          )}

          <div
            ref={overlayRef}
            className="absolute inset-0 z-10"
            onContextMenu={(event) => event.preventDefault()}
            style={{ pointerEvents: 'none' }}
          />
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-white/10 bg-slate-900 px-6 py-4">
          <p className="text-xs font-medium text-slate-400">
            เนื้อหานี้เป็นทรัพย์สินของบริษัท ห้ามเผยแพร่หรือนำไปใช้โดยไม่ได้รับอนุญาต
          </p>
          <button
            onClick={() => {
              onComplete?.();
              onClose();
            }}
            className="shrink-0 rounded-2xl bg-primary px-8 py-3 text-sm font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            อ่านจบแล้ว ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocViewer;
