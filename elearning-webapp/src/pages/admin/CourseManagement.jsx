import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import CourseModal from '../../components/admin/CourseModal';
import LessonModal from '../../components/admin/LessonModal';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal State - Course
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [courseForm, setCourseForm] = useState({ 
    title: '', 
    description: '', 
    categoryId: '', 
    points: 100, 
    image: '',
    instructorName: 'ทีมงานวิทยากรผู้เชี่ยวชาญ',
    instructorRole: 'Enterprise Instructor',
    instructorBio: 'ทีมงานผู้มีความเชี่ยวชาญเฉพาะด้านที่ผ่านประสบการณ์การทำงานในองค์กรชั้นนำ พร้อมถ่ายทอดทักษะระดับมืออาชีพให้คุณ',
    previewVideoUrl: '',
    totalDuration: '',
    whatYouWillLearn: '[]',
    whatYouWillGet: '[]',
    rating: 4.8,
    reviewCount: 1240,
    studentCount: 5000
  });
  const [activeTab, setActiveTab] = useState('basic');
  const [quizReports, setQuizReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Modal State - Lesson
  const [lessons, setLessons] = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: '', type: 'video', contentUrl: '', content: '', order: 0, points: 0, passScore: 60, questions: [] });

  // Modal State - Category
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', order: 0 });
  const [editingCatId, setEditingCatId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [courseRes, catRes] = await Promise.all([
        adminAPI.getCourses(),
        adminAPI.getCategories()
      ]);
      setCourses(courseRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Fetch courses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveCat = (index, direction) => {
    const newCats = [...categories];
    if (direction === -1 && index > 0) {
      [newCats[index - 1], newCats[index]] = [newCats[index], newCats[index - 1]];
    } else if (direction === 1 && index < newCats.length - 1) {
      [newCats[index + 1], newCats[index]] = [newCats[index], newCats[index + 1]];
    } else return;
    
    newCats.forEach((c, idx) => c.order = idx);
    setCategories(newCats);
    handleSaveCatOrder(newCats);
  };

  const handleSaveCatOrder = async (orderedCats) => {
    try {
      const categoryIds = orderedCats.map(c => c.id);
      await adminAPI.reorderCategories({ categoryIds });
    } catch (error) {
      console.error('Save order error:', error);
      alert('บันทึกการเรียงลำดับล้มเหลว');
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await adminAPI.updateCourse(editingId, courseForm);
        alert('แก้ไขคอร์สสำเร็จ!');
      } else {
        await adminAPI.createCourse({ ...courseForm, status: 'PUBLISHED' });
        alert('สร้างคอร์สสำเร็จ!');
      }
      setShowModal(false);
      resetCourseForm();
      fetchData();
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const resetCourseForm = () => {
    setCourseForm({ 
      title: '', 
      description: '', 
      categoryId: '', 
      points: 100, 
      image: '',
      instructorName: 'ทีมงานวิทยากรผู้เชี่ยวชาญ',
      instructorRole: 'Enterprise Instructor',
      instructorBio: 'ทีมงานผู้มีความเชี่ยวชาญเฉพาะด้านที่ผ่านประสบการณ์การทำงานในองค์กรชั้นนำ พร้อมถ่ายทอดทักษะระดับมืออาชีพให้คุณ',
      previewVideoUrl: '',
      totalDuration: '',
      whatYouWillLearn: '[]',
      whatYouWillGet: '[]',
      rating: 4.8,
      reviewCount: 1240,
      studentCount: 5000
    });
    setIsEditing(false);
    setEditingId(null);
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
      instructorName: course.instructorName || 'ทีมงานวิทยากรผู้เชี่ยวชาญ',
      instructorRole: course.instructorRole || 'Enterprise Instructor',
      instructorBio: course.instructorBio || '',
      previewVideoUrl: course.previewVideoUrl || '',
      totalDuration: course.totalDuration || '',
      whatYouWillLearn: course.whatYouWillLearn || '[]',
      whatYouWillGet: course.whatYouWillGet || '[]',
      rating: course.rating || 4.8,
      reviewCount: course.reviewCount || 1240,
      studentCount: course.studentCount || 5000
    });
    setActiveTab('basic');
    setShowModal(true);
    fetchLessons(course.id);
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
      const res = await adminAPI.getCourseQuizReports(courseId);
      setQuizReports(res.data);
    } catch (error) {
      console.error('Fetch quiz reports error:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await adminAPI.updateLesson(editingLesson.id, lessonForm);
      } else {
        await adminAPI.createLesson({ ...lessonForm, courseId: editingId });
      }
      setShowLessonModal(false);
      setEditingLesson(null);
      setLessonForm({ title: '', type: 'video', contentUrl: '', content: '', order: 0, points: 0, passScore: 60, questions: [] });
      fetchLessons(editingId);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกเนื้อหา');
    }
  };

  const deleteLesson = async (lessonId) => {
    if (confirm('ยืนยันการลบบทเรียนนี้?')) {
      try {
        await adminAPI.deleteLesson(lessonId);
        fetchLessons(editingId);
      } catch (error) {
        alert('ลบไม่สำเร็จ');
      }
    }
  };

  const openAddCourse = () => {
    resetCourseForm();
    setShowModal(true);
  };

  // CATEGORY ACTIONS
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCatId) {
        await adminAPI.updateCategory(editingCatId, catForm);
      } else {
        await adminAPI.createCategory(catForm);
      }
      setCatForm({ name: '', order: 0 });
      setEditingCatId(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการจัดการหมวดหมู่');
    }
  };

  const handleDeleteCat = async (id) => {
    if (confirm('ยืนยันการลบหมวดหมู่? (คอร์สในหมวดนี้อาจได้รับผลกระทบ)')) {
      try {
        await adminAPI.deleteCategory(id);
        fetchData();
      } catch (error) {
        alert('ลบไม่สำเร็จ กรุณาตรวจสอบว่ามีคอร์สค้างอยู่ในหมวดนี้หรือไม่');
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('ยืนยันการลบคอร์สเรียนนี้?')) {
      try {
        await adminAPI.deleteCourse(id);
        setCourses(courses.filter(c => c.id !== id));
      } catch (error) {
        console.error('Delete course error', error);
        alert('ลบคอร์สไม่สำเร็จ');
      }
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminAPI.uploadFile(file);
      setCourseForm({ ...courseForm, image: res.data.fileUrl });
    } catch (error) {
      alert('อัปโหลดรูปไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminAPI.uploadFile(file);
      setLessonForm({ ...lessonForm, contentUrl: res.data.fileUrl });
    } catch (error) {
      alert('อัปโหลดเอกสารไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">จัดการคอร์สเรียน</h2>
          <p className="text-muted text-sm">เพิ่ม ลบ หรือแก้ไขข้อมูลคอร์สเรียนในระบบ</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCatModal(true)} className="btn btn-outline">
            เพิ่ม/แก้ไข หมวดหมู่
          </button>
          <button onClick={openAddCourse} className="btn btn-primary">
            <Plus size={18} /> สร้างคอร์สใหม่
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
        lessons={lessons}
        loadingReports={loadingReports}
        quizReports={quizReports}
        onSaveCourse={handleSaveCourse}
        onImageUpload={handleImageUpload}
        onEditLesson={(lesson) => { setEditingLesson(lesson); setLessonForm(lesson); setShowLessonModal(true); }}
        onDeleteLesson={deleteLesson}
        onAddLesson={() => { setEditingLesson(null); setLessonForm({ title: '', type: 'video', contentUrl: '', content: '', order: lessons.length + 1, points: 0, passScore: 60, questions: [] }); setShowLessonModal(true); }}
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

      {/* Category Management Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="card bg-white w-full max-md p-6 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">จัดการหมวดหมู่</h3>
              <button onClick={() => setShowCatModal(false)} className="text-muted hover:text-gray-800">ปิด</button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex gap-2 mb-6">
              <input required type="text" placeholder="ชื่อหมวดหมู่ใหม่..." className="form-input flex-1" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} />
              <button type="submit" className="btn btn-primary">{editingCatId ? 'บันทึก' : 'เพิ่ม'}</button>
            </form>

            <div className="flex-1 overflow-y-auto">
              <p className="text-xs font-bold text-muted mb-2 uppercase">รายการปัจจุบัน</p>
              <div className="flex flex-col gap-2">
                {categories.map((cat, index) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <div className="flex gap-2 items-center">
                      <div className="flex flex-col mr-2 bg-white rounded shadow-sm border border-slate-100 pb-[1px]">
                         <button disabled={index === 0} onClick={() => handleMoveCat(index, -1)} className="text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 p-0.5"><ArrowUp size={14} strokeWidth={3}/></button>
                         <button disabled={index === categories.length - 1} onClick={() => handleMoveCat(index, 1)} className="text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 p-0.5"><ArrowDown size={14} strokeWidth={3}/></button>
                      </div>
                      <button onClick={() => { setEditingCatId(cat.id); setCatForm({ name: cat.name, order: cat.order }); }} className="text-primary p-1.5 hover:bg-primary/10 rounded transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteCat(cat.id)} className="text-danger p-1.5 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-wrap justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="ค้นหาคอร์ส..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-border rounded-md focus:outline-none focus:border-primary text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 text-sm">
            <select 
              className="border border-border rounded-md px-3 py-2 bg-white text-muted focus:outline-none cursor-pointer"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">ทุกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-border text-sm text-muted">
                  <th className="p-4 font-medium">ชื่อคอร์ส</th>
                  <th className="p-4 font-medium">หมวดหมู่</th>
                  <th className="p-4 font-medium text-center">ผู้เรียน</th>
                  <th className="p-4 font-medium text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {courses
                  .filter(c => {
                    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesCat = selectedCategory === 'ALL' || c.categoryId === selectedCategory;
                    return matchesSearch && matchesCat;
                  })
                  .map((course) => (
                  <tr key={course.id} className="border-b border-border hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium">{course.title}</td>
                    <td className="p-4 text-sm text-muted">{course.category?.name || 'Uncategorized'}</td>
                    <td className="p-4 text-sm text-center">{course._count?.enrollments || 0}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditCourse(course)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(course.id)} className="p-1.5 text-danger hover:bg-red-50 rounded"><Trash2 size={16} /></button>
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
