import React, { useRef } from 'react';
import { X, Upload, Trash2, ImageIcon, Video, Clock, Layers, Plus, FileText, Play, Edit } from 'lucide-react';
import OutcomeListEditor from './OutcomeListEditor';
import BenefitListEditor from './BenefitListEditor';
import { getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';

const CourseModal = ({
  isOpen,
  onClose,
  isEditing,
  editingId,
  activeTab,
  setActiveTab,
  courseForm,
  setCourseForm,
  categories,
  departments,
  tiers,
  lessons,
  loadingReports,
  quizReports,
  onSaveCourse,
  onImageUpload,
  onEditLesson,
  onDeleteLesson,
  onAddLesson,
  fetchQuizReports,
  uploading
}) => {
  const imageInputRef = useRef(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 lg:p-8 backdrop-blur-sm animate-fade-in overflow-hidden">
      <div className="card bg-white w-full max-w-6xl h-full overflow-hidden shadow-xl flex flex-col m-auto border border-gray-100">
        {/* Header & Tabs */}
        <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-bold">{isEditing ? 'แก้ไขคอร์สเรียน' : 'สร้างคอร์สใหม่'}</h3>
          <button onClick={onClose} className="text-muted hover:text-gray-900"><X size={20} /></button>
        </div>

        {isEditing && (
          <div className="flex border-b border-border px-4 bg-white">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-3 px-6 text-sm font-bold transition-colors border-b-2 ${activeTab === 'basic' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-gray-700'}`}
            >
              ข้อมูลทั่วไป
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-3 px-6 text-sm font-bold transition-colors border-b-2 ${activeTab === 'content' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-gray-700'}`}
            >
              เนื้อหาหลักสูตร ({lessons.length})
            </button>
            <button
              onClick={() => { setActiveTab('reports'); fetchQuizReports(editingId); }}
              className={`py-3 px-6 text-sm font-bold transition-colors border-b-2 ${activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-gray-700'}`}
            >
              รายงานผลสอบ
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeTab === 'reports' ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-bold text-gray-800">ประวัติการทำแบบทดสอบในคอร์สนี้ทั้งหมด ({quizReports.length} รายการ)</p>
              </div>
              
              {loadingReports ? (
                <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
              ) : quizReports.length > 0 ? (
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-muted">
                        <th className="p-3 font-medium">ชื่อผู้ใช้</th>
                        <th className="p-3 font-medium">อีเมล</th>
                        <th className="p-3 font-medium">แผนก</th>
                        <th className="p-3 font-medium">บททดสอบ</th>
                        <th className="p-3 font-medium text-center">คะแนน</th>
                        <th className="p-3 font-medium text-center">ผลลัพธ์</th>
                        <th className="p-3 font-medium text-right">วันเวลาที่ส่ง</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizReports.map((report) => (
                        <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-medium">{report.user.name}</td>
                          <td className="p-3 text-muted">{report.user.email}</td>
                          <td className="p-3 max-w-[120px] truncate" title={report.user.department}>{report.user.department || '-'}</td>
                          <td className="p-3 text-muted truncate max-w-[150px]">{report.lesson.title}</td>
                          <td className="p-3 text-center font-bold">
                            {report.score}% 
                            <span className="text-[10px] text-gray-400 font-normal ml-1">(เกณฑ์ {report.lesson.passScore || 60}%)</span>
                          </td>
                          <td className="p-3 text-center">
                            {report.status === 'PASSED' ? (
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">ผ่าน</span>
                            ) : (
                              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">ไม่ผ่าน</span>
                            )}
                          </td>
                          <td className="p-3 text-right text-muted text-xs">
                            {new Date(report.createdAt).toLocaleString('th-TH')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                  <FileText size={32} className="mb-2 opacity-20" />
                  <p className="text-sm">ยังไม่มีประวัติการทำแบบทดสอบในคอร์สนี้</p>
                </div>
              )}
            </div>
          ) : activeTab === 'basic' ? (
            <form onSubmit={onSaveCourse} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">ชื่อคอร์ส</label>
                <input required type="text" className="form-input w-full" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">หมวดหมู่</label>
                <select required className="form-input w-full" value={courseForm.categoryId} onChange={(e) => setCourseForm({ ...courseForm, categoryId: e.target.value })}>
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">แต้มรางวัล (Points)</label>
                <input type="number" className="form-input w-full" value={courseForm.points} onChange={(e) => setCourseForm({ ...courseForm, points: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">รูปหน้าปกคอร์ส</label>
                <input type="file" ref={imageInputRef} accept="image/*" onChange={onImageUpload} className="hidden" />

                {courseForm.image ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={getFullUrl(courseForm.image) || DEFAULT_COURSE_IMAGE}
                      alt="Course thumbnail"
                      className="w-full h-40 object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="flex gap-2 p-2 bg-white border-t border-gray-100">
                      <button type="button" onClick={() => imageInputRef.current?.click()} className="btn btn-outline btn-sm flex-1 text-xs" disabled={uploading}>
                        <Upload size={14} /> เปลี่ยนรูป
                      </button>
                      <button type="button" onClick={() => setCourseForm({ ...courseForm, image: '' })} className="btn btn-outline btn-sm text-xs text-danger border-danger/30">
                        <Trash2 size={14} /> ลบ
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-40 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    {uploading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-xs font-bold">กำลังอัปโหลด...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={32} />
                        <span className="text-xs font-bold">คลิกเพื่ออัปโหลดรูปหน้าปก</span>
                        <span className="text-[10px]">รองรับ JPG, PNG, WebP</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">รายละเอียด (Description)</label>
                <textarea rows={3} className="form-input w-full" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="คำอธิบายสั้นๆ ของคอร์สนี้..." />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex flex-col gap-1">
                  <h4 className="text-base font-black text-slate-900">สิทธิ์การมองเห็นคอร์ส</h4>
                  <p className="text-sm text-slate-500">
                    กำหนดได้ว่าแผนกไหนและ tier ไหนจะเห็นคอร์สนี้ ถ้าไม่จำกัด ระบบจะแสดงคอร์สให้ทุกคน
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={courseForm.visibleToAll}
                      onChange={(event) =>
                        setCourseForm({
                          ...courseForm,
                          visibleToAll: event.target.checked,
                          visibleDepartmentIds: event.target.checked ? [] : courseForm.visibleDepartmentIds,
                          visibleTierIds: event.target.checked ? [] : courseForm.visibleTierIds,
                        })
                      }
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span>
                      <span className="block text-sm font-bold text-slate-900">เปิดให้ทุกคนเห็นคอร์สนี้</span>
                      <span className="block text-xs text-slate-500">
                        ถ้าปิดตัวเลือกนี้ ระบบจะใช้แผนกและ tier ด้านล่างในการคุมการมองเห็น
                      </span>
                    </span>
                  </label>
                </div>

                {!courseForm.visibleToAll && (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-3">
                        <h5 className="text-sm font-black text-slate-900">แผนกที่เห็นคอร์สได้</h5>
                        <p className="text-xs text-slate-500">ถ้าไม่เลือกแผนกเลย จะใช้เฉพาะการคุมด้วย tier</p>
                      </div>
                      <div className="space-y-2">
                        {departments.length === 0 ? (
                          <p className="text-sm text-slate-500">ยังไม่มีแผนกในระบบ กรุณาไปเพิ่มจากหน้าผู้ใช้งานก่อน</p>
                        ) : (
                          departments.map((department) => (
                            <label key={department.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={courseForm.visibleDepartmentIds.includes(department.id)}
                                onChange={(event) => {
                                  const nextIds = event.target.checked
                                    ? [...courseForm.visibleDepartmentIds, department.id]
                                    : courseForm.visibleDepartmentIds.filter((id) => id !== department.id);

                                  setCourseForm({
                                    ...courseForm,
                                    visibleDepartmentIds: nextIds,
                                  });
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                              />
                              {department.name}
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-3">
                        <h5 className="text-sm font-black text-slate-900">Tier ที่เห็นคอร์สได้</h5>
                        <p className="text-xs text-slate-500">ถ้าเลือกทั้งแผนกและ tier ผู้ใช้ต้องผ่านเงื่อนไขที่กำหนด</p>
                      </div>
                      <div className="space-y-2">
                        {tiers.length === 0 ? (
                          <p className="text-sm text-slate-500">ยังไม่มี tier ในระบบ กรุณาไปเพิ่มจากหน้าผู้ใช้งานก่อน</p>
                        ) : (
                          tiers.map((tier) => (
                            <label key={tier.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={courseForm.visibleTierIds.includes(tier.id)}
                                onChange={(event) => {
                                  const nextIds = event.target.checked
                                    ? [...courseForm.visibleTierIds, tier.id]
                                    : courseForm.visibleTierIds.filter((id) => id !== tier.id);

                                  setCourseForm({
                                    ...courseForm,
                                    visibleTierIds: nextIds,
                                  });
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                              />
                              {tier.name}
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Group: Instructor & Metadata */}
              <div className="mt-4 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-black text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                   <Layers size={16}/> รายละเอียดหลักสูตรเพิ่มเติม (Premium Display)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase mb-2 flex items-center gap-2">ข้อมูลผู้สอน</p>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">ชื่อผู้สอน</label>
                      <input type="text" placeholder="ชื่อ-นามสกุล" className="form-input w-full bg-white text-base py-2.5" value={courseForm.instructorName} onChange={(e) => setCourseForm({ ...courseForm, instructorName: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">ตำแหน่ง (Role)</label>
                      <input type="text" placeholder="เช่น Enterprise Instructor" className="form-input w-full bg-white text-base py-2.5" value={courseForm.instructorRole} onChange={(e) => setCourseForm({ ...courseForm, instructorRole: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">ประวัติย่อ (Bio)</label>
                      <textarea placeholder="แนะนำตัวผู้สอนสั้นๆ..." rows={3} className="form-input w-full bg-white text-base py-2.5" value={courseForm.instructorBio} onChange={(e) => setCourseForm({ ...courseForm, instructorBio: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-black text-slate-400 uppercase mb-3">สื่อและสถิติหลักสูตร</p>
                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-1.5">วิดีโอตัวอย่าง (YouTube URL)</label>
                      <div className="flex items-center gap-2">
                        <Video size={18} className="text-slate-400" />
                        <input type="text" placeholder="https://youtube.com/..." className="form-input flex-1 bg-white text-base py-3" value={courseForm.previewVideoUrl} onChange={(e) => setCourseForm({ ...courseForm, previewVideoUrl: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-1.5">ความยาวคอร์สทั้งหมด</label>
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-slate-400" />
                        <input type="text" placeholder="เช่น 24 ชั่วโมง หรือ 120 นาที" className="form-input flex-1 bg-white text-base py-3" value={courseForm.totalDuration} onChange={(e) => setCourseForm({ ...courseForm, totalDuration: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-2">
                       <div>
                         <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">เรตติ้ง (0-5)</label>
                         <input type="number" step="0.1" placeholder="4.8" className="form-input w-full bg-white text-base py-2.5" value={courseForm.rating} onChange={(e) => setCourseForm({ ...courseForm, rating: e.target.value })} />
                       </div>
                       <div>
                         <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">รีวิว (คน)</label>
                         <input type="number" placeholder="1240" className="form-input w-full bg-white text-base py-2.5" value={courseForm.reviewCount} onChange={(e) => setCourseForm({ ...courseForm, reviewCount: e.target.value })} />
                       </div>
                       <div>
                         <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">ผู้เรียน (คน)</label>
                         <input type="number" placeholder="5000" className="form-input w-full bg-white text-base py-2.5" value={courseForm.studentCount} onChange={(e) => setCourseForm({ ...courseForm, studentCount: e.target.value })} />
                       </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-2xl border-2 border-slate-100 mt-4">
                     <div className="space-y-4">
                        <label className="text-xl font-black text-slate-900 flex items-center gap-2">
                          <Plus size={22} className="text-emerald-500"/> สิ่งที่จะได้เรียนรู้ (Outcomes)
                        </label>
                        <OutcomeListEditor 
                          value={courseForm.whatYouWillLearn} 
                          onChange={(val) => setCourseForm({ ...courseForm, whatYouWillLearn: val })} 
                        />
                     </div>

                     <div className="space-y-4">
                        <label className="text-xl font-black text-slate-900 flex items-center gap-2">
                          <Layers size={22} className="text-primary"/> สิ่งที่จะได้รับพิเศษ (Benefits)
                        </label>
                        <BenefitListEditor 
                          value={courseForm.whatYouWillGet} 
                          onChange={(val) => setCourseForm({ ...courseForm, whatYouWillGet: val })} 
                        />
                     </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button type="button" onClick={onClose} className="btn btn-outline flex-1">ยกเลิก</button>
                <button type="submit" className="btn btn-primary flex-1">บันทึกข้อมูลคอร์ส</button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-muted uppercase">บทเรียนทั้งหมด</p>
                <button 
                  type="button" 
                  onClick={onAddLesson} 
                  className="btn btn-primary btn-sm rounded-lg text-xs"
                >
                  + เพิ่มบทเรียน
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group transition-all hover:border-primary/20 hover:shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 font-bold text-xs text-muted">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {lesson.type === 'video' ? <Play size={12} className="text-primary" /> : <FileText size={12} className="text-blue-500" />}
                        <h4 className="text-sm font-bold truncate">{lesson.title}</h4>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate font-medium">{lesson.contentUrl || 'ไม่มีที่อยู่ไฟล์'}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEditLesson(lesson)} 
                        className="p-1.5 hover:bg-white rounded transition-colors text-primary"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => onDeleteLesson(lesson.id)} 
                        className="p-1.5 hover:bg-white rounded transition-colors text-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {lessons.length === 0 && (
                  <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                    <Layers size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">ยังไม่มีเนื้อหาในคอร์สนี้</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseModal;
