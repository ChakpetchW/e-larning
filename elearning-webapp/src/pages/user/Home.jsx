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

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 items-center">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-4 md:mb-6 animate-slide-up">
              <span className="rounded-full border border-primary/10 bg-primary/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-primary md:px-4 md:text-[11px]">
                พร้อมเรียนต่อ
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95] md:leading-[0.9] mb-4 md:mb-6">
              สวัสดีคุณ<br/>
              <span className="text-gradient-primary">
                {user?.name ? (user.name.split(' ')[0] === 'คุณ' ? user.name.split(' ')[1] : user.name.split(' ')[0]) : 'ผู้ใช้งาน'}
              </span> <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
            </h1>
            <p className="mb-8 max-w-lg text-base font-medium leading-relaxed text-slate-600 md:mb-10 md:text-xl">
              วันนี้เรามาอัปสกิลใหม่ๆ ไปด้วยกันนะครับ
            </p>
            
            <div className="flex flex-wrap gap-6 border-t border-slate-200/70 pt-6 md:gap-12">
               <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">คอร์สที่เรียนอยู่</p>
                  <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{courses.filter(c => c.isEnrolled && c.enrollmentStatus === 'IN_PROGRESS').length}</p>
               </div>
               <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">เรียนจบแล้ว</p>
                  <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{courses.filter(c => c.enrollmentStatus === 'COMPLETED').length}</p>
               </div>
               <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">คะแนนสะสม</p>
                  <p className="text-2xl md:text-3xl font-black text-primary tracking-tighter">
                    {pointsLoading ? '...' : points.toLocaleString()}
                  </p>
               </div>
            </div>
          </div>

          <div className="lg:col-span-2 relative">
            {continueCourse ? (
              <button
                type="button"
                onClick={() => navigate(`/user/courses/${continueCourse.id}`)}
                aria-label={`เปิดคอร์ส ${continueCourse.title}`}
                className="group/cont glass-card rounded-[2rem] p-6 text-left ring-1 ring-slate-900/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_36px_70px_-24px_rgba(79,70,229,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:rounded-[2.5rem] md:p-8"
              >
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-[0_16px_30px_-18px_rgba(79,70,229,0.7)] md:h-12 md:w-12 md:rounded-2xl">
                    <PlayCircle size={20} className="md:w-6 md:h-6" />
                  </div>
                  <span className="rounded-lg border border-primary/10 bg-primary/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-primary md:text-[10px]">กำลังเรียน</span>
                </div>
                
                <h3 className="text-lg md:text-2xl font-black text-slate-900 leading-tight mb-5 md:mb-6 line-clamp-2 group-hover/cont:text-primary transition-colors">
                  {continueCourse.title}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 md:text-[10px]">ความคืบหน้า</p>
                    <p className="text-xs md:text-sm font-black text-primary italic">{continueCourse.progressPercent}%</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 md:h-2.5 overflow-hidden ring-1 ring-black/5">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${continueCourse.progressPercent}%` }}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-[10px] font-black uppercase tracking-widest text-white transition-all group-hover/cont:bg-primary md:mt-8 md:rounded-2xl md:py-4 md:text-xs">
                  เรียนต่อจากบทล่าสุด <ChevronRight size={14} className="md:w-4 md:h-4" />
                </div>
              </button>
            ) : (
              <div className="glass-card flex h-full min-h-[180px] flex-row items-center justify-center p-6 text-center ring-1 ring-white/60 md:min-h-[300px] md:flex-col md:p-10">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/75 shadow-sm md:mr-0 md:mb-6 md:h-16 md:w-16">
                  <Target size={22} className="text-slate-400 md:w-7 md:h-7" />
                </div>
                <div className="text-left md:text-center">
                  <h3 className="text-base md:text-lg font-black text-slate-800 mb-1">เริ่มบทเรียนใหม่</h3>
                  <p className="text-slate-500 text-[11px] md:text-sm font-medium leading-relaxed">ค้นหาคอร์สที่น่าสนใจและเริ่มพัฒนาทักษะได้เลย!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Secondary Dashboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Categories Quick Filter Bar */}
        <div className="md:col-span-2 flex flex-col gap-5">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">เลือกตามหมวดหมู่</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 md:text-[11px]">{categories.length} หมวด</p>
            </div>

            <div className="flex gap-3 flex-wrap items-center text-xs px-1">
               <button
                 onClick={() => navigate('/user/courses')}
                 className="shrink-0 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95 transition-all whitespace-nowrap min-w-fit"
               >
                 ดูทุกคอร์ส
               </button>
               {categories.slice(0, 4).map(cat => (
                 <button
                   key={cat.id}
                   onClick={() => navigate(`/user/courses?category=${encodeURIComponent(cat.name)}`)}
                   className="shrink-0 px-6 md:px-8 py-3.5 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:border-primary hover:text-primary active:scale-95 transition-all shadow-sm whitespace-nowrap min-w-[100px] md:min-w-[140px]"
                 >
                   {cat.name}
                 </button>
               ))}
               
               {categories.length > 4 && (
                 <button 
                  onClick={() => setIsCatModalOpen(true)}
                  className="shrink-0 px-6 md:px-8 py-3.5 bg-primary/5 text-primary border border-primary/20 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-primary/10 active:scale-95 transition-all shadow-sm whitespace-nowrap flex items-center gap-2"
                 >
                   <Grid size={14} /> ดูทั้งหมด
                 </button>
               )}
            </div>

           <button
             type="button"
             onClick={() => navigate('/user/rewards')}
             aria-label="ไปหน้าของรางวัล"
             className="group relative mt-1 flex items-center justify-between overflow-hidden rounded-[2rem] bg-slate-900 p-7 text-left text-white shadow-lg shadow-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:mt-2 md:rounded-[2.5rem] md:p-8"
           >
              <div className="relative z-10">
                 <h4 className="text-lg md:text-xl font-black mb-1">นำแต้มไปแลกรางวัล</h4>
                 <p className="text-slate-400 text-[11px] md:text-xs font-medium">ใช้แต้มสะสมเพื่อปลดล็อกรางวัลพิเศษสำหรับพนักงาน</p>
              </div>
              <ChevronRight className="relative z-10 group-hover:translate-x-2 transition-transform" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
           </button>
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
