import React, { Suspense, lazy } from 'react';
import { ArrowLeft, Play, FileText, CheckCircle, BookOpen } from 'lucide-react';

const VideoPlayer = lazy(() => import('../common/VideoPlayer'));

const LessonMedia = ({
  lesson,
  courseId,
  isNavigatingAway,
  lessonMediaUrl,
  handleComplete,
  handleReturnToCourse,
  handleOpenDocument,
  openingDocument,
  hasProtectedDocument
}) => {
  return (
    <div className={`relative w-full overflow-hidden shadow-[0_34px_80px_-40px_rgba(15,23,42,0.8)] md:rounded-[2.5rem] md:aspect-video ${lesson.type !== 'video' ? 'bg-[#060912]' : ''}`}>
      {lesson.type !== 'video' && (
        <>
          <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#020617_100%)]"></div>
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_rgba(79,70,229,0.22),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(20,184,166,0.14),_transparent_26%)]"></div>
        </>
      )}

      {/* Back Button Overlay */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-50">
        <button
          onClick={handleReturnToCourse}
          className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-white/20 bg-white/20 text-white shadow-[0_18px_30px_-18px_rgba(15,23,42,0.85)] backdrop-blur-xl transition-all hover:bg-white/30 hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Media Content */}
      <div className={`${lesson.type === 'video' ? 'aspect-video' : ''} w-full h-full`}>
        {lesson.type === 'video' ? (
          isNavigatingAway ? (
            <div className="flex aspect-video w-full h-full items-center justify-center bg-slate-950">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          ) : (
            <Suspense fallback={
              <div className="w-full aspect-video h-full bg-slate-900 flex items-center justify-center rounded-2xl">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            }>
              <VideoPlayer
                key={lessonMediaUrl}
                url={lessonMediaUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                onEnded={handleComplete}
              />
            </Suspense>
          )
        ) : lesson.type === 'quiz' ? (
          <div className="relative flex min-h-full flex-col items-center justify-center gap-6 px-6 py-20 text-center text-white md:py-32">
            <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/10 text-primary shadow-[0_24px_60px_-32px_rgba(79,70,229,0.45)] backdrop-blur-2xl">
               <FileText size={48} strokeWidth={1} />
            </div>
            <div className="relative z-10 max-w-lg">
               <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tighter">แบบทดสอบท้ายบท</h2>
               <p className="text-slate-400 text-lg font-medium leading-relaxed">ทดสอบความเข้าใจของคุณเกี่ยวกับบทเรียนนี้ เพื่อปลดล็อกเนื้อหาถัดไป</p>
            </div>
          </div>
        ) : (
          <div className="relative flex min-h-full flex-col items-center justify-center gap-8 py-20 text-center md:py-32">
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-primary shadow-[0_24px_60px_-32px_rgba(79,70,229,0.45)] backdrop-blur-xl">
              <BookOpen size={40} strokeWidth={1.5} />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <p className="mb-2 inline-flex items-center rounded-full border border-primary/30 bg-primary/15 px-4 py-2 text-sm font-black tracking-[0.04em] text-primary-light shadow-[0_16px_32px_-24px_rgba(79,70,229,0.85)]">
                เอกสารประกอบ
              </p>
              <button
                onClick={handleOpenDocument}
                disabled={openingDocument || !hasProtectedDocument}
                className="btn btn-primary rounded-2xl px-10 py-4 text-base shadow-[0_18px_36px_-18px_rgba(79,70,229,0.55)] hover:scale-[1.02] flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              >
                <FileText size={18} /> เปิดเอกสารประกอบ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonMedia;
