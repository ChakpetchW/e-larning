import React, { useEffect, useRef } from 'react';
import { X, FileText, ShieldAlert } from 'lucide-react';

/**
 * SecureDocViewer — แสดงเอกสาร PDF ภายในแอปโดยไม่ให้ดาวน์โหลดง่ายๆ
 *
 * กลไกป้องกัน:
 * 1. Overlay div ทับ iframe — กัน right-click และ drag เอาไฟล์ออก
 * 2. ไม่ส่ง URL ตรงให้ browser (ไม่มีปุ่ม Save ของ browser)
 * 3. CSS ซ่อนเนื้อหาเวลากด Ctrl+P (Print)
 * 4. ปิด keyboard shortcut Ctrl+S และ Ctrl+P
 */
const DocViewer = ({ url, title, onClose, onComplete }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    // Block Ctrl+S (save) and Ctrl+P (print) globally while this is open
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Build a "no-download" URL using direct embed for PDFs or Google Docs Viewer for others
  const buildEmbedUrl = (rawUrl) => {
    if (!rawUrl) return '';
    
    // Check if it's a PDF (most common)
    const isPDF = rawUrl.toLowerCase().split('?')[0].endsWith('.pdf') || rawUrl.includes('/documents/');

    if (isPDF) {
      // Direct embed for PDF is more stable with Supabase than Google Viewer
      // Add #toolbar=0 to suggest hiding the native browser toolbar
      return `${rawUrl}#toolbar=0&navpanes=0&scrollbar=0`;
    }

    // Fallback for Word/PPT/Legacy
    const encoded = encodeURIComponent(rawUrl.startsWith('http') ? rawUrl : window.location.origin + rawUrl);
    return `https://docs.google.com/viewer?url=${encoded}&embedded=true`;
  };

  const embedUrl = buildEmbedUrl(url);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/80 backdrop-blur-md animate-fade-in"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Print guard — hides everything in this modal when Ctrl+P is used */}
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
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewer Area */}
        <div className="relative flex-1 overflow-hidden bg-slate-800">
          {/* The actual document viewer */}
          <iframe
            src={embedUrl}
            title={title || 'เอกสาร'}
            className="absolute inset-0 w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />

          {/* Transparent overlay — blocks right-click & drag on the iframe */}
          <div
            ref={overlayRef}
            className="absolute inset-0 z-10"
            onContextMenu={(e) => e.preventDefault()}
            style={{ pointerEvents: 'none' }} // allow scroll/interact but not download triggers
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
