import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, Clock, FileText, BookOpen, ChevronRight, ExternalLink } from 'lucide-react';
import { userAPI } from '../../utils/api';
const VideoPlayer = lazy(() => import('../../components/common/VideoPlayer'));
import DocViewer from '../../components/common/DocViewer';

const API_BASE = 'http://localhost:5000';

// Helper to get full URL for uploaded files
const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads')) return `${API_BASE}${url}`;
  return url;
};

const getLessonTypeLabel = (type) => {
  if (type === 'quiz') return 'แบบทดสอบ';
  if (type === 'video') return 'วิดีโอ';
  if (type === 'pdf' || type === 'document' || type === 'article') return 'เอกสาร';
  return 'เอกสาร';
};

const LessonPlayer = () => {
  const { id: courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDocViewer, setShowDocViewer] = useState(false);

  // Quiz State
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await userAPI.getCourseDetails(courseId);
        setCourse(response.data);

        const currentLesson = response.data.lessons.find(l => l.id === lessonId);
        
        // If it's a quiz, fetch questions on demand (not included in course details anymore)
        if (currentLesson?.type === 'quiz') {
          const qRes = await userAPI.getLessonQuestions(lessonId);
          currentLesson.questions = qRes.data;
        }

        setLesson(currentLesson);
        setCompleted(currentLesson?.isCompleted || false);

        if (currentLesson?.lastAttempt) {
          setQuizResult({
            scorePercent: currentLesson.lastAttempt.score,
            passed: currentLesson.lastAttempt.status === 'PASSED',
            passScore: currentLesson.passScore || 60
          });
        }
      } catch (error) {
        console.error('Fetch lesson error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [courseId, lessonId]);

  const handleComplete = async () => {
    if (updating || completed) return;
    try {
      setUpdating(true);
      await userAPI.updateProgress(lessonId, 100);
      setCompleted(true);
    } catch (error) {
      console.error('Update progress error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (Object.keys(answers).length < (lesson.questions?.length || 0)) {
      alert("กรุณาตอบคำถามให้ครบทุกข้อ");
      return;
    }
    
    try {
      setUpdating(true);
      const res = await userAPI.submitQuiz(lessonId, { answers });
      setQuizResult(res.data);
      if (res.data.isCompleted) {
        setCompleted(true);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการส่งคำตอบ");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const nextLessonId = course?.lessons?.find((l, idx, arr) => {
    const currentIdx = arr.findIndex(item => item.id === lessonId);
    return idx === currentIdx + 1;
  })?.id;

  if (loading || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-r-2 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto md:px-4 md:py-6 relative min-h-screen pb-24 md:pb-12">
      
      {/* Immersive Header / Media Section */}
      <div className="relative z-20 w-full overflow-hidden bg-slate-950 shadow-[0_34px_80px_-40px_rgba(15,23,42,0.8)] md:rounded-[2.5rem]">
        {/* Back Button Overlay - Floating Glass */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-50">
          <button
            onClick={() => navigate(`/user/courses/${courseId}`)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-[0_18px_30px_-18px_rgba(15,23,42,0.85)] backdrop-blur-xl transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Media Content */}
        <div className={`${lesson.type === 'quiz' ? '' : 'aspect-video'} w-full`}>
          {lesson.type === 'video' ? (
            <Suspense fallback={
              <div className="w-full aspect-video bg-slate-900 flex items-center justify-center rounded-2xl">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            }>
              <VideoPlayer
                key={lesson.contentUrl}
                url={lesson.contentUrl?.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                onEnded={handleComplete}
              />
            </Suspense>
          ) : lesson.type === 'quiz' ? (
            <div className="relative flex flex-col items-center gap-6 overflow-hidden px-6 py-20 text-center text-white md:py-32">
              <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#020617_100%)]"></div>
              <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_rgba(79,70,229,0.22),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(20,184,166,0.14),_transparent_26%)]"></div>
              
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/10 text-primary shadow-[0_24px_60px_-32px_rgba(79,70,229,0.45)] backdrop-blur-2xl">
                 <FileText size={48} strokeWidth={1} />
              </div>
              <div className="relative z-10 max-w-lg">
                 <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tighter">แบบทดสอบท้ายบท</h2>
                 <p className="text-slate-400 text-lg font-medium leading-relaxed">ทดสอบความเข้าใจของคุณเกี่ยวกับบทเรียนนี้ เพื่อปลดล็อกเนื้อหาถัดไป</p>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center gap-8 overflow-hidden bg-slate-950 py-20 text-center md:py-32">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.15),_transparent_35%)]"></div>
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-primary shadow-[0_24px_60px_-32px_rgba(79,70,229,0.45)] backdrop-blur-xl">
                <BookOpen size={40} strokeWidth={1.5} />
              </div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-2">บทเรียนเอกสาร</p>
                {/* Primary: Open in secure in-app viewer */}
                <button
                  onClick={() => setShowDocViewer(true)}
                  className="btn btn-primary rounded-2xl px-10 py-4 text-base shadow-[0_18px_36px_-18px_rgba(79,70,229,0.55)] hover:scale-[1.02] flex items-center gap-2"
                >
                  <FileText size={18} /> เปิดอ่านเอกสารบทเรียน
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secure Doc Viewer Modal */}
      {showDocViewer && lesson?.contentUrl && (
        <DocViewer
          url={getFullUrl(lesson.contentUrl)}
          title={lesson.title}
          onClose={() => setShowDocViewer(false)}
          onComplete={handleComplete}
        />
      )}

      {/* Unified Content Container - Premium & Professional */}
      <div className="relative z-30 -mt-8 overflow-hidden bg-white md:mt-8 md:rounded-[3rem] md:border md:border-slate-100 md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
        
        <div className="px-6 py-10 md:p-12">
          {/* Lesson Metadata & Title */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="flex items-center gap-1.5 px-3 py-2 bg-primary/5 text-primary rounded-lg text-xs font-black uppercase tracking-[0.2em] border border-primary/10">
                  {lesson.type === 'video' ? (
                    <Play size={14} fill="currentColor"/> 
                  ) : lesson.type === 'quiz' ? (
                    <CheckCircle size={14}/>
                  ) : (
                    <FileText size={14}/>
                  )} {getLessonTypeLabel(lesson.type)}
                </span>
                <span className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  <Clock size={14}/> {lesson.duration || '10'}m
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">{lesson.title}</h1>
            </div>
            
            {completed && (
              <div className="flex items-center gap-3 bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-sm animate-fade-in shrink-0 self-start md:self-auto">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <CheckCircle size={14} strokeWidth={3} />
                </div>
                <span className="text-sm font-black text-emerald-700 uppercase tracking-wider">เรียนจบแล้ว</span>
              </div>
            )}
          </div>

          <div className="mb-12 h-px w-full bg-slate-100"></div>

          {/* Main Content Area Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              {lesson.type === 'quiz' ? (
                <div className="flex flex-col gap-8">
                  {!quizResult && (
                    <div className="group relative flex items-start gap-5 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-7 shadow-[0_26px_60px_-38px_rgba(15,23,42,0.95)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0 font-black border border-primary/20 relative z-10">i</div>
                      <div className="relative z-10">
                        <p className="font-bold text-white mb-1">เกณฑ์การผ่าน</p>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">คุณต้องได้คะแนนอย่างน้อย {lesson.passScore || 60}% ({Math.ceil((lesson.passScore || 60)/100 * (lesson.questions?.length || 0))} ข้อ) จากทั้งหมด {lesson.questions?.length || 0} ข้อ เพื่อผ่านบทเรียนนี้</p>
                      </div>
                    </div>
                  )}

                  {quizResult && (
                    <div className={`p-12 rounded-[3rem] border-2 transition-all duration-500 animate-celebrate shadow-2xl flex flex-col items-center gap-5 text-center ${
                      quizResult.passed ? 'bg-white border-emerald-100' : 'bg-red-50/30 border-red-100'
                    }`}>
                       <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-white shadow-2xl mb-2 ${quizResult.passed ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200'}`}>
                          {quizResult.passed ? <CheckCircle size={48} strokeWidth={2}/> : <div className="text-4xl font-black">!</div>}
                       </div>
                       <div>
                         <h3 className={`text-4xl font-black tracking-tighter mb-2 ${quizResult.passed ? 'text-emerald-600' : 'text-red-700'}`}>
                           {quizResult.passed ? 'ยอดเยี่ยมมาก!' : 'เกือบผ่านแล้ว!'}
                         </h3>
                         <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">คะแนนของคุณ</p>
                       </div>
                       <div className="bg-slate-50 px-10 py-5 rounded-[2rem] border border-slate-100 mt-4">
                          <p className="text-7xl font-black text-slate-900 tracking-tighter">{quizResult.scorePercent}%</p>
                       </div>
                       
                       <button onClick={() => { setQuizResult(null); setAnswers({}); }} className="mt-8 px-12 py-4.5 rounded-2xl font-black transition-all border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-600 text-base tracking-widest uppercase">
                         {quizResult.passed ? 'ตรวจคำตอบ' : 'ทำควิซอีกครั้ง'}
                       </button>
                    </div>
                  )}

                  <div className="flex flex-col gap-6">
                    {lesson.questions?.map((q, idx) => {
                      const isSubmitted = !!quizResult;
                      const userA = answers[q.id];
                      const correctA = quizResult?.correctAnswers?.[q.id];
                      const isCorrect = userA === correctA;
                      const isWrong = userA && userA !== correctA;
                      
                      return (
                        <div key={q.id} className={`bg-white border-[1.5px] rounded-[2.5rem] p-8 md:p-10 transition-all ${isSubmitted && isWrong ? 'border-red-100 bg-red-50/5' : isSubmitted && isCorrect ? 'border-emerald-100 bg-emerald-50/5' : 'border-slate-100 hover:border-slate-200'}`}>
                          <div className="flex justify-between items-start mb-10">
                            <h4 className="text-xl font-bold text-slate-900 leading-relaxed flex gap-5">
                              <span className="shrink-0 w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-slate-200">{idx + 1}</span>
                              {q.text}
                            </h4>
                          </div>
                          <div className="flex flex-col gap-3.5">
                            {q.choices.map(c => {
                              let choiceState = "normal";
                              if (isSubmitted) {
                                if (c.id === correctA) choiceState = "correct";
                                else if (c.id === userA) choiceState = "wrong";
                                else choiceState = "untouched";
                              } else if (userA === c.id) {
                                choiceState = "selected";
                              }

                              return (
                                <label
                                  key={c.id}
                                  onClick={() => !isSubmitted && setAnswers({ ...answers, [q.id]: c.id })}
                                  className={`flex items-center gap-5 p-5 md:p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                                    choiceState === "selected" ? "border-primary bg-primary/5 shadow-[0_10px_30px_rgba(79,70,229,0.1)]" :
                                    choiceState === "correct" ? "border-emerald-500 bg-emerald-50 text-emerald-900" :
                                    choiceState === "wrong" ? "border-red-400 bg-red-50 text-red-900 opacity-90" :
                                    choiceState === "untouched" ? "border-slate-50 bg-slate-50/50 opacity-40 grayscale" :
                                    "border-slate-50 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
                                  } hover:translate-x-1 active:scale-[0.98] group/choice`}
                                >
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                    choiceState === "selected" ? "border-primary bg-primary text-white" :
                                    choiceState === "correct" ? "border-emerald-500 bg-emerald-500 text-white" :
                                    choiceState === "wrong" ? "border-red-400 bg-red-400 text-white" :
                                    "border-slate-300 bg-white group-hover/choice:border-slate-400"
                                  }`}>
                                    {choiceState === "selected" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    {choiceState === "correct" && <CheckCircle size={14} strokeWidth={3} />}
                                    {choiceState === "wrong" && <span className="text-[10px] font-black">X</span>}
                                  </div>
                                  <span className={`text-[15px] font-medium leading-tight ${choiceState === 'normal' ? 'text-slate-600' : 'text-slate-900 font-black'}`}>{c.text}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Submit Button */}
                  {!quizResult && (
                    <div className="hidden md:flex justify-end mt-4">
                      <button
                        onClick={handleQuizSubmit}
                        disabled={updating || Object.keys(answers).length < (lesson.questions?.length || 0)}
                        className="px-12 py-5 bg-primary text-white rounded-2xl font-black text-sm tracking-[0.2em] uppercase shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {updating ? 'กำลังตรวจ...' : 'ส่งคำตอบควิซ →'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose prose-slate prose-lg max-w-none">
                  <p className="text-xl text-slate-600 leading-[1.8] whitespace-pre-wrap font-medium">
                    {lesson.content || 'เนื้อหาเพิ่มเติมสำหรับบทเรียนนี้...'}
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Achievement Card - "Exclusive Looking" */}
              {completed && (
                <div className="relative overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-12 text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] animate-celebrate">
                  <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[80px]"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-200 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                      <CheckCircle size={40} strokeWidth={2} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">ทำสำเร็จแล้ว!</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 px-2">คุณผ่านบทเรียนนี้อย่างยอดเยี่ยม พร้อมสำหรับความท้าทายถัดไปหรือยัง?</p>
                    
                    {nextLessonId ? (
                      <button
                        onClick={() => navigate(`/user/courses/${courseId}/lesson/${nextLessonId}`)}
                        className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black text-base tracking-[0.2em] uppercase hover:bg-primary transition-all shadow-2xl shadow-slate-200 active:scale-95"
                      >
                        เรียนบทถัดไป →
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/user/courses/${courseId}`)}
                        className="w-full py-6 bg-slate-100 text-slate-900 rounded-[1.5rem] font-black text-base tracking-[0.2em] uppercase hover:bg-slate-200 transition-all active:scale-95"
                      >
                        กลับสู่คอร์สเรียน
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Resources Column */}
              {lesson.resources && lesson.resources.length > 0 && (
                <div className="sticky top-8 rounded-3xl border border-slate-100 bg-slate-50 p-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2.5">
                    <div className="w-2 h-2 bg-primary rounded-full"></div> เอกสารเสริม
                  </h4>
                  <div className="flex flex-col gap-3.5">
                    {lesson.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:shadow-2xl hover:translate-y-[-2px] transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                            <FileText size={20} strokeWidth={2.5}/>
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 line-clamp-1">{res.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{res.size || 'ลิงก์ภายนอก'}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex gap-3 border-t border-slate-100 bg-white/90 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl animate-fade-in md:hidden">
        {completed && nextLessonId ? (
          <button
            onClick={() => navigate(`/user/courses/${courseId}/lesson/${nextLessonId}`)}
            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[13px] tracking-widest uppercase shadow-xl"
          >
            เริ่มบทถัดไป
          </button>
        ) : lesson.type === 'quiz' && !quizResult ? (
          <button
            onClick={handleQuizSubmit}
            disabled={updating || Object.keys(answers).length < (lesson.questions?.length || 0)}
            className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[13px] tracking-widest uppercase shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {updating ? 'กำลังตรวจ...' : 'ส่งคำตอบ'}
          </button>
        ) : !completed && lesson.type !== 'quiz' ? (
          <button
            onClick={handleComplete}
            disabled={updating}
            className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[13px] tracking-widest uppercase shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} strokeWidth={2.5} /> {updating ? 'กำลังบันทึก...' : 'เรียนจบแล้ว'}
          </button>
        ) : quizResult && !quizResult?.passed ? (
          <button
            onClick={() => { setQuizResult(null); setAnswers({}); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-[13px] tracking-widest uppercase shadow-xl"
          >
            ลองทำใหม่อีกครั้ง
          </button>
        ) : (
          <button
            onClick={() => navigate(`/user/courses/${courseId}`)}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[13px] tracking-widest uppercase"
          >
            กลับสู่หน้ารายละเอียด
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonPlayer;
