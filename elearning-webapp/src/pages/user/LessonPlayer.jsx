import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Play, CheckCircle, Clock, FileText, BookOpen, ChevronRight } from 'lucide-react';
import { userAPI, getFullUrl } from '../../utils/api';
const VideoPlayer = lazy(() => import('../../components/common/VideoPlayer'));
import DocViewer from '../../components/common/DocViewer';

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
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  // Quiz State
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [shouldScrollToQuizResult, setShouldScrollToQuizResult] = useState(false);
  const quizResultRef = useRef(null);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        setShowDocViewer(false);
        setIsNavigatingAway(false);
        setAnswers({});
        setQuizResult(null);
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

  useEffect(() => {
    if (!shouldScrollToQuizResult || !quizResult || lesson?.type !== 'quiz') return;

    window.requestAnimationFrame(() => {
      quizResultRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setShouldScrollToQuizResult(false);
    });
  }, [lesson?.type, quizResult, shouldScrollToQuizResult]);

  const syncCompletedLessonState = () => {
    setLesson((currentLesson) => (
      currentLesson ? { ...currentLesson, isCompleted: true } : currentLesson
    ));

    setCourse((currentCourse) => {
      if (!currentCourse?.lessons?.length) {
        return currentCourse;
      }

      const updatedLessons = currentCourse.lessons.map((item) => (
        item.id === lessonId
          ? { ...item, isCompleted: true, progress: { ...(item.progress || {}), progress: 100 } }
          : item
      ));

      const completedCount = updatedLessons.filter((item) => item.isCompleted).length;
      const progressPercent = Math.round((completedCount / updatedLessons.length) * 100);

      return {
        ...currentCourse,
        lessons: updatedLessons,
        progressPercent,
      };
    });
  };

  const handleComplete = async () => {
    if (updating) return false;
    if (completed) return true;

    try {
      setUpdating(true);
      await userAPI.updateProgress(lessonId, 100);
      setCompleted(true);
      syncCompletedLessonState();
      return true;
    } catch (error) {
      console.error('Update progress error:', error);
      return false;
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
      setShouldScrollToQuizResult(true);
      if (res.data.isCompleted) {
        setCompleted(true);
        syncCompletedLessonState();
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการส่งคำตอบ");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-[#0A0A0A]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const nextLessonId = course?.lessons?.find((l, idx, arr) => {
    const currentIdx = arr.findIndex(item => item.id === lessonId);
    return idx === currentIdx + 1;
  })?.id;
  const currentLessonIndex = course?.lessons?.findIndex((item) => item.id === lessonId) ?? -1;
  const nextLesson = currentLessonIndex >= 0 ? course?.lessons?.[currentLessonIndex + 1] : null;
  const totalLessons = course?.lessons?.length || 0;
  const completedLessonsCount = course?.lessons?.filter((item) => item.isCompleted).length || 0;
  const lessonMediaUrl = getFullUrl(lesson.contentUrl?.trim());
  const hasResources = Array.isArray(lesson.resources) && lesson.resources.length > 0;
  const showAchievementCard = course?.showAchievementCard === true;
  const quizRewardPoints = Number(lesson?.points) || 0;
  const canEarnQuizPoints = lesson?.type === 'quiz' && quizRewardPoints > 0;

  const navigateToPath = (path, options = {}) => {
    if (!path) return;

    setShowDocViewer(false);
    setIsNavigatingAway(true);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    window.requestAnimationFrame(() => {
      navigate(path, options);
    });
  };

  const handleNavigateToNextLesson = () => {
    if (!nextLessonId) return;
    navigateToPath(`/user/courses/${courseId}/lesson/${nextLessonId}`);
  };

  const handleReturnToCourse = () => {
    navigateToPath(`/user/courses/${courseId}`, { replace: true });
  };

  if (loading || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-r-2 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto md:px-4 md:py-6 relative min-h-screen pb-12 bg-white md:bg-transparent">
      
      {/* Immersive Header / Media Section - Cinemascope Mode */}
      <div className={`relative w-full overflow-hidden shadow-[0_34px_80px_-40px_rgba(15,23,42,0.8)] md:rounded-[2.5rem] md:aspect-video ${lesson.type !== 'video' ? 'bg-slate-950' : ''}`}>
        {/* Back Button Overlay - Compact & Accessible */}
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
                <p className="mb-2 inline-flex items-center rounded-full border border-primary/30 bg-primary/15 px-4 py-2 text-sm font-black tracking-[0.04em] text-primary-light shadow-[0_16px_32px_-24px_rgba(79,70,229,0.85)]">
                  เอกสารประกอบ
                </p>
                {/* Primary: Open in secure in-app viewer */}
                <button
                  onClick={() => setShowDocViewer(true)}
                  className="btn btn-primary rounded-2xl px-10 py-4 text-base shadow-[0_18px_36px_-18px_rgba(79,70,229,0.55)] hover:scale-[1.02] flex items-center gap-2"
                >
                  <FileText size={18} /> เปิดเอกสารประกอบ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secure Doc Viewer Modal */}
      {showDocViewer && lesson?.contentUrl && (
        <DocViewer
          url={lessonMediaUrl}
          title={lesson.title}
          onClose={() => setShowDocViewer(false)}
          onComplete={handleComplete}
          isCompleted={completed}
          onNext={nextLessonId ? handleNavigateToNextLesson : undefined}
          onReturnToCourse={handleReturnToCourse}
        />
      )}

      {/* Flattened Content Container - Optimized for Content Flow */}
      <div className="bg-white md:mt-8 md:overflow-hidden md:rounded-[3.5rem] md:border md:border-slate-100 md:shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)]">
        
        <div className="px-6 py-10 md:p-14">
          {/* Lesson Metadata & Title */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 md:mb-10">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="flex items-center gap-1.5 rounded-lg border border-primary/10 bg-primary/5 px-3 py-2 text-xs font-black tracking-[0.04em] text-primary">
                  {lesson.type === 'video' ? (
                    <Play size={14} fill="currentColor"/> 
                  ) : lesson.type === 'quiz' ? (
                    <CheckCircle size={14}/>
                  ) : (
                    <FileText size={14}/>
                  )} {getLessonTypeLabel(lesson.type)}
                </span>
                <span className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-black tracking-[0.04em] text-slate-600">
                  <Clock size={14}/> {lesson.duration || '10'}m
                </span>
              </div>
              <h1 className="text-[22px] md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-[1.2]">{lesson.title}</h1>
            </div>
            
            {completed && (
              <div className="flex items-center gap-3 bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-sm animate-fade-in shrink-0 self-start md:self-auto">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <CheckCircle size={14} strokeWidth={3} />
                </div>
                <span className="text-sm font-black tracking-[0.04em] text-emerald-800">เรียนจบแล้ว</span>
              </div>
            )}
          </div>

          <div className="mb-6 md:mb-12 h-px w-full bg-slate-100"></div>

          {/* Main Content Area Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className={hasResources ? 'lg:col-span-8' : 'lg:col-span-12'}>
              {lesson.type === 'quiz' ? (
                <div className="flex flex-col gap-8">
                  {!quizResult && (
                    <div className="group relative flex items-start gap-5 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-7 shadow-[0_26px_60px_-38px_rgba(15,23,42,0.95)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0 font-black border border-primary/20 relative z-10">i</div>
                      <div className="relative z-10">
                        {canEarnQuizPoints && (
                          <p className="mb-3 inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-black tracking-[0.04em] text-amber-300">
                            ผ่านครั้งแรก รับ {quizRewardPoints.toLocaleString()} แต้ม
                          </p>
                        )}
                        <p className="font-bold text-white mb-1">เกณฑ์การผ่าน</p>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">คุณต้องได้คะแนนอย่างน้อย {lesson.passScore || 60}% ({Math.ceil((lesson.passScore || 60)/100 * (lesson.questions?.length || 0))} ข้อ) จากทั้งหมด {lesson.questions?.length || 0} ข้อ เพื่อผ่านบทเรียนนี้</p>
                      </div>
                    </div>
                  )}

                  {quizResult && (
                    <div ref={quizResultRef} className={`p-12 rounded-[3.5rem] border-2 transition-all duration-500 animate-celebrate shadow-2xl flex flex-col items-center gap-5 text-center ${
                      quizResult.passed ? 'bg-white border-emerald-100' : 'bg-red-50/30 border-red-100'
                    }`}>
                       <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl mb-2 ${quizResult.passed ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200'}`}>
                          {quizResult.passed ? <CheckCircle size={48} strokeWidth={2}/> : <div className="text-4xl font-black">!</div>}
                       </div>
                       <div>
                         <h3 className={`text-4xl font-black tracking-tighter mb-2 ${quizResult.passed ? 'text-emerald-600' : 'text-red-700'}`}>
                           {quizResult.passed ? 'ยอดเยี่ยมมาก!' : 'เกือบผ่านแล้ว!'}
                         </h3>
                          <p className="text-xs font-bold tracking-[0.04em] text-slate-500">คะแนนของคุณ</p>
                       </div>
                       <div className="bg-slate-50 px-10 py-5 rounded-[2.5rem] border border-slate-100 mt-4">
                          <p className="text-7xl font-black text-slate-900 tracking-tighter">{quizResult.scorePercent}%</p>
                       </div>
                       
                       {quizResult.passed && (
                         <div className="mt-2 flex flex-col items-center gap-2">
                           {quizResult.earnedQuizPoints > 0 && (
                             <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
                               +{quizResult.earnedQuizPoints.toLocaleString()} แต้มจากแบบทดสอบ
                             </div>
                           )}
                           {quizResult.earnedCoursePoints > 0 && (
                             <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-black text-primary ring-1 ring-primary/10">
                               +{quizResult.earnedCoursePoints.toLocaleString()} แต้มจากการเรียนจบคอร์ส
                             </div>
                           )}
                           {quizResult.earnedPoints === 0 && canEarnQuizPoints && (
                             <p className="text-xs font-bold text-slate-400">แต้มแบบทดสอบจะได้รับเฉพาะตอนผ่านครั้งแรกเท่านั้น</p>
                           )}
                         </div>
                       )}

                        <button onClick={() => { setQuizResult(null); setAnswers({}); }} className="mt-8 rounded-2xl border border-slate-200 px-12 py-4.5 text-sm font-black tracking-[0.04em] text-slate-600 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white">
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
                    <div className="flex justify-center mt-8 px-6 md:px-0">
                      <button
                        onClick={handleQuizSubmit}
                        disabled={updating || Object.keys(answers).length < (lesson.questions?.length || 0)}
                        className="w-full rounded-2xl bg-primary py-5 text-sm font-black tracking-[0.04em] text-white shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 md:w-auto md:px-16"
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

              {!completed && lesson.type !== 'quiz' && (
                <section className="mt-12 -mx-6 border-y border-slate-100 bg-slate-50/70 p-6 md:mx-0 md:rounded-[2.5rem] md:border md:bg-white md:p-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.04em] text-slate-500">พร้อมไปต่อ</p>
                      <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                        {lesson.type === 'video' ? 'ดูจบแล้วกดทำเครื่องหมายบทเรียนนี้' : 'อ่านจบแล้วกดทำเครื่องหมายบทเรียนนี้'}
                      </h3>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                        เมื่อทำบทเรียนนี้เสร็จ ระบบจะอัปเดตความคืบหน้าให้ และถ้ามีบทถัดไปจะแสดงปุ่มไปต่อทันที
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-nowrap">
                      <button
                        onClick={handleReturnToCourse}
                        className="inline-flex items-center justify-center rounded-[1.25rem] border-2 border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-700 whitespace-nowrap transition-all hover:bg-slate-50 active:scale-95"
                      >
                        กลับหน้าคอร์ส
                      </button>
                      <button
                        onClick={handleComplete}
                        disabled={updating}
                        className="inline-flex items-center justify-center gap-3 rounded-[1.25rem] bg-slate-900 px-7 py-4 text-sm font-black text-white whitespace-nowrap shadow-[0_20px_40px_-10px_rgba(15,23,42,0.4)] transition-all hover:bg-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updating ? 'กำลังบันทึก...' : 'ฉันเรียนเสร็จแล้ว'}
                        <CheckCircle size={18} strokeWidth={2.6} />
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {completed && (
                <section className="mt-12 -mx-6 md:mx-0 md:rounded-[3rem] border-y md:border-x border-emerald-100 bg-emerald-50/40 md:bg-white p-8 md:p-12 transition-all duration-300 shadow-sm">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-center md:items-start gap-4 md:gap-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_15px_30px_-8px_rgba(16,185,129,0.4)]">
                          <CheckCircle className="h-6 w-6" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-2xl font-black tracking-tight text-slate-900 md:text-[2.25rem]">
                            เรียนบทนี้แล้ว
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-10 md:gap-8 self-center md:self-start w-full md:w-auto border-t border-emerald-100/50 pt-6 md:border-0 md:pt-0">
                        <div className="flex flex-col items-center md:items-start">
                          <p className="text-[10px] md:text-[11px] font-black tracking-[0.04em] text-slate-500 uppercase">คืบหน้า</p>
                          <div className="mt-1 flex items-baseline gap-1">
                             <span className="text-2xl font-black text-slate-900">{Math.min(completedLessonsCount, totalLessons)}</span>
                             <span className="text-sm font-bold text-slate-400">/ {totalLessons} บท</span>
                          </div>
                        </div>
                        <div className="w-px h-8 bg-emerald-100/50 md:hidden"></div>
                        <div className="flex flex-col items-center md:items-start">
                          <p className="text-[10px] md:text-[11px] font-black tracking-[0.04em] text-slate-500 uppercase">ตอนนี้</p>
                          <div className="mt-1 flex items-baseline gap-1">
                             <span className="text-2xl font-black text-slate-900">{currentLessonIndex + 1}</span>
                             <span className="text-sm font-bold text-slate-400">/ {totalLessons}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {nextLesson ? (
                      <div className="mt-6 border-t border-emerald-100/50 pt-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <p className="text-[11px] font-black tracking-[0.04em] text-primary uppercase">บทถัดไป</p>
                            <h4 className="mt-2 text-xl md:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                              {nextLesson.title}
                            </h4>
                            <div className="mt-4 flex flex-wrap items-center gap-4">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                <BookOpen size={16} className="text-slate-400" />
                                {getLessonTypeLabel(nextLesson.type)}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                <Clock size={16} className="text-slate-400" />
                                {nextLesson.duration || '10'} นาที
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:flex-nowrap">
                            <button
                              onClick={handleReturnToCourse}
                              className="inline-flex items-center justify-center rounded-[1.25rem] border-2 border-slate-100 bg-white px-7 py-4 text-sm font-black text-slate-700 whitespace-nowrap transition-all hover:bg-slate-50 active:scale-95"
                            >
                              กลับหน้าคอร์ส
                            </button>
                            <button
                              onClick={handleNavigateToNextLesson}
                              className="inline-flex items-center justify-center gap-3 rounded-[1.25rem] bg-slate-900 px-7 py-4 text-sm font-black text-white whitespace-nowrap shadow-[0_20px_40px_-10px_rgba(15,23,42,0.4)] transition-all hover:bg-primary active:scale-95"
                            >
                              ไปบทถัดไป
                              <ArrowRight size={18} strokeWidth={2.8} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 border-t border-emerald-100/50 pt-8">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <p className="text-[11px] font-black tracking-[0.04em] text-emerald-700 uppercase">ครบแล้ว</p>
                            <h4 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                              จบหลักสูตรอย่างเป็นทางการแล้ว!
                            </h4>
                          </div>

                          <button
                            onClick={handleReturnToCourse}
                            className="inline-flex items-center justify-center gap-3 rounded-[1.25rem] bg-slate-900 px-8 py-4 text-sm font-black text-white whitespace-nowrap shadow-[0_20px_40px_-10px_rgba(15,23,42,0.4)] transition-all hover:bg-primary active:scale-95"
                          >
                            กลับหน้าคอร์ส
                            <ArrowRight size={18} strokeWidth={2.8} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {hasResources && (
              <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Achievement Card - Redesigned to be less "boxed" */}
              {showAchievementCard && completed && (
                <div className="relative overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-10 text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] animate-celebrate">
                  <div className="absolute top-[-10%] right-[-10%] w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06),transparent_70%)]"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-200 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                      <CheckCircle size={40} strokeWidth={2.4} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">คุณทำได้แล้ว!</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 px-4">ความพยายามของคุณเห็นผลแล้ว พร้อมก้าวต่อไปหรือยัง?</p>
                    
                    {nextLessonId ? (
                      <button
                        onClick={handleNavigateToNextLesson}
                        className="w-full rounded-2xl bg-slate-900 py-5 text-base font-black tracking-[0.04em] text-white shadow-2xl shadow-slate-200 transition-all hover:bg-primary active:scale-95"
                      >
                        ไปบทถัดไป →
                      </button>
                    ) : (
                      <button
                        onClick={handleReturnToCourse}
                        className="w-full rounded-2xl bg-slate-100 py-5 text-base font-black tracking-[0.04em] text-slate-900 transition-all hover:bg-slate-200 active:scale-95"
                      >
                        กลับสู่คอร์สเรียน
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Resources Column */}
              {lesson.resources && lesson.resources.length > 0 && (
                <div className="sticky top-8 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 p-8">
                  <h4 className="mb-6 flex items-center gap-2.5 text-[11px] font-black tracking-[0.04em] text-slate-500 uppercase">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div> เอกสารเสริม
                  </h4>
                  <div className="flex flex-col gap-4">
                    {lesson.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:shadow-2xl hover:-translate-y-1 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                            <FileText size={18} strokeWidth={2.5}/>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 line-clamp-1">{res.title}</p>
                            <p className="text-[11px] font-bold tracking-[0.04em] text-slate-500 uppercase">{res.size || 'Download'}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default LessonPlayer;
