import React, { useState, useEffect } from 'react';
import { PlayCircle, ChevronRight, Target, Gift, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../utils/api';
import { formatThaiDateTime } from '../../utils/dateUtils';
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
  const [activeGoals, setActiveGoals] = useState([]);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        
        const [courseRes, catRes, pointsRes, goalsRes] = await Promise.all([
          userAPI.getCourses(),
          userAPI.getCategories(),
          userAPI.getPoints(),
          userAPI.getGoals()
        ]);
        setCourses(Array.isArray(courseRes?.data) ? courseRes.data : []);
        setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
        setPoints(pointsRes?.data?.balance || 0);
        
        const goals = Array.isArray(goalsRes?.data) ? goalsRes.data : [];
        setActiveGoals(goals); // Store all active goals
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
        setPointsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Memoized safe calculations to prevent runtime crashes
  const continueCourse = React.useMemo(() => {
    if (!Array.isArray(courses)) return null;
    return courses.find(c => c.isEnrolled && c.enrollmentStatus === 'IN_PROGRESS');
  }, [courses]);

  const categorizedCourses = React.useMemo(() => {
    if (!Array.isArray(categories) || !Array.isArray(courses)) return [];
    return categories.map(cat => ({
      ...cat,
      courses: courses.filter(c => c.categoryId === cat.id)
    })).filter(cat => cat.courses.length > 0);
  }, [categories, courses]);

  const uncategorized = React.useMemo(() => {
    if (!Array.isArray(courses)) return [];
    return courses.filter(c => !c.categoryId);
  }, [courses]);

  // Calculate progress for each goal
  const goalsProgress = React.useMemo(() => {
    if (!Array.isArray(activeGoals) || !Array.isArray(courses)) return [];
    
    return activeGoals.map(goal => {
      const windowStart = new Date(goal.createdAt);
      const windowEnd = goal.expiryDate ? new Date(goal.expiryDate) : new Date(2100, 0, 1);
      
      let completed;
      if (goal.type === 'ANY') {
        completed = courses.filter(c => 
          c.enrollmentStatus === 'COMPLETED' && 
          c.completedAt && 
          new Date(c.completedAt) >= windowStart && 
          new Date(c.completedAt) <= windowEnd
        );
      } else {
        const specificIds = goal.courses.map(gc => gc.courseId);
        completed = courses.filter(c => 
          specificIds.includes(c.id) &&
          c.enrollmentStatus === 'COMPLETED' && 
          c.completedAt && 
          new Date(c.completedAt) >= windowStart && 
          new Date(c.completedAt) <= windowEnd
        );
      }
      
      return {
        id: goal.id,
        current: completed.length,
        target: goal.targetCount,
        title: goal.title,
        scope: goal.scope,
        deptName: goal.department?.name
      };
    });
  }, [activeGoals, courses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 md:gap-12 animate-fade-in pt-0 md:pt-4 pb-16">
      
      {/* Premium Hero Section */}
      <section className="relative -mx-5 overflow-hidden rounded-none border-b border-slate-200 bg-[linear-gradient(135deg,#fffdf8_0%,#f8fafc_55%,#eef4ff_100%)] md:mx-0 md:rounded-[2.5rem] md:border md:border-slate-200 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.08),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(67,56,202,0.08),transparent_32%)]"></div>
        
        <div className="relative z-10 grid lg:grid-cols-[minmax(0,1.1fr)_380px] gap-10 items-center p-7 md:p-12 lg:p-16">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Learning Dashboard
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-[3.4rem] font-bold text-slate-900 tracking-tight leading-[1.12] mb-6 flex flex-wrap items-baseline justify-center lg:justify-start">
              <span>สวัสดีคุณ</span>
              <span className="mx-2 lg:mx-3 text-primary inline-block">
                {user?.name ? (user.name.split(' ')[0] === 'คุณ' ? user.name.split(' ')[1] : user.name.split(' ')[0]) : 'ผู้ใช้งาน'}
              </span> 👋
            </h1>
             <p className="mb-8 max-w-xl text-base md:text-lg font-medium text-slate-600 leading-relaxed">
              พร้อมที่จะอัปเกรดทักษะของคุณแล้วหรือยัง? วันนี้มีบทเรียนใหม่ๆ รอคุณอยู่มากมาย
            </p>
            
             <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 w-full pt-6 border-t border-slate-300/50">
               <div className="flex flex-col">
                  <p className="mb-1 text-[11px] font-semibold tracking-[0.04em] text-slate-500">กําลังเรียน</p>
                  <p className="text-2xl font-bold text-slate-800">{courses.filter(c => c.isEnrolled && c.enrollmentStatus === 'IN_PROGRESS').length}</p>
               </div>
               <div className="flex flex-col">
                  <p className="mb-1 text-[11px] font-semibold tracking-[0.04em] text-slate-500">เรียนจบแล้ว</p>
                  <p className="text-2xl font-bold text-slate-800">{courses.filter(c => c.enrollmentStatus === 'COMPLETED').length}</p>
               </div>
               <div className="flex flex-col">
                  <p className="mb-1 text-[11px] font-semibold tracking-[0.04em] text-slate-500">คะแนนสะสม</p>
                  <p className="text-2xl font-bold text-primary">
                    {pointsLoading ? '...' : points.toLocaleString()}
                  </p>
               </div>
            </div>
          </div>

          <div className="relative flex justify-center items-center lg:h-full">
            {/* Visual Asset */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(180,83,9,0.14),transparent_34%),radial-gradient(circle_at_center,rgba(67,56,202,0.1),transparent_58%)] blur-3xl scale-110"></div>
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
                     className="flex items-center gap-4 rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-28px_rgba(15,23,42,0.4)] group"
                 >
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                       <PlayCircle size={24} />
                    </div>
                    <div className="max-w-[180px]">
                       <p className="mb-1 text-[11px] font-bold tracking-[0.04em] text-primary">เรียนต่อ</p>
                       <h3 className="text-sm font-bold text-slate-800 truncate">{continueCourse.title}</h3>
                    </div>
                 </button>
               ) : (
                 <button
                    onClick={() => navigate('/user/courses')}
                     className="flex items-center gap-4 rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-28px_rgba(15,23,42,0.4)]"
                 >
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-lg">
                       <Target size={24} />
                    </div>
                    <div className="max-w-[180px]">
                       <p className="mb-1 text-[11px] font-bold tracking-[0.04em] text-slate-500">มาเริ่มกันเลย</p>
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
               className="w-full rounded-[1.9rem] border border-slate-900 bg-slate-900 p-6 text-white flex flex-col gap-4 shadow-xl active:scale-[0.98] transition-all"
           >
              <div className="flex justify-between items-center">
                 <span className="text-[11px] font-bold tracking-[0.04em] text-slate-400">คอร์สปัจจุบัน</span>
                 <span className="text-xs font-bold text-primary">{continueCourse.progressPercent}%</span>
              </div>
              <h3 className="text-lg font-bold text-left line-clamp-1">{continueCourse.title}</h3>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                 <div className="bg-primary h-full rounded-full" style={{ width: `${continueCourse.progressPercent}%` }}></div>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-bold tracking-[0.04em] text-primary">
                 เรียนต่อจากบทล่าสุด <ArrowRight size={14} />
              </div>
           </button>
         ) : (
           <button
              onClick={() => navigate('/user/courses')}
               className="w-full rounded-[1.9rem] bg-primary text-white p-6 flex items-center justify-between shadow-xl shadow-primary/20"
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

      {/* Learning Activities Section */}
      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
         <h3 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-5 px-1 md:px-2">กิจกรรมการเรียน</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 items-stretch">
            {/* Ongoing Courses Card */}
            <button
               onClick={() => navigate('/user/ongoing')}
               className="group relative flex items-center gap-6 rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 text-left"
            >
               <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/5 text-primary transition-transform group-hover:rotate-12 duration-500">
                  <PlayCircle size={32} />
               </div>
               <div className="flex-1">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">กำลังเรียนอยู่</p>
                  <h3 className="text-2xl font-black text-slate-800 leading-none">
                    {courses.filter(c => c.isEnrolled && c.enrollmentStatus === 'IN_PROGRESS').length} คอร์ส
                  </h3>
               </div>
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <ChevronRight size={20} />
               </div>
            </button>


            {/* Learning Goals Bento */}
            <div className="flex flex-col gap-4">
               {goalsProgress.length > 0 ? (
                  goalsProgress.map((gp) => (
                     <button 
                         key={gp.id} 
                         onClick={() => navigate(`/user/goals/${gp.id}`)}
                         className="group relative flex items-center gap-6 rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 w-full text-left h-full"
                     >
                        <div className={`flex h-16 w-16 items-center justify-center rounded-3xl transition-transform group-hover:scale-110 duration-500 shrink-0 ${gp.current >= gp.target ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-white shadow-lg shadow-slate-800/20'}`}>
                           <Target size={28} />
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{gp.title}</p>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border leading-none ${gp.scope === 'DEPARTMENT' ? 'border-amber-200 text-amber-600 bg-amber-50' : 'border-blue-200 text-blue-600 bg-blue-50'}`}>
                                 {gp.scope === 'DEPARTMENT' ? (gp.deptName || 'แผนก') : 'องค์กร'}
                              </span>
                           </div>
                           <h3 className="text-xl font-bold text-slate-800 leading-none mb-3">{gp.current}/{gp.target} คอร์ส</h3>
                           <div className="relative w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div 
                                 className={`h-full transition-all duration-1000 ${gp.current >= gp.target ? 'bg-emerald-500' : 'bg-primary'}`}
                                 style={{ width: `${Math.min(100, (gp.current / gp.target) * 100)}%` }}
                              />
                           </div>
                        </div>
                     </button>
                  ))
               ) : (
                  <div className="group relative flex items-center gap-6 rounded-[2.5rem] bg-slate-50 p-8 border border-dashed border-slate-200 opacity-60">
                     <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-200 text-slate-400 shrink-0">
                        <Target size={28} />
                     </div>
                     <div className="flex-1">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">No Active Goals</p>
                        <h3 className="text-xl font-bold text-slate-400 leading-none">ยังไม่มีเป้าหมายในขณะนี้</h3>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Rewards & Other Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
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

      {/* Main Course Feed - Individual Category Sections */}
      <div className="space-y-16 md:space-y-24 mt-4">
        {categorizedCourses.map((category, idx) => (
          <section key={category.id} className="animate-slide-up" style={{ animationDelay: `${500 + idx * 100}ms` }}>
            <SectionHeader 
              title={category.name}
              badgeText={category.isTemporary ? `Limited Time · ${formatThaiDateTime(category.expiredAt, true)}` : ''}
              onViewAll={() => navigate(`/user/courses?category=${encodeURIComponent(category.name)}`)}
            />
            <div className="grid grid-flow-col auto-cols-[minmax(300px,1fr)] md:grid-flow-row md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-10 md:pb-4 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 snap-x md:snap-none items-stretch">
              {category.courses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onClick={() => navigate(`/user/courses/${course.id}`)}
                  className="snap-center md:snap-none"
                />
              ))}
            </div>
          </section>
        ))}

        {/* Uncategorized Fallback */}
        {uncategorized.length > 0 && (
          <section className="animate-slide-up" style={{ animationDelay: '800ms' }}>
            <SectionHeader title="คอร์สแนะนำสำหรับคุณ" showViewAll={false} />
            <div className="grid grid-flow-col auto-cols-[minmax(300px,1fr)] md:grid-flow-row md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-10 md:pb-4 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 snap-x md:snap-none items-stretch">
              {uncategorized.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onClick={() => navigate(`/user/courses/${course.id}`)}
                  className="snap-center md:snap-none"
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
