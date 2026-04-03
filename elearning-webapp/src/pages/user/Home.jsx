import React, { useState, useEffect } from 'react';
import { PlayCircle, ChevronRight, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../utils/api';
import CategorySearchModal from '../../components/common/CategorySearchModal';
import CourseCard from '../../components/common/CourseCard';
import SectionHeader from '../../components/common/SectionHeader';
import { Grid } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(1);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        
        const [courseRes, catRes, pointsRes, settingsRes] = await Promise.all([
          userAPI.getCourses(),
          userAPI.getCategories(),
          userAPI.getPoints(),
          userAPI.getSettings()
        ]);
        setCourses(courseRes.data);
        setCategories(catRes.data);
        setPoints(pointsRes.data.balance || 0);
        setWeeklyGoal(parseInt(settingsRes.data.weekly_goal) || 1);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
        setPointsLoading(false);
      }
    };
    fetchData();
  }, []);

  const continueCourse = courses.find(c => c.isEnrolled && c.enrollmentStatus === 'IN_PROGRESS');
  
  const categorizedCourses = categories.map(cat => ({
    ...cat,
    courses: courses.filter(c => c.categoryId === cat.id)
  })).filter(cat => cat.courses.length > 0);

  const uncategorized = courses.filter(c => !c.categoryId);
  const weeklyGoalText = `เรียนให้จบ ${weeklyGoal} คอร์สในสัปดาห์นี้`;

  const completedThisWeekCount = courses.filter(c => {
    if (c.enrollmentStatus !== 'COMPLETED' || !c.completedAt) return false;
    const completedDate = new Date(c.completedAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return completedDate >= oneWeekAgo;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 md:gap-10 animate-fade-in pt-0 md:pt-4 pb-12">
      
      {/* Premium Hero Section */}
      <section className="relative -mx-5 mb-2 overflow-hidden rounded-none border-b border-slate-200/70 mesh-bg-premium p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.18)] md:mx-0 md:rounded-[3rem] md:border md:border-white/70 md:p-12 lg:p-16">
        <div className="absolute top-0 right-0 h-full w-1/3 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-[-10%] right-[-10%] h-[150%] w-[150%] rounded-full bg-gradient-to-br from-primary/20 via-sky-400/10 to-transparent blur-[100px]"></div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/65 to-transparent"></div>

        <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-5 gap-8 md:gap-12 items-center text-center lg:text-left">
          <div className="lg:col-span-3 flex flex-col items-center lg:items-start w-full">
            <div className="flex items-center gap-3 mb-4 md:mb-6 animate-slide-up">
              <span className="rounded-full border border-primary/10 bg-primary/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-primary md:px-4 md:text-[11px]">
                พร้อมเรียนต่อ
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] lg:leading-[0.9] mb-3 md:mb-5 lg:mb-6">
              สวัสดีคุณ<br className="hidden lg:block"/>
              <span className="text-gradient-primary">
                {user?.name ? (user.name.split(' ')[0] === 'คุณ' ? user.name.split(' ')[1] : user.name.split(' ')[0]) : 'ผู้ใช้งาน'}
              </span> <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
            </h1>
            <p className="mb-6 max-w-lg text-sm md:text-base font-medium leading-relaxed text-slate-600 lg:mb-10 lg:text-xl">
              วันนี้เรามาอัปสกิลใหม่ๆ ไปด้วยกันนะครับ
            </p>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-8 lg:gap-12 w-full border-t border-slate-200/70 pt-6">
               <div className="text-center lg:text-left">
                  <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">คอร์สที่เรียนอยู่</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter">{courses.filter(c => c.isEnrolled && c.enrollmentStatus === 'IN_PROGRESS').length}</p>
               </div>
               <div className="text-center lg:text-left">
                  <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">เรียนจบแล้ว</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter">{courses.filter(c => c.enrollmentStatus === 'COMPLETED').length}</p>
               </div>
               <div className="text-center lg:text-left">
                  <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">คะแนนสะสม</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-black text-primary tracking-tighter">
                    {pointsLoading ? '...' : points.toLocaleString()}
                  </p>
               </div>
            </div>
          </div>

          <div className="lg:col-span-2 relative w-full">
            {continueCourse ? (
              <button
                type="button"
                onClick={() => navigate(`/user/courses/${continueCourse.id}`)}
                aria-label={`เปิดคอร์ส ${continueCourse.title}`}
                className="group/cont w-full bg-slate-900 rounded-[2rem] p-6 lg:p-8 text-left shadow-[0_20px_40px_-15px_rgba(15,23,42,0.4)] ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:rounded-[2.5rem] overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/30 rounded-full blur-[60px] pointer-events-none -translate-y-12 translate-x-12"></div>
                <div className="flex items-center justify-between mb-5 lg:mb-8 relative z-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10 text-white backdrop-blur-md shadow-inner shadow-white/20 lg:h-12 lg:w-12 lg:rounded-2xl">
                    <PlayCircle size={20} className="text-white lg:w-6 lg:h-6" />
                  </div>
                  <span className="rounded-lg bg-emerald-500/15 border border-emerald-500/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 lg:text-[10px]">
                    คอร์สปัจจุบัน
                  </span>
                </div>
                
                <h3 className="text-lg lg:text-2xl font-black text-white leading-tight mb-5 lg:mb-6 line-clamp-2 transition-colors relative z-10">
                  {continueCourse.title}
                </h3>
                
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-end">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 lg:text-[10px]">ความคืบหน้า</p>
                    <p className="text-xs lg:text-sm font-black text-white italic drop-shadow-md">{continueCourse.progressPercent}%</p>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 lg:h-2.5 overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-sky-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                      style={{ width: `${continueCourse.progressPercent}%` }}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm py-3.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-white/20 lg:mt-8 lg:rounded-2xl lg:py-4 lg:text-xs relative z-10">
                  เรียนต่อจากบทล่าสุด <ChevronRight size={14} className="lg:w-4 lg:h-4 text-white/70" />
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/user/courses')}
                className="group/cont w-full bg-gradient-to-br from-indigo-50 to-white rounded-[2rem] p-6 lg:p-8 text-left shadow-md ring-1 ring-indigo-100/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl focus-visible:outline-none md:rounded-[2.5rem] relative overflow-hidden"
              >
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full blur-[30px] group-hover/cont:bg-primary/10 transition-colors"></div>
                <div className="mb-4 lg:mb-6 inline-flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-[1rem] lg:rounded-[1.25rem] bg-white shadow-sm ring-1 ring-slate-100 group-hover/cont:scale-110 transition-transform duration-300">
                  <Target size={24} className="text-primary lg:w-7 lg:h-7" />
                </div>
                <div>
                  <h3 className="text-base lg:text-xl font-black text-slate-800 mb-2">เริ่มบทเรียนใหม่วันนี้</h3>
                  <p className="text-slate-500 text-xs lg:text-sm font-medium leading-relaxed">ค้นหาคอร์สที่น่าสนใจและเริ่มพัฒนาทักษะได้เลย!</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Secondary Dashboard Row */}
      {/* Secondary Dashboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Goal Bento */}
        <div className="card flex h-full flex-col justify-between rounded-[2rem] border-none bg-white p-7 shadow-[0_20px_40px_rgba(0,0,0,0.02)] ring-1 ring-slate-100 transition-all duration-500 hover:ring-primary/20 md:rounded-[2.5rem] md:p-8">
          <div>
            <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl shadow-[0_18px_30px_-18px_rgba(15,23,42,0.45)] transition-transform duration-500 md:h-14 md:w-14 ${completedThisWeekCount >= weeklyGoal ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-900 text-white shadow-slate-200'}`}>
              <Target size={24} strokeWidth={2.5} className="md:w-6.5 md:h-6.5"/>
            </div>
            <p className="text-[10px] text-slate-400 font-extrabold mb-1.5 uppercase tracking-widest">เป้าหมายสัปดาห์นี้</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tight">{weeklyGoalText}</h3>
          </div>
          <div className="mt-6 md:mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
             <div className="flex -space-x-1.5 md:-space-x-2">
                {[...Array(Math.min(3, weeklyGoal))].map((_, i) => (
                  <div key={i} className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-white bg-slate-100 text-[8px] flex items-center justify-center font-bold text-slate-400">{i+1}</div>
                ))}
             </div>
             <div className="flex items-center gap-3">
                <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">ผลงาน</span>
                <span className={`text-lg font-black px-3 md:px-4 py-1.5 rounded-xl ${completedThisWeekCount >= weeklyGoal ? 'text-emerald-600 bg-emerald-50' : 'text-slate-900 bg-slate-50'}`}>
                  {completedThisWeekCount}/{weeklyGoal}
                </span>
             </div>
          </div>
        </div>

        {/* Rewards Action Card */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-7 text-left shadow-xl shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300 md:rounded-[2.5rem] md:p-8">
           <div className="relative z-10 flex items-start justify-between">
              <div>
                 <h4 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">นำแต้มไปแลกรางวัล</h4>
                 <p className="text-slate-400 text-[11px] md:text-sm font-medium leading-relaxed max-w-[200px] md:max-w-[250px]">
                    ใช้แต้มสะสมที่คุณได้รับจากการเรียน เพื่อปลดล็อกรางวัลพิเศษสำหรับพนักงาน
                 </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/10 text-white backdrop-blur-md shadow-inner shadow-white/20">
                 <Target size={24} className="text-amber-300" />
              </div>
           </div>
           
           <div className="relative z-10 mt-8">
              <button
                type="button"
                onClick={() => navigate('/user/rewards')}
                aria-label="ไปหน้าของรางวัล"
                className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
              >
                 แลกรางวัลเลย <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-[60px] translate-x-20 -translate-y-20 group-hover:scale-125 transition-transform duration-700 pointer-events-none"></div>
           <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] translate-x-10 translate-y-10 pointer-events-none"></div>
        </div>
      </div>

      {/* Categorized Courses */}
      <div className="space-y-12 md:space-y-20 mt-12 md:mt-16">
        {categorizedCourses.map(category => (
          <section key={category.id}>
            <SectionHeader 
              title={category.name}
              onViewAll={() => navigate(`/user/courses?category=${encodeURIComponent(category.name)}`)}
            />
            <div className="flex items-start md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-8 overflow-x-auto md:overflow-visible pb-8 md:pb-4 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 snap-x md:snap-none">
              {category.courses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onClick={() => navigate(`/user/courses/${course.id}`)}
                  className="w-[280px] md:w-full snap-center md:snap-none shrink-0"
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Uncategorized Fallback */}
      {uncategorized.length > 0 && (
        <section>
          <SectionHeader title="คอร์สแนะนำสำหรับคุณ" showViewAll={false} />
          <div className="flex items-start md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-8 overflow-x-auto md:overflow-visible pb-8 md:pb-4 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 snap-x md:snap-none">
            {uncategorized.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onClick={() => navigate(`/user/courses/${course.id}`)}
                className="w-[280px] md:w-full snap-center md:snap-none shrink-0"
              />
            ))}
          </div>
        </section>
      )}

      {courses.length === 0 && (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm ring-1 ring-slate-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <PlayCircle size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-400 mb-2">ยังไม่มีคอร์สเรียนในระบบ</h3>
            <p className="text-slate-400 font-medium">รอการอัปเดตคอร์สดีๆ เร็วๆ นี้</p>
        </div>
      )}

      <div className="h-8"></div>

      <CategorySearchModal 
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories}
        courses={courses}
        onSelect={(catName) => navigate(`/user/courses?category=${encodeURIComponent(catName)}`)}
      />
    </div>
  );
};

export default Home;
