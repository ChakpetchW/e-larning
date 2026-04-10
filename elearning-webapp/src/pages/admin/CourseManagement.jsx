import React, { useEffect, useMemo, useState } from 'react';
import { 
  Archive, ArrowDown, ArrowUp, Edit, Edit2, LayoutGrid, Plus, RotateCcw, Search, Trash2, 
  ChevronDown, Clock, AlertTriangle
} from 'lucide-react';
import { ICON_LIST } from '../../utils/icons';
import { adminAPI } from '../../utils/api';
import { toUTCISOString, toLocalInputValue, formatThaiDateTime } from '../../utils/dateUtils';
import { compressImage } from '../../utils/imageUtils';
import CourseModal from '../../components/admin/CourseModal';
import LessonModal from '../../components/admin/LessonModal';
import ModalPortal from '../../components/common/ModalPortal';

const getDefaultCourseForm = () => ({
  title: '',
  description: '',
  categoryId: '',
  points: 100,
  image: '',
  instructorName: 'ทีมวิทยากรผู้เชี่ยวชาญ',
  instructorRole: 'Enterprise Instructor',
  instructorBio: '',
  previewVideoUrl: '',
  totalDuration: '',
  whatYouWillLearn: '[]',
  whatYouWillGet: '[]',
  visibleToAll: true,
  visibleDepartmentIds: [],
  visibleTierIds: [],
  isTemporary: false,
  expiredAt: '',
});

const getDefaultCategoryForm = () => ({
  name: '',
  icon: 'Grid',
  type: 'FUNCTION',
  order: 0,
  visibleToAll: true,
  visibleDepartmentIds: [],
  visibleTierIds: [],
  isTemporary: false,
  expiredAt: '',
});

// Standard date utilities now imported from dateUtils

const getDefaultLessonForm = (order = 0) => ({
  title: '',
  type: 'video',
  contentUrl: '',
  content: '',
  order,
  points: 0,
  passScore: 60,
  questions: [],
});

