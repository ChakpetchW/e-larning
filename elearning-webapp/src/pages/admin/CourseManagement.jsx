import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Edit, Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import CourseModal from '../../components/admin/CourseModal';
import LessonModal from '../../components/admin/LessonModal';

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
});

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
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

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
  const [categoryForm, setCategoryForm] = useState({ name: '', order: 0, visibleToAll: true, visibleDepartmentIds: [], visibleTierIds: [] });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
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
      if (isEditing) {
        await adminAPI.updateCourse(editingId, courseForm);
        alert('อัปเดตคอร์สเรียบร้อย');
      } else {
        await adminAPI.createCourse({ ...courseForm, status: 'PUBLISHED' });
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
      const response = await adminAPI.uploadFile(file);
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
      const response = await adminAPI.uploadFile(file);
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
      if (editingCategoryId) {
        await adminAPI.updateCategory(editingCategoryId, categoryForm);
      } else {
        await adminAPI.createCategory(categoryForm);
      }

      setCategoryForm({ name: '', order: 0, visibleToAll: true, visibleDepartmentIds: [], visibleTierIds: [] });
      setEditingCategoryId(null);
      fetchData();
    } catch (error) {
      console.error('Save category error:', error);
      alert(error.response?.data?.message || 'ไม่สามารถบันทึกหมวดหมู่ได้');
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
    const reordered = [...categories];

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

    setCategories(normalized);

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
      return matchesSearch && matchesCategory;
    })
  ), [courses, searchTerm, selectedCategory]);

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
          <button onClick={() => setShowCategoryModal(true)} className="btn btn-outline">
            จัดการหมวดหมู่
          </button>
          <button onClick={openAddCourse} className="btn btn-primary">
            <Plus size={18} />
            สร้างคอร์สใหม่
          </button>
        </div>
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
        categories={categories}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            className="card flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="category-modal-title" className="text-xl font-bold">จัดการหมวดหมู่</h3>
              <button 
                type="button"
                aria-label="ปิดหน้าต่างจัดการหมวดหมู่"
                onClick={() => { setShowCategoryModal(false); setEditingCategoryId(null); setCategoryForm({ name: '', order: 0, visibleToAll: true, visibleDepartmentIds: [], visibleTierIds: [] }); }} 
                className="text-muted hover:text-gray-800"
              >
                ปิด
              </button>
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
                    onClick={() => { setEditingCategoryId(null); setCategoryForm({ name: '', order: 0, visibleToAll: true, visibleDepartmentIds: [], visibleTierIds: [] }); }}
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                  >
                    ยกเลิกการแก้ไข
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  required
                  type="text"
                  placeholder="ชื่อหมวดหมู่..."
                  className={`form-input flex-1 bg-white px-4 py-3 text-sm font-bold transition-all ${
                    editingCategoryId ? 'border-primary/50 ring-2 ring-primary/10' : 'border-slate-200'
                  }`}
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
                />
                <button type="submit" className={`btn ${editingCategoryId ? 'bg-slate-900 text-white px-8' : 'btn-primary px-6'} text-xs font-black uppercase tracking-widest shadow-lg`}>
                  {editingCategoryId ? 'บันทึก' : 'เพิ่ม'}
                </button>
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
                {categories.map((category, index) => {
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
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-black tracking-tight ${isEditing ? 'text-primary' : 'text-slate-900 font-bold'}`}>
                          {category.name}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
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
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <div className="flex flex-col rounded-lg border border-slate-100 bg-slate-50 overflow-hidden shadow-sm">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveCategory(index, -1)}
                            className="p-1 text-slate-400 hover:bg-white hover:text-primary disabled:opacity-30 transition-all border-b border-slate-100"
                          >
                            <ArrowUp size={14} strokeWidth={3} />
                          </button>
                          <button
                            type="button"
                            disabled={index === categories.length - 1}
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
                                order: category.order,
                                visibleToAll: category.visibleToAll ?? true,
                                visibleDepartmentIds: category.visibleDepartmentIds || [],
                                visibleTierIds: category.visibleTierIds || [],
                              });
                            }}
                            className="rounded-xl bg-slate-50 p-2 text-primary transition-all hover:bg-primary hover:text-white"
                          >
                            <Edit2 size={16} />
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
            {categories.map((category) => (
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
                    <td className="p-4 font-medium">{course.title}</td>
                    <td className="p-4 text-sm text-muted">{course.category?.name || 'Uncategorized'}</td>
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
