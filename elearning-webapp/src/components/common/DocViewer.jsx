import React, { useEffect, useRef, useState } from 'react';
import { X, FileText, ShieldAlert, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

/**
 * SecureDocViewer - แสดงเอกสารภายในแอป โดยหลีกเลี่ยงการสร้าง blob URL
 * เพราะ Chrome บน production บางกรณีจะไม่ยอมโหลด blob: ภายใน iframe
 */
const DocViewer = ({
  url,
  title,
  onClose,
  onComplete,
  isCompleted = false,
  onNext,
  onReturnToCourse,
}) => {
  const overlayRef = useRef(null);
  const [viewerUrl, setViewerUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [completionReady, setCompletionReady] = useState(Boolean(isCompleted));
  const [completionError, setCompletionError] = useState('');

  useEffect(() => {
    setCompletionReady(Boolean(isCompleted));
    setCompletionError('');
    setSubmitting(false);
  }, [isCompleted, url]);

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
    const isMobileViewport = window.matchMedia('(max-width: 767px)').matches;
    const encoded = encodeURIComponent(resolvedUrl);

    if (isPdf && !isMobileViewport) {
      setViewerUrl(`${resolvedUrl}#toolbar=0&navpanes=0&pagemode=none&zoom=page-fit`);
    } else {
      setViewerUrl(`https://docs.google.com/viewer?url=${encoded}&embedded=true`);
    }

    setError(null);
    setLoading(false);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [url]);

  const handleFinishReading = async () => {
    if (submitting) return;

    if (completionReady) {
      if (onNext) {
        onClose?.();
        window.requestAnimationFrame(() => {
          onNext();
        });
        return;
      }

      if (onReturnToCourse) {
        onClose?.();
        window.requestAnimationFrame(() => {
          onReturnToCourse();
        });
        return;
      }

      onClose();
      return;
    }

    try {
      setSubmitting(true);
      setCompletionError('');
      const result = await onComplete?.();

      if (result === false) {
        setCompletionError('ไม่สามารถบันทึกความคืบหน้าได้ โปรดลองอีกครั้ง');
        return;
      }

      setCompletionReady(true);
    } catch (completionRequestError) {
      console.error('Complete document lesson error:', completionRequestError);
      setCompletionError('ไม่สามารถบันทึกความคืบหน้าได้ โปรดลองอีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Prevent body scroll when DocViewer is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const isMobileViewport = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const shouldBlockViewerShortcut = viewerUrl.includes('docs.google.com/viewer');

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/80 backdrop-blur-md animate-fade-in overflow-hidden"
      onContextMenu={(event) => event.preventDefault()}
    >
      <style>{`@media print { .doc-viewer-print-guard { display: none !important; } }`}</style>

      <div className="doc-viewer-print-guard flex h-full w-full flex-col overflow-hidden">
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
          {shouldBlockViewerShortcut && (
            <div
              aria-hidden="true"
              className="absolute right-0 top-0 z-20 h-[52px] w-[52px] bg-[#333] flex items-center justify-center"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              style={{ touchAction: 'none' }}
            >
               {/* Minimalist "safety icon" to cover Google icon visually */}
               <ShieldAlert size={16} className="text-slate-500 opacity-50" />
            </div>
          )}

          <div
            ref={overlayRef}
            className="absolute inset-0 z-10"
            onContextMenu={(event) => event.preventDefault()}
            style={{ pointerEvents: 'none' }}
          />
        </div>

        <div className="flex shrink-0 flex-col gap-4 border-t border-white/10 bg-slate-900 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            {completionReady ? (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">บันทึกความคืบหน้าแล้ว</p>
                  <p className="text-xs font-medium text-slate-400">
                    {onNext ? 'พร้อมไปบทถัดไปแล้ว' : 'คุณเรียนครบส่วนเอกสารนี้แล้ว'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs font-medium text-slate-400">
                เนื้อหานี้เป็นทรัพย์สินของบริษัท ห้ามเผยแพร่หรือนำไปใช้โดยไม่ได้รับอนุญาต
              </p>
            )}
            {completionError && <p className="mt-2 text-xs font-medium text-red-400">{completionError}</p>}
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-nowrap">
            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white whitespace-nowrap transition-colors hover:bg-white/10"
            >
              ปิดเอกสาร
            </button>
            <button
              onClick={handleFinishReading}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-black uppercase tracking-[0.15em] text-white whitespace-nowrap shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  กำลังบันทึก
                </>
              ) : completionReady ? (
                <>
                  {onNext ? 'ไปบทถัดไป' : 'กลับหน้าคอร์ส'}
                  <ArrowRight size={16} />
                </>
              ) : (
                'อ่านจบแล้ว ✓'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocViewer;
