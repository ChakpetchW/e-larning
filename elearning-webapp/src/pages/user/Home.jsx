import React, { useState, useEffect } from 'react';
import { PlayCircle, ChevronRight, Target, Gift, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../utils/api';
import CategorySearchModal from '../../components/common/CategorySearchModal';
import CourseCard from '../../components/common/CourseCard';
import SectionHeader from '../../components/common/SectionHeader';
import CategoryPills from '../../components/common/CategoryPills';

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
    <div className="flex flex-col gap-10 md:gap-14 animate-fade-in pt-0 md:pt-4 pb-16">
      
      {/* Premium Hero Section */}
      <section className="relative -mx-5 overflow-hidden rounded-none border-b border-slate-100 bg-white md:mx-0 md:rounded-[2.5rem] md:border-none shadow-sm">
        <div className="mesh-bg-premium absolute inset-0 opacity-100"></div>
        
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center p-8 md:p-12 lg:p-16">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Learning Dashboard
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-[3.5rem] font-bold text-slate-800 tracking-tight leading-[1.2] mb-6 flex flex-wrap items-baseline justify-center lg:justify-start">
              <span>สวัสดีคุณ</span>
              <span className="mx-2 lg:mx-3 text-gradient-primary inline-block">
                {user?.name ? (user.name.split(' ')[0] === 'คุณ' ? user.name.split(' ')[1] : user.name.split(' ')[0]) : 'ผู้ใช้งาน'}
              </span> 👋
            </h1>
            <p className="mb-10 max-w-md text-base md:text-lg font-medium text-slate-500 leading-relaxed">
              พร้อมที่จะอัปเกรดทักษะของคุณแล้วหรือยัง? วันนี้มีบทเรียนใหม่ๆ รอคุณอยู่มากมาย
            </p>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 md:gap-12 w-full pt-8 border-t border-slate-200/40">
               <div className="flex flex-col">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">กําลังเรียน</p>
                  <p className="text-2xl font-bold text-slate-800">{courses.filter(c => c.isEnrolled && c.enrollmentStatus === 'IN_PROGRESS').length}</p>
               </div>
               <div className="flex flex-col">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">เรียนจบแล้ว</p>
                  <p className="text-2xl font-bold text-slate-800">{courses.filter(c => c.enrollmentStatus === 'COMPLETED').length}</p>
               </div>
               <div className="flex flex-col">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">คะแนนสะสม</p>
                  <p className="text-2xl font-bold text-primary">
                    {pointsLoading ? '...' : points.toLocaleString()}
                  </p>
               </div>
            </div>
          </div>

          <div className="relative flex justify-center items-center lg:h-full">
            {/* Visual Asset */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl scale-110"></div>
            <img 
              src="/assets/images/hero_premium.png" 
              alt="Premium Learning Illustration" 
              className="hidden lg:block relative z-10 w-full max-w-[420px] object-contain drop-shadow-2xl animate-float"
            />
            
            {/* Floating Action Overlay (Desktop Only) */}
            <div className="hidden lg:block absolute -right-4 top-1/4 z-20 animate-slide-up delay-300">
               {continueCourse ? (
                 <button
                    onClick={() => navigate(`/user/courses/${continueCourse.id}`)}
                    className="glass-card flex items-center gap-4 p-5 rounded-2xl border-white/60 shadow-xl hover:scale-105 transition-all group"
                 >
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                       <PlayCircle size={24} />
                    </div>
                    <div className="max-w-[180px]">
                       <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">เรียนต่อ</p>
                       <h3 className="text-sm font-bold text-slate-800 truncate">{continueCourse.title}</h3>
                    </div>
                 </button>
               ) : (
                 <button
                    onClick={() => navigate('/user/courses')}
                    className="glass-card flex items-center gap-4 p-5 rounded-2xl border-white/60 shadow-xl hover:scale-105 transition-all"
                 >
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-lg">
                       <Target size={24} />
                    </div>
                    <div className="max-w-[180px]">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">มาเริ่มกันเลย</p>
                       <h3 className="text-sm font-bold text-slate-800">ค้นหาคอร์สที่ใช่</h3>
                    </div>
                 </button>
               )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mobile CTA (Mobile only) */}
      <div className="md:hidden -mt-6 -mx-5 px-5">
         {continueCourse ? (
           <button
              onClick={() => navigate(`/user/courses/${continueCourse.id}`)}
              className="w-full bg-slate-800 text-white rounded-3xl p-6 flex flex-col gap-4 shadow-xl active:scale-[0.98] transition-all"
           >
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">คอร์สปัจจุบัน</span>
                 <span className="text-xs font-bold text-primary">{continueCourse.progressPercent}%</span>
              </div>
              <h3 className="text-lg font-bold text-left line-clamp-1">{continueCourse.title}</h3>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                 <div className="bg-primary h-full rounded-full" style={{ width: `${continueCourse.progressPercent}%` }}></div>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                 เรียนต่อจากบทล่าสุด <ArrowRight size={14} />
              </div>
           </button>
         ) : (
           <button
              onClick={() => navigate('/user/courses')}
              className="w-full bg-primary text-white rounded-3xl p-6 flex items-center justify-between shadow-xl shadow-primary/20"
           >
              <div className="text-left">
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Get Started</p>
                 <h3 className="text-lg font-bold">เริ่มบทเรียนใหม่วันนี้</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                 <Target size={24} />
              </div>
           </button>
         )}
      </div>

      {/* Categories Bar */}
      {categories.length > 0 && (
         <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-5 px-1 md:px-2">
               <h3 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">คุณสนใจเรื่องไหน?</h3>
               <button 
                  onClick={() => setIsCatModalOpen(true)}
                  className="text-xs md:text-sm font-semibold text-primary hover:underline flex items-center gap-1"
               >
                 ดูหมวดหมู่ทั้งหมด <ChevronRight size={14} />
               </button>
            </div>
            <div className="-mx-5 md:mx-0">
               <CategoryPills 
                  categories={categories.slice(0, 6)}
                  activeCat={''}
                  onSelect={(catName) => navigate(`/user/courses?category=${encodeURIComponent(catName)}`)}
                  onViewAll={() => setIsCatModalOpen(true)}
                  showViewAll={categories.length > 6}
               />
            </div>
         </div>
      )}

      {/* Stats & Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
        {/* Weekly Goal Bento */}
        <div className="group relative flex flex-col justify-between rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-5">
            <div className={`flex h-16 w-16 items-center justify-center rounded-3xl transition-transform group-hover:scale-110 duration-500 ${completedThisWeekCount >= weeklyGoal ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-white shadow-lg shadow-slate-800/20'}`}>
              <Target size={28} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">Weekly Momentum</p>
              <h3 className="text-xl font-bold text-slate-800 leading-none">{completedThisWeekCount}/{weeklyGoal} คอร์สที่จบแล้ว</h3>
            </div>
          </div>
          <div className="mt-8 space-y-3">
             <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Progress</span>
                <span className={completedThisWeekCount >= weeklyGoal ? 'text-emerald-500' : 'text-primary'}>
                   {Math.round(Math.min(100, (completedThisWeekCount / weeklyGoal) * 100))}%
                </span>
             </div>
             <div className="relative w-full bg-slate-100 rounded-full h-3 overflow-hidden">
               <div 
                 className={`h-full transition-all duration-1000 ${completedThisWeekCount >= weeklyGoal ? 'bg-emerald-500' : 'bg-primary'}`}
                 style={{ width: `${Math.min(100, (completedThisWeekCount / weeklyGoal) * 100)}%` }}
               />
             </div>
          </div>
        </div>

        {/* Rewards Action Card */}
        <button
          type="button"
          onClick={() => navigate('/user/rewards')}
          className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-slate-800 p-8 text-left transition-all hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1"
        >
           <div className="flex justify-between items-start mb-10">
              <div className="relative z-10">
                 <div className="bg-white/10 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 inline-block backdrop-blur-sm">Exclusive Rewards</div>
                 <h4 className="text-2xl font-bold text-white mb-2 tracking-tight">เลือกแลกรางวัลพิเศษ</h4>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[240px]">ใช้แต้มสะสมของคุณเพื่อแลกรับรางวัลและส่วนลดพิเศษสำหรับคุณโดยเฉพาะ</p>
              </div>
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-white backdrop-blur-sm group-hover:rotate-12 transition-transform duration-500">
                 <Gift size={32} className="text-amber-300" />
              </div>
           </div>
           
           <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest group-hover:gap-4 transition-all">
              ไปยังคลังของรางวัล <ArrowRight size={16} />
           </div>

           <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 transition-colors"></div>
        </button>
      </div>

      {/* Main Course Feed */}
      <div className="space-y-16 md:space-y-24 mt-4">
        {categorizedCourses.map((category, idx) => (
          <section key={category.id} className="animate-slide-up" style={{ animationDelay: `${500 + idx * 100}ms` }}>
            <SectionHeader 
              title={category.name}
              onViewAll={() => navigate(`/user/courses?category=${encodeURIComponent(category.name)}`)}
            />
            <div className="flex items-start md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-10 md:pb-4 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 snap-x md:snap-none">
              {category.courses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onClick={() => navigate(`/user/courses/${course.id}`)}
                  className="w-[300px] md:w-full snap-center md:snap-none shrink-0"
                />
              ))}
            </div>
          </section>
        ))}

        {/* Uncategorized Fallback */}
        {uncategorized.length > 0 && (
          <section className="animate-slide-up" style={{ animationDelay: '800ms' }}>
            <SectionHeader title="คอร์สแนะนำสำหรับคุณ" showViewAll={false} />
            <div className="flex items-start md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-10 md:pb-4 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 snap-x md:snap-none">
              {uncategorized.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onClick={() => navigate(`/user/courses/${course.id}`)}
                  className="w-[300px] md:w-full snap-center md:snap-none shrink-0"
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {courses.length === 0 && (
        <div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
              <PlayCircle size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">ยังไม่มีคอร์สเรียนในระบบ</h3>
            <p className="text-slate-400 font-medium">รอการอัปเดตคอร์สดีๆ เร็วๆ นี้</p>
        </div>
      )}

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
