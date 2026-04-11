import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, CheckCircle, Clock, FileText } from 'lucide-react';
import { userAPI, getFullUrl } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import DocViewer from '../../components/common/DocViewer';

// Sub-components
import LessonMedia from '../../components/user/LessonMedia';
import QuizSection from '../../components/user/QuizSection';
import LessonProgressActions from '../../components/user/LessonProgressActions';
import LessonSidebar from '../../components/user/LessonSidebar';

const getLessonTypeLabel = (type) => {
  if (type === 'quiz') return 'แบบทดสอบ';
  if (type === 'video') return 'วิดีโอ';
  if (type === 'pdf' || type === 'document' || type === 'article') return 'เอกสาร';
  return 'เอกสาร';
};

const LessonPlayer = () => {
  const { id: courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [documentAccess, setDocumentAccess] = useState(null);
  const [openingDocument, setOpeningDocument] = useState(false);
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
        setDocumentAccess(null);
        setIsNavigatingAway(false);
        setAnswers({});
        setQuizResult(null);
        const response = await userAPI.getCourseDetails(courseId);
        setCourse(response.data);

        const currentLesson = response.data.lessons.find(l => l.id === lessonId);
        
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
        toast.error('ไม่สามารถโหลดข้อมูลบทเรียนได้');
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [courseId, lessonId, toast]);

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
      toast.success('บันทึกความคืบหน้าเรียบร้อยแล้ว');
      return true;
    } catch (error) {
      console.error('Update progress error:', error);
      toast.error('ไม่สามารถบันทึกความคืบหน้าได้');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (Object.keys(answers).length < (lesson.questions?.length || 0)) {
      toast.warning('กรุณาตอบคำถามให้ครบทุกข้อ');
      return;
    }
    
    try {
      setUpdating(true);
      const res = await userAPI.submitQuiz(lessonId, { answers });
      setQuizResult(res.data);
      setShouldScrollToQuizResult(true);
      
      if (res.data.passed) {
        toast.success(`ยินดีด้วย! คุณผ่านแบบทดสอบด้วยคะแนน ${res.data.scorePercent}%`);
      } else {
        toast.error(`เสียใจด้วย คุณยังไม่ผ่านเกณฑ์ (ได้ ${res.data.scorePercent}%)`);
      }

      if (res.data.isCompleted) {
        setCompleted(true);
        syncCompletedLessonState();
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการส่งคำตอบ');
    } finally {
      setUpdating(false);
    }
  };

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
    const nextLessonId = course?.lessons?.find((l, idx, arr) => {
      const currentIdx = arr.findIndex(item => item.id === lessonId);
      return idx === currentIdx + 1;
    })?.id;
    
    if (nextLessonId) {
      navigateToPath(`/user/courses/${courseId}/lesson/${nextLessonId}`);
    }
  };

  const handleReturnToCourse = () => {
    navigateToPath(`/user/courses/${courseId}`, { replace: true });
  };

  const requestDocumentAccess = async () => {
    if (openingDocument) return '';
    try {
      setOpeningDocument(true);
      const response = await userAPI.getLessonDocumentAccess(lessonId);
      const accessUrl = response?.data?.accessUrl || response?.accessUrl || '';
      
      if (!accessUrl) {
        throw new Error('Document access URL was not returned');
      }

      setDocumentAccess({
        accessUrl,
        fileName: response?.data?.fileName || response?.fileName || '',
        viewerType: response?.data?.viewerType || response?.viewerType || '',
        extension: response?.data?.extension || response?.extension || '',
      });
      return accessUrl;
    } catch (error) {
      console.error('Fetch document access error:', error);
      toast.error('ไม่สามารถเปิดเอกสารได้ในขณะนี้');
      return '';
    } finally {
      setOpeningDocument(false);
    }
  };

  const handleOpenDocument = async () => {
    const accessUrl = await requestDocumentAccess();
    if (accessUrl) setShowDocViewer(true);
  };

  if (loading || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-r-2 border-r-transparent"></div>
      </div>
    );
  }

  const currentLessonIndex = course?.lessons?.findIndex((item) => item.id === lessonId) ?? -1;
  const nextLesson = currentLessonIndex >= 0 ? course?.lessons?.[currentLessonIndex + 1] : null;
  const nextLessonId = nextLesson?.id;
  const totalLessons = course?.lessons?.length || 0;
  const completedLessonsCount = course?.lessons?.filter((item) => item.isCompleted).length || 0;
  const lessonMediaUrl = getFullUrl(lesson.contentUrl?.trim());
  const hasResources = Array.isArray(lesson.resources) && lesson.resources.length > 0;
  const showAchievementCard = course?.showAchievementCard === true;
  const quizRewardPoints = Number(lesson?.points) || 0;
  const canEarnQuizPoints = lesson?.type === 'quiz' && quizRewardPoints > 0;
  const hasProtectedDocument = lesson?.hasDocument === true;

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto md:px-4 md:py-6 relative min-h-screen pb-12 bg-white md:bg-transparent">
      
      <LessonMedia 
        lesson={lesson}
        courseId={courseId}
        isNavigatingAway={isNavigatingAway}
        lessonMediaUrl={lessonMediaUrl}
        handleComplete={handleComplete}
        handleReturnToCourse={handleReturnToCourse}
        handleOpenDocument={handleOpenDocument}
        openingDocument={openingDocument}
        hasProtectedDocument={hasProtectedDocument}
      />

      {showDocViewer && documentAccess?.accessUrl && (
        <DocViewer
          url={documentAccess.accessUrl}
          fileName={documentAccess.fileName}
          viewerType={documentAccess.viewerType}
          extension={documentAccess.extension}
          title={lesson.title}
          onClose={() => setShowDocViewer(false)}
          onComplete={handleComplete}
          onRefreshUrl={requestDocumentAccess}
          isCompleted={completed}
          onNext={nextLessonId ? handleNavigateToNextLesson : undefined}
          onReturnToCourse={handleReturnToCourse}
        />
      )}

      <div className="bg-white md:mt-8 md:overflow-hidden md:rounded-[3.5rem] md:border md:border-slate-100 md:shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)]">
        <div className="px-6 py-10 md:p-14">
          {/* Content Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 md:mb-10">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="flex items-center gap-1.5 rounded-lg border border-primary/10 bg-primary/5 px-3 py-2 text-xs font-black tracking-[0.04em] text-primary">
                  {lesson.type === 'video' ? <Play size={14} fill="currentColor"/> : 
                   lesson.type === 'quiz' ? <CheckCircle size={14}/> : <FileText size={14}/>} 
                  {getLessonTypeLabel(lesson.type)}
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className={hasResources || showAchievementCard ? 'lg:col-span-8' : 'lg:col-span-12'}>
              {lesson.type === 'quiz' ? (
                <QuizSection 
                  lesson={lesson}
                  answers={answers}
                  setAnswers={setAnswers}
                  quizResult={quizResult}
                  setQuizResult={setQuizResult}
                  quizResultRef={quizResultRef}
                  handleQuizSubmit={handleQuizSubmit}
                  updating={updating}
                  canEarnQuizPoints={canEarnQuizPoints}
                  quizRewardPoints={quizRewardPoints}
                />
              ) : (
                <div className="prose prose-slate prose-lg max-w-none">
                  <p className="text-xl text-slate-600 leading-[1.8] whitespace-pre-wrap font-medium">
                    {lesson.content || 'เนื้อหาเพิ่มเติมสำหรับบทเรียนนี้...'}
                  </p>
                </div>
              )}

              <LessonProgressActions 
                lesson={lesson}
                completed={completed}
                updating={updating}
                handleComplete={handleComplete}
                handleReturnToCourse={handleReturnToCourse}
                handleNavigateToNextLesson={handleNavigateToNextLesson}
                nextLesson={nextLesson}
                currentLessonIndex={currentLessonIndex}
                totalLessons={totalLessons}
                completedLessonsCount={completedLessonsCount}
              />
            </div>

            {(hasResources || showAchievementCard) && (
              <LessonSidebar 
                completed={completed}
                showAchievementCard={showAchievementCard}
                nextLessonId={nextLessonId}
                handleNavigateToNextLesson={handleNavigateToNextLesson}
                handleReturnToCourse={handleReturnToCourse}
                resources={lesson.resources}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
