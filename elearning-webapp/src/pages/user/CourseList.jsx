import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Star, PlayCircle, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI, getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';

const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filter & Search State
  const [activeCat, setActiveCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'a-z'
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, catRes] = await Promise.all([
          userAPI.getCourses(),
          userAPI.getCategories()
        ]);
        setCourses(coursesRes.data);
        setCategories([{ id: 'ALL', name: 'All' }, ...catRes.data]);
      } catch (error) {
        console.error('Fetch data error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute Filtered and Sorted Array
  let filtered = courses.filter(c => {
    const matchCat = activeCat === 'All' || c.category?.name === activeCat;
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = c.title.toLowerCase().includes(searchLower) || (c.description && c.description.toLowerCase().includes(searchLower));
    return matchCat && matchSearch;
  });

  if (sortBy === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortBy === 'a-z') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'points_desc') {
    filtered.sort((a, b) => b.points - a.points);
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-full pt-2 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">คอร์สเรียนทั้งหมด</h2>
        <button 
          onClick={() => setShowFilterModal(true)}
          className="text-gray-500 hover:text-primary transition-colors bg-white p-2.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center gap-2 group relative"
        >
          <Filter size={18} className="group-hover:text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">ตัวกรอง</span>
          
          {/* Active Filter Dot */}
          {(activeCat !== 'All' || sortBy !== 'newest') && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="ค้นหาชื่อคอร์ส หรือคำอธิบาย..." 
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all text-[15px] font-medium placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-500"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCat(cat.name)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${
              activeCat === cat.name 
                ? 'bg-primary text-white shadow-md shadow-primary/30 border border-transparent' 
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Course List Grid */}
      <div className="flex flex-col items-start md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-2 mb-6">
        {!loading && filtered.length > 0 ? (
          filtered.map(course => (
            <div 
              key={course.id} 
              onClick={() => navigate(`/user/courses/${course.id}`)}
              className="card flex md:flex-col overflow-hidden cursor-pointer group bg-white h-full shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] ring-1 ring-slate-100/80 border-none w-full"
            >
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-full md:h-[190px] xl:h-[220px] shrink-0 md:p-3 md:pb-0">
                <div className="w-full h-full md:rounded-[1.25rem] overflow-hidden relative shadow-sm md:shadow-[0_2px_10px_rgba(0,0,0,0.05)] bg-slate-100 flex items-center justify-center">
                  <img src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  <div className="hidden md:flex absolute top-3 left-3 points-pill shadow-md glass !text-amber-700 border border-white/60">
                    <span className="opacity-80 text-[10px] mr-1">⭐</span>{course.points} Pts
                  </div>
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors duration-500 flex items-center justify-center">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-full glass-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                      <PlayCircle size={28} className="text-white ml-1" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 md:p-5 flex-1 flex flex-col justify-between w-full">
                <div>
                  <div className="flex justify-between items-start mb-1.5 w-full">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider w-[60%] truncate pr-2">{course.category?.name || 'Uncategorized'}</p>
                    {course.isEnrolled && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto shrink-0 ${course.enrollmentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50' : 'bg-primary/10 text-primary ring-1 ring-primary/20'}`}>
                        {course.enrollmentStatus === 'COMPLETED' ? 'จบแล้ว' : 'กำลังเรียน'}
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-[1.05rem] text-slate-900 leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">{course.title}</h4>
                </div>
                
                <div className="flex flex-wrap sm:flex-nowrap justify-between items-end gap-y-2 mt-4 pt-4 border-t border-slate-50 w-full">
                  <span className="flex items-center gap-1.5 text-xs font-semibold bg-slate-50/80 px-2.5 py-1.5 rounded-lg text-slate-600 ring-1 ring-slate-200/60">
                    <Clock size={14} className="text-slate-400" /> {course.lessons?.reduce((acc, l) => acc + (parseInt(l.duration)||0), 0) || '2'}h
                  </span>
                  <span className="text-xs font-black text-amber-700 flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-lg ring-1 ring-amber-200/60">
                    <Star size={14} className="fill-warning border-none text-warning" /> {course.points}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : !loading && (
          <div className="col-span-full text-center py-16 flex flex-col items-center justify-center text-gray-400 bg-white rounded-[2rem] border border-dashed border-gray-300 shadow-sm w-full">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Search size={32} className="text-gray-400" strokeWidth={2} />
            </div>
            <h3 className="font-bold text-gray-600 text-lg mb-1">ไม่พบคอร์สที่ค้นหา</h3>
            <p className="text-sm text-gray-400">ลองเปลี่ยนคำค้นหา หรือใช้ตัวกรองหมวดหมู่อื่นดูสิ</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCat('All'); setSortBy('newest'); }}
              className="mt-6 px-6 py-2 bg-primary/10 text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal Overlay */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/30 backdrop-blur-sm animate-fade-in">
           {/* Click away area */}
           <div className="absolute inset-0" onClick={() => setShowFilterModal(false)}></div>
           
           {/* Slide Panel */}
           <div className="w-full max-w-sm bg-white h-full shadow-2xl relative flex flex-col animate-slide-in-right transform">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                 <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Filter size={20} className="text-primary"/> ตัวกรองขั้นสูง
                 </h3>
                 <button onClick={() => setShowFilterModal(false)} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={18} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                 {/* Sort Section */}
                 <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">การจัดเรียง (Sort By)</h4>
                    <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-bold text-gray-700">เพิ่มล่าสุด (Newest)</span>
                      <input type="radio" name="sort" checked={sortBy === 'newest'} onChange={() => setSortBy('newest')} className="w-4 h-4 text-primary accent-primary" />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-bold text-gray-700">เก่าที่สุด (Oldest)</span>
                      <input type="radio" name="sort" checked={sortBy === 'oldest'} onChange={() => setSortBy('oldest')} className="w-4 h-4 text-primary accent-primary" />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-bold text-gray-700">เรียงตามพยัญชนะ (A-Z)</span>
                      <input type="radio" name="sort" checked={sortBy === 'a-z'} onChange={() => setSortBy('a-z')} className="w-4 h-4 text-primary accent-primary" />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-bold text-gray-700">คะแนนสูงสุด (Max Points)</span>
                      <input type="radio" name="sort" checked={sortBy === 'points_desc'} onChange={() => setSortBy('points_desc')} className="w-4 h-4 text-primary accent-primary" />
                    </label>
                 </div>

                 {/* Category Section in Modal */}
                 <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">หมวดหมู่ (Category)</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => setActiveCat(cat.name)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            activeCat === cat.name 
                              ? 'bg-primary/10 text-primary border-primary/30' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                 <button 
                   onClick={() => { setActiveCat('All'); setSortBy('newest'); }}
                   className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                 >
                   ล้างค่า
                 </button>
                 <button 
                   onClick={() => setShowFilterModal(false)}
                   className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:bg-primary-hover transition-all"
                 >
                   ดูผลลัพธ์
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default CourseList;