const CourseManagement = () => {
  const iconPickerRef = React.useRef(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [courseView, setCourseView] = useState('ACTIVE');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [courseForm, setCourseForm] = useState(getDefaultCourseForm());
  const [lessons, setLessons] = useState([]);
  const [quizReports, setQuizReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState(getDefaultLessonForm());

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState(getDefaultCategoryForm());
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryView, setCategoryView] = useState('ACTIVE');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
    const handleClickOutside = (event) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target)) {
        setShowIconPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const [courseResponse, categoryResponse, departmentResponse, tierResponse] = await Promise.all([
        adminAPI.getCourses(),
        adminAPI.getCategories(),
        adminAPI.getDepartments(),
        adminAPI.getTiers(),
      ]);

      setCourses(courseResponse.data);
      setCategories(categoryResponse.data);
      setDepartments(departmentResponse.data);
      setTiers(tierResponse.data);
    } catch (error) {
      console.error('Fetch course management data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetCourseForm = () => {
    setCourseForm(getDefaultCourseForm());
    setLessons([]);
    setQuizReports([]);
    setIsEditing(false);
    setEditingId(null);
    setActiveTab('basic');
  };

  const resetCategoryEditor = () => {
    setEditingCategoryId(null);
    setCategoryForm(getDefaultCategoryForm());
  };

  const openAddCourse = () => {
    resetCourseForm();
    setShowModal(true);
  };

  const openEditCourse = async (course) => {
    setIsEditing(true);
    setEditingId(course.id);
    setCourseForm({
      title: course.title,
      description: course.description || '',
      categoryId: course.categoryId || '',
      points: course.points || 0,
      image: course.image || '',
      instructorName: course.instructorName || 'ทีมวิทยากรผู้เชี่ยวชาญ',
      instructorRole: course.instructorRole || 'Enterprise Instructor',
      instructorBio: course.instructorBio || '',
      previewVideoUrl: course.previewVideoUrl || '',
      totalDuration: course.totalDuration || '',
      whatYouWillLearn: course.whatYouWillLearn || '[]',
      whatYouWillGet: course.whatYouWillGet || '[]',
      visibleToAll: course.visibleToAll ?? true,
      visibleDepartmentIds: course.visibleDepartmentIds || [],
      visibleTierIds: course.visibleTierIds || [],
      isTemporary: Boolean(course.isTemporary),
      expiredAt: toLocalInputValue(course.expiredAt),
    });
    setActiveTab('basic');
    setShowModal(true);
    await fetchLessons(course.id);
  };

  const fetchLessons = async (courseId) => {
    try {
      const response = await adminAPI.getLessons(courseId);
      setLessons(response.data);
    } catch (error) {
      console.error('Fetch lessons error:', error);
    }
  };

  const fetchQuizReports = async (courseId) => {
    try {
      setLoadingReports(true);
      const response = await adminAPI.getCourseQuizReports(courseId);
      setQuizReports(response.data);
    } catch (error) {
      console.error('Fetch quiz reports error:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSaveCourse = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...courseForm,
        expiredAt: courseForm.isTemporary ? toUTCISOString(courseForm.expiredAt) : null,
      };

      if (isEditing) {
        await adminAPI.updateCourse(editingId, payload);
        alert('อัปเดตคอร์สเรียบร้อย');
      } else {
        await adminAPI.createCourse({ ...payload, status: 'PUBLISHED' });
        alert('สร้างคอร์สเรียบร้อย');
      }

      setShowModal(false);
      resetCourseForm();
      fetchData();
    } catch (error) {
      console.error('Save course error:', error);
      alert(error.response?.data?.message || 'ไม่สามารถบันทึกคอร์สได้');
    }
  };

  const handleRepublishCourse = async (id) => {
    try {
      await adminAPI.republishCourse(id);
      await fetchData();
    } catch (error) {
      console.error('Republish course error:', error);
      alert(error.response?.data?.message || 'ไม่สามารถนำคอร์สกลับมาเผยแพร่ได้');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('ยืนยันการลบคอร์สนี้ใช่หรือไม่?')) {
      return;
    }

    try {
      await adminAPI.deleteCourse(id);
      setCourses((currentCourses) => currentCourses.filter((course) => course.id !== id));
    } catch (error) {
      console.error('Delete course error:', error);
      alert(error.response?.data?.message || 'ลบคอร์สไม่สำเร็จ');
    }
  };

  const handleSaveLesson = async (event) => {
    event.preventDefault();

    try {
      if (editingLesson) {
        await adminAPI.updateLesson(editingLesson.id, lessonForm);
      } else {
        await adminAPI.createLesson({ ...lessonForm, courseId: editingId });
      }

      setShowLessonModal(false);
      setEditingLesson(null);
      setLessonForm(getDefaultLessonForm());
      fetchLessons(editingId);
    } catch (error) {
      console.error('Save lesson error:', error);
      alert(error.response?.data?.message || 'ไม่สามารถบันทึกบทเรียนได้');
    }
  };

  const handleReorderLessons = async (reorderedLessons) => {
    const originalLessons = [...lessons];
    setLessons(reorderedLessons);

    try {
      await adminAPI.reorderLessons(reorderedLessons.map((l) => l.id));
    } catch (error) {
      console.error('Reorder lessons error:', error);
      setLessons(originalLessons);
      alert('ไม่สามารถจัดลำดับบทเรียนได้');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('ยืนยันการลบบทเรียนนี้ใช่หรือไม่?')) {
      return;
    }

    try {
      await adminAPI.deleteLesson(lessonId);
      fetchLessons(editingId);
    } catch (error) {
      console.error('Delete lesson error:', error);
      alert(error.response?.data?.message || 'ลบบทเรียนไม่สำเร็จ');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      // Compress image before upload to avoid Vercel 4.5MB limit
      const compressedFile = await compressImage(file);
      const response = await adminAPI.uploadFile(compressedFile);
      setCourseForm((currentForm) => ({ ...currentForm, image: response.data.fileUrl }));
    } catch (error) {
      console.error('Upload image error:', error);
      alert('อัปโหลดรูปไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  const handleDocUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      // Compress if it's an image, otherwise upload as is
      const finalFile = file.type.startsWith('image/') ? await compressImage(file) : file;
      const response = await adminAPI.uploadFile(finalFile);
      setLessonForm((currentForm) => ({ ...currentForm, contentUrl: response.data.fileUrl }));
    } catch (error) {
      console.error('Upload document error:', error);
      alert('อัปโหลดเอกสารไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveCategory = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...categoryForm,
        expiredAt: categoryForm.isTemporary ? toUTCISOString(categoryForm.expiredAt) : null,
      };

      if (editingCategoryId) {
        await adminAPI.updateCategory(editingCategoryId, payload);
      } else {
        await adminAPI.createCategory(payload);
      }

      setCategoryForm(getDefaultCategoryForm());
      setEditingCategoryId(null);
      fetchData();
    } catch (error) {
      console.error('Save category error:', error);
      alert(error.response?.data?.message || 'ไม่สามารถบันทึกหมวดหมู่ได้');
    }
  };

  const handleRepublishCategory = async (id) => {
    try {
      await adminAPI.republishCategory(id);
      await fetchData();
    } catch (error) {
      console.error('Republish category error:', error);
      alert(error.response?.data?.message || 'ไม่สามารถนำหมวดหมู่กลับมาเผยแพร่ได้');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('ยืนยันการลบหมวดหมู่นี้ใช่หรือไม่?')) {
      return;
    }

    try {
      await adminAPI.deleteCategory(id);
      fetchData();
    } catch (error) {
      console.error('Delete category error:', error);
      alert(error.response?.data?.message || 'ลบหมวดหมู่ไม่สำเร็จ');
    }
  };

  const handleMoveCategory = async (index, direction) => {
    if (categoryView === 'ARCHIVED') {
      return;
    }

    const activeCategories = categories.filter((category) => !category.isArchived);
    const archivedCategories = categories.filter((category) => category.isArchived);
    const reordered = [...activeCategories];

    if (direction === -1 && index > 0) {
      [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    } else if (direction === 1 && index < reordered.length - 1) {
      [reordered[index + 1], reordered[index]] = [reordered[index], reordered[index + 1]];
    } else {
      return;
    }

    const normalized = reordered.map((category, itemIndex) => ({
      ...category,
      order: itemIndex,
    }));

    setCategories([...normalized, ...archivedCategories]);

    try {
      await adminAPI.reorderCategories({
        categoryIds: normalized.map((category) => category.id),
      });
    } catch (error) {
      console.error('Reorder categories error:', error);
      alert(error.response?.data?.message || 'บันทึกลำดับหมวดหมู่ไม่สำเร็จ');
    }
  };

  const filteredCourses = useMemo(() => (
    courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || course.categoryId === selectedCategory;
      const matchesView = courseView === 'ARCHIVED' ? Boolean(course.isArchived) : !course.isArchived;
      return matchesSearch && matchesCategory && matchesView;
    })
  ), [courseView, courses, searchTerm, selectedCategory]);

  const filteredCategories = useMemo(() => (
    categories.filter((category) => (categoryView === 'ARCHIVED' ? Boolean(category.isArchived) : !category.isArchived))
  ), [categories, categoryView]);

  const selectableCategories = useMemo(() => (
    categories.filter((category) => !category.isArchived || category.id === courseForm.categoryId)
  ), [categories, courseForm.categoryId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="mb-1 text-2xl font-bold">จัดการคอร์สเรียน</h2>
          <p className="text-sm text-muted">
            สร้างคอร์ส จัดการบทเรียน และกำหนดว่าแผนกหรือระดับผู้ใช้งานไหนจะมองเห็นคอร์สนี้ได้
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => { resetCategoryEditor(); setCategoryView('ACTIVE'); setShowCategoryModal(true); }} className="btn btn-outline">
            จัดการหมวดหมู่
          </button>
          <button onClick={openAddCourse} className="btn btn-primary">
            <Plus size={18} />
            สร้างคอร์สใหม่
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'ACTIVE', label: `คอร์สที่เผยแพร่อยู่ (${courses.filter((course) => !course.isArchived).length})`, icon: LayoutGrid },
          { key: 'ARCHIVED', label: `Archive (${courses.filter((course) => course.isArchived).length})`, icon: Archive },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setCourseView(key)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
              courseView === key
                ? 'bg-slate-900 text-white shadow-lg'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            {key === 'ACTIVE' ? <LayoutGrid size={16} /> : <Archive size={16} />}
            {label}
          </button>
        ))}
      </div>

      <CourseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isEditing={isEditing}
        editingId={editingId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        courseForm={courseForm}
        setCourseForm={setCourseForm}
        categories={selectableCategories}
        departments={departments}
        tiers={tiers}
        lessons={lessons}
        loadingReports={loadingReports}
        quizReports={quizReports}
        onSaveCourse={handleSaveCourse}
        onImageUpload={handleImageUpload}
        onEditLesson={(lesson) => {
          setEditingLesson(lesson);
          setLessonForm(lesson);
          setShowLessonModal(true);
        }}
        onDeleteLesson={handleDeleteLesson}
        onAddLesson={() => {
          setEditingLesson(null);
          setLessonForm(getDefaultLessonForm(lessons.length + 1));
          setShowLessonModal(true);
        }}
        onReorderLessons={handleReorderLessons}
        fetchQuizReports={fetchQuizReports}
        uploading={uploading}
      />

      <LessonModal
        isOpen={showLessonModal}
        onClose={() => setShowLessonModal(false)}
        onSave={handleSaveLesson}
        lessonForm={lessonForm}
        setLessonForm={setLessonForm}
        uploading={uploading}
        onDocUpload={handleDocUpload}
        isEditing={!!editingLesson}
      />

      {showCategoryModal && (
        <ModalPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            className="card flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="category-modal-title" className="text-xl font-bold">จัดการหมวดหมู่</h3>
              <button 
                type="button"
                aria-label="ปิดหน้าต่างจัดการหมวดหมู่"
                onClick={() => { setShowCategoryModal(false); resetCategoryEditor(); }} 
                className="text-muted hover:text-gray-800"
              >
                ปิด
              </button>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              {[
                { key: 'ACTIVE', label: `หมวดหมู่ที่เผยแพร่อยู่ (${categories.filter((category) => !category.isArchived).length})`, icon: LayoutGrid },
                { key: 'ARCHIVED', label: `Archive (${categories.filter((category) => category.isArchived).length})`, icon: Archive },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setCategoryView(key); resetCategoryEditor(); }}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    categoryView === key
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {key === 'ACTIVE' ? <LayoutGrid size={16} /> : <Archive size={16} />}
                  {label}
                </button>
              ))}
            </div>

            <form 
              onSubmit={handleSaveCategory} 
              className={`mb-5 space-y-4 rounded-3xl border-2 p-5 transition-all duration-300 ${
                editingCategoryId 
                  ? 'border-primary/30 bg-primary/5 shadow-inner' 
                  : 'border-slate-100 bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between px-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${editingCategoryId ? 'text-primary' : 'text-slate-400'}`}>
                  {editingCategoryId ? 'กำลังแก้ไขหมวดหมู่' : 'สร้างหมวดหมู่ใหม่'}
                </span>
                {editingCategoryId && (
                  <button 
                    type="button"
                    onClick={resetCategoryEditor}
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                  >
                    ยกเลิกการแก้ไข
                  </button>
                )}
              </div>

              {/* Major Group Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">กลุ่มหลัก (Major Group)</label>
                <div className="flex gap-2 p-1 bg-white border border-slate-100 rounded-2xl w-fit">
                  {[
                    { value: 'LEADERSHIP', label: 'Leadership', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
                    { value: 'FUNCTION', label: 'Function', color: 'text-slate-600 bg-slate-50 border-slate-200' },
                    { value: 'INNOVATION', label: 'Innovation', color: 'text-amber-600 bg-amber-50 border-amber-200' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, type: opt.value })}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        categoryForm.type === opt.value
                          ? opt.color + ' border shadow-sm scale-105'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">ชื่อหมวดหมู่</label>
                  <input
                    required
                    type="text"
                    placeholder="เช่น AI, Business, ..."
                    className={`form-input w-full bg-white px-4 py-3 text-sm font-bold transition-all ${
                      editingCategoryId ? 'border-primary/50 ring-2 ring-primary/10' : 'border-slate-200'
                    }`}
                    value={categoryForm.name}
                    onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
                  />
                </div>

                <div className="w-full md:w-56 space-y-1.5" ref={iconPickerRef}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">ไอคอนแสดงผล</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm font-bold transition-all ${
                        showIconPicker ? 'border-primary ring-2 ring-primary/10' : editingCategoryId ? 'border-primary/50' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-primary">
                          {React.createElement(ICON_LIST[categoryForm.icon || 'LayoutGrid'] || ICON_LIST.LayoutGrid, { size: 18 })}
                        </div>
                        <span className="text-slate-900">{categoryForm.icon || 'LayoutGrid'}</span>
                      </div>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform ${showIconPicker ? 'rotate-180' : ''}`} />
                    </button>

                    {showIconPicker && (
                      <div className="absolute left-0 lg:left-auto lg:right-0 top-full z-[100] mt-3 w-72 sm:w-80 max-h-80 overflow-y-auto rounded-3xl border border-slate-100 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-3 gap-2">
                          {Object.keys(ICON_LIST).map((iconName) => {
                            const Icon = ICON_LIST[iconName];
                            const isSelected = (categoryForm.icon || 'LayoutGrid') === iconName;
                            return (
                              <button
                                key={iconName}
                                type="button"
                                title={iconName}
                                onClick={() => {
                                  setCategoryForm({ ...categoryForm, icon: iconName });
                                  setShowIconPicker(false);
                                }}
                                className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-3 transition-all duration-300 ${
                                  isSelected 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105 z-10' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-primary hover:scale-105'
                                }`}
                              >
                                <div className={`${isSelected ? 'text-white' : 'text-slate-600'}`}>
                                  <Icon size={20} />
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-tighter truncate w-full text-center ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                                  {iconName}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={`btn shrink-0 ${editingCategoryId ? 'bg-slate-900 text-white' : 'btn-primary'} h-[46px] px-8 text-xs font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95`}
                >
                  {editingCategoryId ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-amber-100/40 p-6 backdrop-blur-md shadow-sm transition-all hover:shadow-md">
                {/* Decorative background pulse */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl animate-pulse"></div>
                <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-amber-300/10 blur-2xl animate-pulse delay-700"></div>

                <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-700 shadow-inner">
                      <Clock size={24} className="animate-spin-slow" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-black uppercase tracking-widest text-amber-900/70">หมวดหมู่ชั่วคราว</p>
                        <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      </div>
                      <p className="mt-1.5 text-sm font-medium leading-relaxed text-amber-900/80">
                        หมวดนี้จะย้ายไปยัง <span className="font-bold">Archive</span> อัตโนมัติเมื่อครบกำหนดเวลา
                      </p>
                    </div>
                  </div>
                  
                  <label className="group flex cursor-pointer select-none items-center gap-3 self-end rounded-2xl border border-amber-300/40 bg-white/80 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-amber-900 shadow-sm transition-all hover:bg-white hover:shadow-md active:scale-95 md:self-start">
                    <div className="relative inline-flex h-5 w-5 items-center justify-center">
                      <input
                        type="checkbox"
                        checked={Boolean(categoryForm.isTemporary)}
                        onChange={(event) =>
                          setCategoryForm({
                            ...categoryForm,
                            isTemporary: event.target.checked,
                            expiredAt: event.target.checked ? categoryForm.expiredAt : '',
                          })
                        }
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-amber-300 transition-all checked:bg-amber-500 checked:border-transparent"
                      />
                      <Plus size={14} className="absolute text-white opacity-0 transition-opacity peer-checked:opacity-100 rotate-45" />
                    </div>
                    ใช้งานระบบชั่วคราว
                  </label>
                </div>

                {categoryForm.isTemporary && (
                  <div className="relative z-10 mt-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 ml-1">
                      <AlertTriangle size={14} className="text-amber-600" />
                      <label className="text-[10px] font-black uppercase tracking-widest text-amber-900/60">ระบุวันและเวลาหมดอายุ</label>
                    </div>
                    <div className="group relative">
                      <input
                        required={Boolean(categoryForm.isTemporary)}
                        type="datetime-local"
                        className="form-input w-full rounded-2xl border-amber-200/60 bg-white/90 px-5 py-4 text-sm font-bold text-slate-800 shadow-inner transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 group-hover:border-amber-300"
                        value={categoryForm.expiredAt || ''}
                        onChange={(event) => setCategoryForm({ ...categoryForm, expiredAt: event.target.value })}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500/50 group-hover:text-amber-500 transition-colors">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                    <p className="mt-1.5 px-1 text-[10px] font-medium text-amber-800/60 italic">
                      * ระบบจะตรวจสอบความถูกต้องของเวลาไทยอัตโนมัติ
                    </p>
                  </div>
                )}
              </div>

              {/* Visibility Toggle */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase text-muted">สิทธิ์การมองเห็น</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, visibleToAll: true, visibleDepartmentIds: [], visibleTierIds: [] })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      categoryForm.visibleToAll
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    ทุกคน (ALL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, visibleToAll: false })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      !categoryForm.visibleToAll
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    เลือกเฉพาะกลุ่ม
                  </button>
                </div>
              </div>

              {/* Department & Tier Selection */}
              {!categoryForm.visibleToAll && (
                <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">  
                  {/* Departments */}
                  <div>
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">แผนก (Department)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {departments.length === 0 ? (
                        <span className="text-xs text-muted">ยังไม่มีแผนก — ไปสร้างที่เมนูจัดการผู้ใช้งาน</span>
                      ) : (
                        departments.map((dept) => {
                          const isSelected = (categoryForm.visibleDepartmentIds || []).includes(dept.id);
                          return (
                            <button
                              key={dept.id}
                              type="button"
                              onClick={() => {
                                const ids = categoryForm.visibleDepartmentIds || [];
                                setCategoryForm({
                                  ...categoryForm,
                                  visibleDepartmentIds: isSelected
                                    ? ids.filter((i) => i !== dept.id)
                                    : [...ids, dept.id],
                                });
                              }}
                              className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                                isSelected
                                  ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              {dept.name}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Tiers */}
                  <div>
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">ระดับผู้ใช้งาน (Tier)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tiers.length === 0 ? (
                        <span className="text-xs text-muted">ยังไม่มีระดับผู้ใช้งาน — ไปสร้างที่เมนูจัดการผู้ใช้งาน</span>
                      ) : (
                        tiers.map((tier) => {
                          const isSelected = (categoryForm.visibleTierIds || []).includes(tier.id);
                          return (
                            <button
                              key={tier.id}
                              type="button"
                              onClick={() => {
                                const ids = categoryForm.visibleTierIds || [];
                                setCategoryForm({
                                  ...categoryForm,
                                  visibleTierIds: isSelected
                                    ? ids.filter((i) => i !== tier.id)
                                    : [...ids, tier.id],
                                });
                              }}
                              className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                                isSelected
                                  ? 'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30'
                                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              {tier.name}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>

            <div className="flex-1 overflow-y-auto">
              <p className="mb-2 text-xs font-bold uppercase text-muted">ลำดับหมวดหมู่ปัจจุบัน</p>
              <div className="flex flex-col gap-2">
                {filteredCategories.map((category, index) => {
                  const isEditing = editingCategoryId === category.id;
                  return (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 ${
                        isEditing 
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary' 
                          : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isEditing ? 'border-primary/30 bg-primary/10 text-primary' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                          {React.createElement(ICON_LIST[category.icon] || LayoutGrid, { size: 18 })}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-black tracking-tight ${isEditing ? 'text-primary' : 'text-slate-900 font-bold'}`}>
                            <div className="flex items-center gap-2">
                              {category.name}
                              {category.type && (
                                <span className={`rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase ring-1 ring-inset ${
                                  category.type === 'LEADERSHIP' ? 'text-indigo-600 bg-indigo-50 ring-indigo-200' :
                                  category.type === 'INNOVATION' ? 'text-amber-600 bg-amber-50 ring-amber-200' :
                                  'text-slate-500 bg-slate-50 ring-slate-200'
                                }`}>
                                  {category.type}
                                </span>
                              )}
                              {category.isTemporary && (
                                <span className={`rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase ring-1 ring-inset ${
                                  category.isArchived
                                    ? 'bg-rose-50 text-rose-600 ring-rose-200'
                                    : 'bg-amber-50 text-amber-700 ring-amber-200'
                                }`}>
                                  {category.isArchived ? 'Archived' : 'Limited Time'}
                                </span>
                              )}
                            </div>
                          </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {category.isTemporary && (
                              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-700">
                                หมดอายุ {formatThaiDateTime(category.expiredAt, true)}
                              </span>
                          )}
                          {category.visibleToAll !== false ? (
                            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700">ทุกคน</span>
                          ) : (
                            <>
                              {(category.visibleDepartments || []).map(d => (
                                <span key={d.id} className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase text-primary">{d.name}</span>
                              ))}
                              {(category.visibleTiers || []).map(t => (
                                <span key={t.id} className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase text-amber-700">{t.name}</span>
                              ))}
                              {!(category.visibleDepartments?.length || category.visibleTiers?.length) && (
                                <span className="text-[9px] font-bold uppercase text-slate-400 italic">ยังไม่ได้กำหนด</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <div className="flex flex-col rounded-lg border border-slate-100 bg-slate-50 overflow-hidden shadow-sm">
                          <button
                            type="button"
                            disabled={categoryView === 'ARCHIVED' || index === 0}
                            onClick={() => handleMoveCategory(index, -1)}
                            className="p-1 text-slate-400 hover:bg-white hover:text-primary disabled:opacity-30 transition-all border-b border-slate-100"
                          >
                            <ArrowUp size={14} strokeWidth={3} />
                          </button>
                          <button
                            type="button"
                            disabled={categoryView === 'ARCHIVED' || index === filteredCategories.length - 1}
                            onClick={() => handleMoveCategory(index, 1)}
                            className="p-1 text-slate-400 hover:bg-white hover:text-primary disabled:opacity-30 transition-all"
                          >
                            <ArrowDown size={14} strokeWidth={3} />
                          </button>
                        </div>
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(category.id);
                              setCategoryForm({
                                name: category.name,
                                icon: category.icon || 'Grid',
                                type: category.type || 'FUNCTION',
                                order: category.order,
                                visibleToAll: category.visibleToAll ?? true,
                                visibleDepartmentIds: category.visibleDepartmentIds || [],
                                visibleTierIds: category.visibleTierIds || [],
                                isTemporary: Boolean(category.isTemporary),
                                expiredAt: toLocalInputValue(category.expiredAt),
                              });
                            }}
                            className="rounded-xl bg-slate-50 p-2 text-primary transition-all hover:bg-primary hover:text-white"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {category.isArchived && (
                          <button
                            type="button"
                            onClick={() => handleRepublishCategory(category.id)}
                            className="rounded-xl bg-emerald-50 p-2 text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="rounded-xl bg-slate-50 p-2 text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="ค้นหาคอร์ส..."
              className="w-full rounded-md border border-border bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            className="cursor-pointer rounded-md border border-border bg-white px-3 py-2 text-sm text-muted focus:outline-none"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="ALL">ทุกหมวดหมู่</option>
            {categories.filter((category) => !category.isArchived).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-gray-50 text-sm text-muted">
                  <th className="p-4 font-medium">ชื่อคอร์ส</th>
                  <th className="p-4 font-medium">หมวดหมู่</th>
                  <th className="p-4 font-medium">สิทธิ์การเห็น</th>
                  <th className="p-4 font-medium text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b border-border transition-colors hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{course.title}</span>
                        {course.isTemporary && (
                          <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            course.isArchived
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {course.isArchived ? 'Archived' : 'Limited Time'} · {formatThaiDateTime(course.expiredAt, true)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted">
                      <div className="flex flex-col gap-1">
                        <span>{course.category?.name || 'Uncategorized'}</span>
                        {course.category?.isTemporary && (
                          <span className="text-[11px] font-bold text-amber-700">
                            หมวดชั่วคราว · {formatThaiDateTime(course.category?.expiredAt, true)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted">
                      {course.visibleToAll ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          ทุกคน
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <div>แผนก {course.visibleDepartments?.length || 0} รายการ</div>
                          <div>ระดับผู้ใช้งาน {course.visibleTiers?.length || 0} รายการ</div>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {course.isArchived && (
                          <button
                            type="button"
                            onClick={() => handleRepublishCourse(course.id)}
                            className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditCourse(course)}
                          className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="rounded p-1.5 text-danger hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
