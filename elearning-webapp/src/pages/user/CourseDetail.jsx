import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Award,
  PlayCircle,
  BookOpen,
  Check,
  Star,
  MonitorPlay,
  Infinity as InfinityIcon,
  FileText,
  Bookmark,
  Users,
} from 'lucide-react';
import { userAPI, getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';

const getLessonTypeLabel = (type) => {
  if (type === 'quiz') return 'แบบทดสอบ';
  if (type === 'pdf' || type === 'document' || type === 'article') return 'เอกสาร';
  return 'วิดีโอ';
};

const parseYoutubePreview = (url) => {
  if (!url) return '';

  if (url.includes('youtube.com/embed/')) return url;

  const watchId = url.match(/[?&]v=([^&]+)/)?.[1];
  if (watchId) return `https://www.youtube.com/embed/${watchId}?autoplay=1`;

  const shortId = url.match(/youtu\.be\/([^?&]+)/)?.[1];
  if (shortId) return `https://www.youtube.com/embed/${shortId}?autoplay=1`;

  return url;
};

const tryParse = (value, fallback) => {
  try {
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await userAPI.getCourseDetails(id);
        setCourse(response.data);
      } catch (error) {
        console.error('Fetch course detail error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

    let animationFrameId = null;
    const handleScroll = () => {
      if (animationFrameId !== null) return;

      animationFrameId = window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 150);
        animationFrameId = null;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [id]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await userAPI.enrollCourse(id);
      const response = await userAPI.getCourseDetails(id);
      setCourse(response.data);
    } catch (error) {
      console.error('Enroll error:', error);
      alert(error.response?.data?.message || 'ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setEnrolling(false);
    }
  };

  const durationMinutes = useMemo(
    () => course?.lessons?.reduce((acc, lesson) => acc + (parseInt(lesson.duration, 10) || 0), 0) || 0,
    [course],
  );
  const durationHours = durationMinutes > 0 ? Math.max(1, Math.round((durationMinutes / 60) * 10) / 10) : 2;

  const learningPoints = useMemo(
    () =>
      tryParse(course?.whatYouWillLearn, [
        'เข้าใจภาพรวมของเนื้อหาและนำไปใช้ต่อยอดในการทำงานได้จริง',
        'มีแนวคิดและขั้นตอนที่ชัดเจนสำหรับลงมือทำด้วยตัวเอง',
        'ได้ตัวอย่างและเทคนิคที่ช่วยให้ทำงานได้เร็วและแม่นยำขึ้น',
        'พร้อมประยุกต์ใช้ความรู้กับสถานการณ์จริงในองค์กร',
      ]),
    [course],
  );

  const whatYouGet = useMemo(
    () =>
      tryParse(course?.whatYouWillGet, [
        { icon: 'video', text: `วิดีโอคุณภาพสูง ความยาวรวมประมาณ ${durationHours} ชั่วโมง` },
        { icon: 'file', text: 'เอกสารประกอบการเรียนสำหรับทบทวนหลังเรียน' },
        { icon: 'infinite', text: 'เข้าถึงเนื้อหาได้ตลอดตามสิทธิ์ของหลักสูตร' },
        { icon: 'award', text: 'ใบรับรองเมื่อเรียนครบตามเงื่อนไขของหลักสูตร' },
      ]),
    [course, durationHours],
  );

  const benefitsIconMap = {
    video: MonitorPlay,
    file: FileText,
    infinite: InfinityIcon,
    award: Award,
    lesson: BookOpen,
  };

  const documentLessons = useMemo(
    () =>
      course?.lessons?.filter(
        (lesson) => lesson.type === 'pdf' || lesson.type === 'document' || lesson.type === 'article',
      ) || [],
    [course],
  );

  const completedDocumentCount = useMemo(
    () => documentLessons.filter((lesson) => lesson.isCompleted).length,
    [documentLessons],
  );

  const handleReturnToCourseList = () => {
    navigate('/user/courses');
  };

  if (loading || !course) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative -mx-6 -mt-6 flex min-h-full flex-col bg-slate-50 pb-20 md:mx-0 md:mt-0 md:pb-32">
      <section className="relative overflow-hidden bg-slate-950 px-4 pb-14 pt-8 text-white sm:px-5 md:px-8 md:pb-28 md:pt-14 xl:px-0">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat opacity-60 blur-[56px]"
          style={{ backgroundImage: `url("${course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE}")` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,6,23,0.92),rgba(15,23,42,0.86),rgba(15,23,42,0.48))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_26%)]" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 md:gap-8">
          <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
            <button type="button" onClick={handleReturnToCourseList} className="flex items-center gap-1 transition-colors hover:text-white">
              <ArrowLeft size={16} /> กลับ
            </button>
            <span>/</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.24em] text-[10px] text-slate-200">
              {course.category?.name || 'หมวดทั่วไป'}
            </span>
          </div>

          <div className="grid gap-8 md:gap-10 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.28em] text-primary-light">
                <BookOpen size={14} />
                หลักสูตรแนะนำ
              </div>
              <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-[2.85rem]">
                {course.title}
              </h1>
              <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-200 md:text-lg">
                {course.description || 'หลักสูตรนี้ออกแบบมาเพื่อช่วยให้คุณเข้าใจเนื้อหาอย่างเป็นระบบ พร้อมนำความรู้ไปใช้ได้จริงกับงานในองค์กร'}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm font-bold text-slate-200">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  <span>{course.totalDuration || `${durationHours} ชั่วโมง`}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/95 p-4 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.45)] sm:p-5 lg:justify-self-end">
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">แต้มสะสมเมื่อเรียนจบ</span>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-black tracking-tighter text-slate-900">
                  {course.points > 0 ? course.points.toLocaleString() : 'ฟรี'}
                </span>
                <span className="mb-1 text-sm font-bold text-slate-500">{course.points > 0 ? 'แต้ม' : 'บทเรียน'}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-600">
                {course.isEnrolled ? 'คุณลงทะเบียนแล้ว สามารถเข้าเรียนต่อได้ทันที' : 'เรียนจบคอร์สนี้เพื่อรับแต้มสะสมไปแลกของรางวัล'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-8 flex w-full max-w-6xl flex-col-reverse gap-6 px-4 sm:px-5 md:-mt-16 md:px-8 lg:flex-row lg:gap-10 xl:px-0">
        <div className="flex w-full flex-col gap-6 md:gap-8 lg:min-w-0 lg:flex-1">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:rounded-[2rem] md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">คุณจะได้เรียนรู้อะไรจากคอร์สนี้</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">สรุปประเด็นสำคัญที่ออกแบบมาให้ต่อยอดกับการทำงานจริง</p>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary md:flex">
                <Check size={24} strokeWidth={2.5} />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {learningPoints.map((text, index) => (
                <div key={index} className="flex gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-slate-700">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {documentLessons.length > 0 && (
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:rounded-[2rem] md:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-2.5 md:mb-5">
                <h2 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">เอกสารประกอบทั้งหมด</h2>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-2 text-sm font-bold text-slate-600">
                  <FileText size={16} />
                  {documentLessons.length} เอกสาร
                </span>
                {course.isEnrolled && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-500/10">
                    {completedDocumentCount}/{documentLessons.length} เปิดแล้ว
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {documentLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => course.isEnrolled && navigate(`/user/courses/${course.id}/lesson/${lesson.id}`)}
                    disabled={!course.isEnrolled}
                    aria-label={course.isEnrolled ? `เปิดเอกสาร ${lesson.title}` : `เอกสาร ${lesson.title} ต้องลงทะเบียนก่อน`}
                    className={`group relative flex w-full flex-col gap-3 overflow-hidden rounded-[1.35rem] border p-4 text-left transition-all duration-300 sm:flex-row sm:items-start sm:gap-4 sm:p-5 ${
                      course.isEnrolled
                        ? 'bg-white hover:-translate-y-0.5 hover:border-primary/30'
                        : 'cursor-default border-slate-100 bg-slate-50 opacity-80'
                    }`}
                    style={course.isEnrolled ? { borderColor: 'rgba(226, 232, 240, 0.6)', boxShadow: 'var(--shadow-premium)' } : {}}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(79,70,229,0.24),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="flex items-start gap-3 sm:min-w-0 sm:flex-1 sm:gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] transition-all duration-300 sm:h-12 sm:w-12 ${
                          lesson.isCompleted
                            ? 'bg-emerald-100 text-emerald-600 ring-1 ring-emerald-500/15'
                            : course.isEnrolled
                              ? 'bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary'
                              : 'bg-slate-100 text-slate-300'
                        }`}
                      >
                        {lesson.isCompleted ? <Check size={20} strokeWidth={2.8} /> : <FileText size={20} strokeWidth={2.2} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start gap-2">
                          <h3 className="flex-1 text-[15px] font-extrabold leading-snug text-slate-800 transition-colors duration-300 group-hover:text-primary">
                            {lesson.title}
                          </h3>
                          {lesson.isCompleted && (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 ring-1 ring-emerald-600/10">
                              เปิดแล้ว
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className={course.isEnrolled ? 'group-hover:text-primary/70' : ''} />
                            {lesson.duration || '10'} นาที
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`inline-flex shrink-0 items-center justify-center self-end rounded-full px-3 py-1.5 text-[11px] font-black tracking-[0.16em] transition-all duration-300 sm:mt-1 sm:self-start ${
                        course.isEnrolled ? 'bg-slate-900 text-white group-hover:bg-primary' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {course.isEnrolled ? 'เปิดอ่าน' : 'Locked'}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}



          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">สารบัญบทเรียน</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">ดูภาพรวมของบทเรียนทั้งหมดก่อนเริ่มเรียน</p>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                {course.lessons?.length || 0} บทเรียน
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {course.lessons?.map((lesson, index) => (
                <button
                  type="button"
                  key={lesson.id}
                  onClick={() => course.isEnrolled && navigate(`/user/courses/${course.id}/lesson/${lesson.id}`)}
                  disabled={!course.isEnrolled}
                  aria-label={course.isEnrolled ? `เปิดบทเรียน ${lesson.title}` : `บทเรียน ${lesson.title} ต้องลงทะเบียนก่อน`}
                  className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                    course.isEnrolled
                      ? 'bg-white hover:border-primary/40 hover:-translate-y-0.5'
                      : 'border-slate-100 bg-slate-50 opacity-80 cursor-default'
                  }`}
                  style={course.isEnrolled ? { borderColor: 'rgba(226, 232, 240, 0.5)', boxShadow: 'var(--shadow-premium)' } : {}}
                >
                  {/* Status Indicator Bar (Left Edge) */}
                  {course.isEnrolled && (
                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                      lesson.isCompleted ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-primary'
                    }`} />
                  )}

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] shadow-sm transition-all duration-300 ${
                      lesson.isCompleted
                        ? 'bg-emerald-100 text-emerald-600 ring-1 ring-emerald-500/20'
                        : course.isEnrolled
                          ? 'bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white group-hover:shadow-primary/30 group-hover:shadow-md'
                          : 'bg-slate-100 text-slate-300'
                    }`}
                  >
                    {lesson.isCompleted ? <Check size={20} strokeWidth={3} /> : <PlayCircle size={22} strokeWidth={2.4} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-[15px] font-extrabold transition-colors duration-300 ${
                        lesson.isCompleted 
                          ? 'text-slate-500' 
                          : course.isEnrolled ? 'text-slate-800 group-hover:text-primary' : 'text-slate-600'
                      }`}>
                        {index + 1}. {lesson.title}
                      </h3>
                      {lesson.isCompleted && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 ring-1 ring-emerald-600/10 shadow-sm">
                          ผ่านแล้ว
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1.5">
                        {lesson.type === 'quiz' ? (
                          <Check size={14} className={course.isEnrolled ? "group-hover:text-primary/70" : ""} />
                        ) : (lesson.type === 'pdf' || lesson.type === 'document' || lesson.type === 'article') ? (
                          <FileText size={14} className={course.isEnrolled ? "group-hover:text-primary/70" : ""} />
                        ) : (
                          <MonitorPlay size={14} className={course.isEnrolled ? "group-hover:text-primary/70" : ""} />
                        )}
                        {getLessonTypeLabel(lesson.type)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className={course.isEnrolled ? "group-hover:text-primary/70" : ""} />
                        {lesson.duration || '10'} นาที
                      </span>
                    </div>
                  </div>

                  {course.isEnrolled ? (
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      lesson.isCompleted ? 'text-emerald-500 opacity-0 group-hover:opacity-100' : 'bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white'
                    }`}>
                      {lesson.isCompleted ? <Check size={18} /> : <PlayCircle size={18} />}
                    </div>
                  ) : (
                    <Bookmark size={20} className="shrink-0 text-slate-300" />
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-5 text-xl font-black tracking-tight text-slate-900 md:text-2xl">ผู้สอน</h2>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-md">
                {course.instructorAvatar ? (
                  <img src={getFullUrl(course.instructorAvatar)} alt="ผู้สอน" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-200 text-2xl font-bold uppercase text-slate-400">
                    {course.instructorName?.charAt(0) || 'I'}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-black text-slate-900">{course.instructorName || 'ทีมวิทยากรผู้เชี่ยวชาญ'}</h3>
                <p className="mt-1 text-sm font-bold text-primary">{course.instructorRole || 'วิทยากรประจำหลักสูตร'}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="w-full shrink-0 lg:w-[360px]">
          <div 
            className={`sticky top-24 overflow-hidden rounded-[2rem] border bg-white transition-transform duration-500 ${isScrolled ? 'lg:-translate-y-3' : ''}`}
            style={{ borderColor: 'rgba(226, 232, 240, 0.5)', boxShadow: 'var(--shadow-card-hover)' }}
          >
            <div className="relative aspect-video overflow-hidden bg-slate-900">
              {showVideo && course.previewVideoUrl ? (
                <iframe
                  className="h-full w-full"
                  src={parseYoutubePreview(course.previewVideoUrl)}
                  title="ตัวอย่างคอร์ส"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <>
                  <img
                    src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE}
                    alt={course.title}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                  <button
                    type="button"
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    onClick={() => course.previewVideoUrl && setShowVideo(true)}
                    disabled={!course.previewVideoUrl}
                    aria-label="เล่นวิดีโอตัวอย่างคอร์ส"
                  >
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white shadow-xl backdrop-blur-md transition-colors duration-300 hover:bg-primary">
                      <PlayCircle size={32} className="ml-1" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-white drop-shadow-md">ดูตัวอย่างคอร์สฟรี</span>
                  </button>
                </>
              )}
            </div>

            <div className="p-6 md:p-7">
              <div className="mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 block mb-2">แต้มที่จะได้รับทั้งหมด</span>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black tracking-tighter text-slate-900 md:text-4xl">
                    {course.points > 0 ? course.points.toLocaleString() : '0'}
                  </span>
                  <span className="mb-1 text-sm font-bold text-slate-500">แต้ม</span>
                </div>
              </div>

              {course.isEnrolled ? (
                <div className="flex flex-col gap-3">
                  <div className="mb-1 h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-primary transition-all duration-1000" style={{ width: `${course.progressPercent || 0}%` }}></div>
                  </div>
                  <p className="text-center text-sm font-bold text-slate-500">เรียนไปแล้ว {course.progressPercent || 0}%</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/user/courses/${course.id}/lesson/${course.lessons[0]?.id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-[15px] font-bold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-hover"
                  >
                    {course.progressPercent === 100 ? 'ทบทวนบทเรียน' : course.progressPercent === 0 ? 'เริ่มเรียนเลย' : 'เรียนต่อให้จบ'}
                    <ArrowLeft size={18} className="rotate-180" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="flex w-full items-center justify-center rounded-xl bg-primary py-4 text-[15px] font-bold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-hover disabled:opacity-70"
                >
                  {enrolling ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : 'ลงทะเบียนเรียนทันที'}
                </button>
              )}

              <p className="mt-4 text-center text-xs font-bold text-slate-400">พร้อมเรียนได้ทันทีบนทุกอุปกรณ์</p>

              <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6">
                <h3 className="text-sm font-black text-slate-900">สิ่งที่จะได้รับ</h3>
                {whatYouGet.map((item, index) => {
                  const text = typeof item === 'string' ? item : item.text;
                  const iconKey = typeof item === 'string' ? 'video' : item.icon;
                  const IconComponent = benefitsIconMap[iconKey] || MonitorPlay;

                  return (
                    <div key={index} className="flex items-start gap-3 text-[13.5px] font-medium text-slate-600">
                      <IconComponent size={18} className="mt-0.5 shrink-0 text-primary" />
                      <span>{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseDetail;
