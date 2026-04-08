import React, { useEffect, useRef, useState } from 'react';
import { X, FileText, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import ModalPortal from './ModalPortal';

/**
 * SecureDocViewer - แสดงเอกสารภายในแอป โดยหลีกเลี่ยงการสร้าง blob URL
 * เพราะ Chrome บน production บางกรณีจะไม่ยอมโหลด blob: ภายใน iframe
 */
const DocViewer = ({
  url,
  title,
  onClose,
  onComplete,
  onRefreshUrl,
  isCompleted = false,
}) => {
  const overlayRef = useRef(null);
  const [viewerUrl, setViewerUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [completionReady, setCompletionReady] = useState(Boolean(isCompleted));
  const [completionError, setCompletionError] = useState('');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const loadTimeoutRef = useRef(null);

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
    setIframeLoaded(false);
    setHasTimedOut(false);
    setLoading(false);

    // Set a timeout to detect if the iframe is stuck (black screen)
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = setTimeout(() => {
      if (!iframeLoaded) {
        setHasTimedOut(true);
      }
    }, 10000); // 10 seconds timeout

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, [url]);

  const handleClose = async () => {
    if (submitting) return;

    // If already completed, just close
    if (completionReady) {
      onClose();
      return;
    }

    // Try to mark as complete on close for Desktop (where footer is hidden)
    // or if the user clicks X on mobile
    try {
      setSubmitting(true);
      await onComplete?.();
      onClose();
    } catch (err) {
      console.error('Auto-complete on close error:', err);
      onClose(); // Still close even if completion fails
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishReading = async () => {
    if (submitting) return;

    if (completionReady) {
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
      onClose(); // Automatically close after marking complete if requested
    } catch (completionRequestError) {
      console.error('Complete document lesson error:', completionRequestError);
      setCompletionError('ไม่สามารถบันทึกความคืบหน้าได้ โปรดลองอีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryLoad = async () => {
    setHasTimedOut(false);
    setIframeLoaded(false);
    setError(null);

    if (typeof onRefreshUrl === 'function') {
      setLoading(true);

      try {
        const refreshedUrl = await onRefreshUrl();

        if (!refreshedUrl) {
          setLoading(false);
          setError('ไม่สามารถเชื่อมต่อเอกสารได้ในขณะนี้');
        }
      } catch (refreshError) {
        console.error('Refresh document access error:', refreshError);
        setLoading(false);
        setError('ไม่สามารถเชื่อมต่อเอกสารได้ในขณะนี้');
      }
    } else {
      setViewerUrl((currentUrl) => currentUrl);
    }
  };

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const isGoogleViewer = viewerUrl.includes('docs.google.com/viewer');

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex flex-col bg-black animate-fade-in overflow-hidden h-[100dvh]"
        onContextMenu={(event) => event.preventDefault()}
      >
      <style>{`@media print { .doc-viewer-print-guard { display: none !important; } }`}</style>

      <div className="doc-viewer-print-guard flex h-full w-full flex-col overflow-hidden">
        {/* Header */}
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
            onClick={handleClose}
            disabled={submitting}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:scale-105 hover:bg-white/20 active:scale-95 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <X size={18} />}
          </button>
        </div>

        {/* Content Area */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-slate-900">
          {loading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-slate-950/80 backdrop-blur-md transition-opacity">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium animate-pulse text-white/80">กำลังเตรียมเอกสารแบบปลอดภัย...</p>
            </div>
          )}

          {!iframeLoaded && !loading && (
            <div className={`absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 transition-opacity ${hasTimedOut ? 'bg-slate-950/50' : ''}`}>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium animate-pulse text-white/80">กำลังโหลดเอกสาร...</p>
              
              {hasTimedOut && (
                <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center px-6">
                    <p className="text-sm font-bold text-white mb-1">หน้าจอค้างหรือไม่ยอมโหลด?</p>
                    <p className="text-xs text-white/50">บริการพรีวิวอาจใช้เวลานานกว่าปกติ</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleRetryLoad}
                      className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                    >
                      ลองโหลดใหม่
                    </button>
                    <button
                      onClick={handleClose}
                      className="relative rounded-xl bg-primary px-4 py-2 text-xs font-bold text-transparent shadow-lg"
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-white">ปิดเอกสาร</span>
                      เปิดไฟล์โดยตรง
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error ? (
            <div className="max-w-sm rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center">
              <ShieldAlert className="mx-auto mb-3 h-12 w-12 text-red-500" />
              <p className="mb-1 font-bold text-white">เกิดข้อผิดพลาด</p>
              <p className="text-sm text-red-400">{error}</p>
              <button onClick={onClose} className="mt-4 rounded-xl bg-white/10 px-6 py-2 text-sm font-bold text-white">
                ปิดหน้าต่าง
              </button>
            </div>
          ) : (
            <div className={`absolute inset-0 h-full w-full overflow-hidden transition-opacity duration-700 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <iframe
                src={viewerUrl}
                onLoad={() => {
                  setIframeLoaded(true);
                  if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
                }}
                title={title || 'เอกสาร'}
                style={isGoogleViewer ? {
                  position: 'absolute',
                  top: '-50px',
                  left: 0,
                  width: '100%',
                  height: 'calc(100% + 50px)',
                  border: 'none'
                } : {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div
            ref={overlayRef}
            className="absolute inset-0 z-10"
            onContextMenu={(event) => event.preventDefault()}
            style={{ pointerEvents: 'none' }}
          />
        </div>

        {/* Footer - Compact Single Button (Mobile Only) */}
        <div className="flex md:hidden shrink-0 flex-col border-t border-white/10 bg-slate-950 p-6 pb-8 md:p-8">
          <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
             {completionError && <p className="text-center text-xs font-medium text-red-400">{completionError}</p>}
             
             <button
               onClick={handleFinishReading}
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
      </div>
      </div>
    </ModalPortal>
  );
};

export default DocViewer;
