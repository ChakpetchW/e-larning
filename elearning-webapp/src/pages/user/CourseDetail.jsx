import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Award, PlayCircle, BookOpen, CheckCircle, Share2, Bookmark } from 'lucide-react';
import { userAPI, getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

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
  }, [id]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await userAPI.enrollCourse(id);
      // Refresh course data to reflect enrollment
      const response = await userAPI.getCourseDetails(id);
      setCourse(response.data);
    } catch (error) {
       console.error('Enroll error:', error);
       alert(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full animate-fade-in pb-24 -m-4">
      {/* Hero Image Section */}
      <div className="relative h-[250px] md:h-[400px] w-full bg-black">
        <img 
          src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE} 
          alt="Course cover" 
          className="w-full h-full object-cover opacity-60"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        
        {/* Top Navbar over Image */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
            <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors rounded-full flex items-center justify-center text-white"
            >
                <ArrowLeft size={20} />
            </button>
            <div className="flex gap-2">
                <button className="w-10 h-10 bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors rounded-full flex items-center justify-center text-white">
                    <Bookmark size={18} />
                </button>
                <button className="w-10 h-10 bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors rounded-full flex items-center justify-center text-white">
                    <Share2 size={18} />
                </button>
            </div>
        </div>

        {/* Course Info on Image */}
        <div className="absolute bottom-6 left-0 right-0 px-5 z-20">
            <div className="flex items-center gap-2 mb-3">
                <span className="bg-primary/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
                    {course.category?.name || 'Uncategorized'}
                </span>
                <span className="bg-warning/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                    <Award size={12} className="text-white"/> {course.points} Pts
                </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
                {course.title}
            </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 md:p-8 flex-1 bg-background rounded-t-[2rem] md:rounded-2xl -mt-6 md:-mt-16 relative z-30 shadow-[0_-8px_20px_rgba(0,0,0,0.1)] md:mx-auto md:w-full md:max-w-4xl md:mb-10">
        
        {/* Meta Stats */}
        <div className="flex items-center justify-around py-4 mb-6 border-b border-gray-100 bg-white rounded-2xl shadow-sm px-4 mt-2">
            <div className="flex flex-col items-center gap-1">
                <Clock size={20} className="text-gray-400"/>
                <span className="text-sm font-bold text-gray-900">{course.lessons?.reduce((acc, l) => acc + (parseInt(l.duration)||0), 0) || '2'}h</span>
                <span className="text-[10px] uppercase font-bold text-gray-400">เวลาเรียน</span>
            </div>
            <div className="w-px h-10 bg-gray-100"></div>
            <div className="flex flex-col items-center gap-1">
                <BookOpen size={20} className="text-gray-400"/>
                <span className="text-sm font-bold text-gray-900">{course.lessons?.length || 0} บท</span>
                <span className="text-[10px] uppercase font-bold text-gray-400">เนื้อหา</span>
            </div>
            <div className="w-px h-10 bg-gray-100"></div>
            <div className="flex flex-col items-center gap-1 relative">
                <svg className="w-6 h-6 transform -rotate-90">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-gray-100" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={2 * Math.PI * 10} strokeDashoffset={(2 * Math.PI * 10) * ((100 - (course.progressPercent || 0)) / 100)} className="text-primary transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute top-1.5 text-[8px] font-bold text-primary">{course.progressPercent || 0}%</div>
                <span className="text-sm font-bold text-gray-900 mt-0.5">{course.progressPercent || 0}%</span>
                <span className="text-[10px] uppercase font-bold text-gray-400">ความคืบหน้า</span>
            </div>
        </div>

        {/* Description */}
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">รายละเอียดคอร์ส</h3>
            <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
                {course.description}
            </p>
        </div>

        {/* Syllabus / Lessons */}
        <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">เนื้อหาวิชา</h3>
            <span className="text-sm font-bold text-primary bg-indigo-50 px-3 py-1 rounded-full">{course.lessons?.filter(l => l.isCompleted).length || 0} / {course.lessons?.length || 0}</span>
        </div>
        
        <div className="flex flex-col gap-3">
          {course.lessons?.map((lesson, idx) => (
            <div 
              key={lesson.id} 
              onClick={() => course.isEnrolled && navigate(`/user/courses/${course.id}/lesson/${lesson.id}`)}
              className={`card p-4 flex items-center gap-4 transition-all border
                         ${lesson.isCompleted ? 'bg-gray-50 border-gray-100' : 'bg-white border-transparent shadow-sm'}
                         ${course.isEnrolled ? 'cursor-pointer hover:border-primary/30' : 'opacity-80'}
              `}
            >
              {/* Status Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                              ${lesson.isCompleted ? 'bg-success text-white shadow-sm shadow-success/20' : 'bg-indigo-50 text-primary border border-indigo-100'}`}>
                {lesson.isCompleted ? <CheckCircle size={20} strokeWidth={2.5}/> : <PlayCircle size={20} strokeWidth={2}/>}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">บทที่ {idx + 1}</p>
                <h4 className={`text-[15px] font-bold leading-snug ${lesson.isCompleted ? 'text-gray-500' : 'text-gray-900'}`}>
                    {lesson.title}
                </h4>
              </div>

              {/* Duration */}
              <div className="text-right shrink-0">
                  <span className="text-xs font-black text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-200">
                      {lesson.duration || '10'}m
                  </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-[65px] md:bottom-auto md:top-6 lg:top-8 right-0 md:right-8 lg:right-12 p-4 md:p-0 bg-white/90 md:bg-transparent backdrop-blur-lg md:backdrop-blur-none border-t md:border-none border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:shadow-none z-40 mx-auto w-full max-w-[600px] md:max-w-fit flex justify-end">
        {course.isEnrolled ? (
            <button 
              onClick={() => navigate(`/user/courses/${course.id}/lesson/${course.lessons[0]?.id}`)}
              className="btn btn-primary w-full md:w-auto md:px-8 py-4 text-[15px] shadow-lg shadow-primary/30 rounded-xl font-bold"
            >
              <PlayCircle size={20} /> {course.progressPercent === 0 ? 'เริ่มเรียนเลย' : 'เรียนต่อให้จบ'}
            </button>
        ) : (
            <button 
              onClick={handleEnroll}
              disabled={enrolling}
              className="btn bg-gradient-to-r from-primary to-blue-600 text-white w-full md:w-auto md:px-8 py-4 text-[15px] shadow-lg shadow-primary/30 rounded-xl font-bold disabled:opacity-75"
            >
              {enrolling ? 'กำลังสมัคร...' : 'สมัครเรียนคอร์สนี้'}
            </button>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
