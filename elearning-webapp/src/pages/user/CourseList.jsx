import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userAPI } from '../../utils/api';
import { filterCourses, sortCourses } from '../../utils/courseFilters';
import CategorySearchModal from '../../components/common/CategorySearchModal';
import CourseCard from '../../components/common/CourseCard';
import SearchInput from '../../components/common/SearchInput';
import CategoryPills from '../../components/common/CategoryPills';
import FilterSidebar from '../../components/common/FilterSidebar';

const CourseList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filter & Search State
  const [activeCat, setActiveCat] = useState(urlCategory || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'a-z'
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  useEffect(() => {
    if (urlCategory) {
      setActiveCat(urlCategory);
    }
  }, [urlCategory]);

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
  const filtered = sortCourses(
    filterCourses(courses, { activeCat, searchQuery }),
    sortBy
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-full pt-2 relative pb-32">
      <div className="sticky top-[-1px] z-40 bg-[#f8fafc]/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 space-y-4 shadow-sm sm:shadow-none border-b border-gray-100 sm:border-none mb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">คอร์สเรียนทั้งหมด</h2>
          <button 
            onClick={() => setShowFilterModal(true)}
            className="text-gray-500 hover:text-primary transition-colors bg-white p-2.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center gap-2 group relative"
          >
            <Filter size={18} className="group-hover:text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">ตัวกรอง</span>
            {(activeCat !== 'All' || sortBy !== 'newest') && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="ค้นหาชื่อคอร์ส หรือคำอธิบาย..."
        />

        {/* Categories Horizontal Scroll */}
        <CategoryPills 
          categories={categories}
          activeCat={activeCat}
          onSelect={setActiveCat}
          onViewAll={() => setIsCatModalOpen(true)}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Course List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4 mb-10 relative z-10">
        {!loading && filtered.length > 0 ? (
          filtered.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onClick={() => navigate(`/user/courses/${course.id}`)}
              className="w-full h-full"
            />
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

      {/* Filter Sidebar */}
      <FilterSidebar 
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        activeCat={activeCat}
        setActiveCat={setActiveCat}
        onReset={() => { setActiveCat('All'); setSortBy('newest'); }}
      />

      {/* Categories Search Modal */}
      <CategorySearchModal 
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories.filter(c => c.id !== 'ALL')}
        courses={courses}
        onSelect={(catName) => setActiveCat(catName)}
      />
    </div>
  );
};

export default CourseList;
