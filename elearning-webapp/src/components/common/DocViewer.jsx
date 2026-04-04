import React, { useEffect, useRef, useState } from 'react';
import { X, FileText, ShieldAlert, Loader2 } from 'lucide-react';
import axios from 'axios';

/**
 * SecureDocViewer — แสดงเอกสาร PDF ภายในแอปโดยไม่ให้ดาวน์โหลดง่ายๆ
 */
const DocViewer = ({ url, title, onClose, onComplete }) => {
  const overlayRef = useRef(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Block Ctrl+S and Ctrl+P
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    
    // Fetch PDF as Blob to bypass Chrome Cross-Origin Block
    const fetchPdf = async () => {
      try {
        setLoading(true);
        const response = await axios.get(url, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const localUrl = URL.createObjectURL(blob);
        // Add #toolbar=0 to the blob URL to suggest hiding the toolbar
        setBlobUrl(`${localUrl}#toolbar=0&navpanes=0&scrollbar=0`);
        setError(null);
      } catch (err) {
        console.error('Error fetching PDF blob:', err);
        setError('ไม่สามารถโหลดเอกสารได้ โปรดลองอีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      if (url.toLowerCase().split('?')[0].endsWith('.pdf') || url.includes('/documents/')) {
        fetchPdf();
      } else {
        // Fallback for non-PDFs (Google Viewer)
        const encoded = encodeURIComponent(url.startsWith('http') ? url : window.location.origin + url);
        setBlobUrl(`https://docs.google.com/viewer?url=${encoded}&embedded=true`);
        setLoading(false);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      // Clean up the blob URL from memory
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl.split('#')[0]);
      }
    };
  }, [url]);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/80 backdrop-blur-md animate-fade-in"
      onContextMenu={(e) => e.preventDefault()}
    >
      <style>{`@media print { .doc-viewer-print-guard { display: none !important; } }`}</style>

      <div className="doc-viewer-print-guard flex flex-col w-full h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/20">
              <FileText size={18} strokeWidth={2} />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{title || 'เอกสารบทเรียน'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldAlert size={11} className="text-amber-400" />
                <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">Protected · ห้ามดาวน์โหลด</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewer Area */}
        <div className="relative flex-1 overflow-hidden bg-slate-800 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-white/60">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium animate-pulse">กำลังเตรียมเอกสารแบบปลอดภัย...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-center max-w-sm">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-white font-bold mb-1">เกิดข้อผิดพลาด</p>
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={onClose} className="mt-4 px-6 py-2 bg-white/10 text-white rounded-xl text-sm font-bold">ปิดหน้าต่าง</button>
            </div>
          ) : (
            <iframe
              src={blobUrl}
              title={title || 'เอกสาร'}
              className="absolute inset-0 w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          )}

          {/* Transparent overlay */}
          <div
            ref={overlayRef}
            className="absolute inset-0 z-10"
            onContextMenu={(e) => e.preventDefault()}
            style={{ pointerEvents: 'none' }}
          />
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 px-6 py-4 bg-slate-900 border-t border-white/10 flex items-center justify-between gap-4">
          <p className="text-slate-400 text-xs font-medium">
            เนื้อหานี้เป็นทรัพย์สินของบริษัท ห้ามเผยแพร่หรือนำไปใช้โดยไม่ได้รับอนุญาต
          </p>
          <button
            onClick={() => { onComplete?.(); onClose(); }}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-sm tracking-[0.15em] uppercase shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            อ่านจบแล้ว ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocViewer;
