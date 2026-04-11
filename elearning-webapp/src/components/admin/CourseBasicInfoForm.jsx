import React from 'react';
import { Book, Trophy, Clock, Plus, ImageIcon, Upload, Trash2, FileText, Layers, Users, GraduationCap, Video } from 'lucide-react';
import OutcomeListEditor from './OutcomeListEditor';
import BenefitListEditor from './BenefitListEditor';
import CustomDateTimePicker from '../common/CustomDateTimePicker';
import { getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';

const CourseBasicInfoForm = ({
  courseForm,
  setCourseForm,
  categories,
  departments,
  tiers,
  onSaveCourse,
  onImageUpload,
  uploading,
  imageInputRef,
  onClose
}) => {
  return (
    <form onSubmit={onSaveCourse} className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <label className="text-sm font-black text-slate-700 block ml-1 uppercase tracking-wider">ชื่อคอร์ส</label>
        <div className="relative group">
          <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            required 
            type="text" 
            className="form-input w-full pl-12" 
            placeholder="ตั้งชื่อคอร์สให้ดึงดูดใจ..."
            value={courseForm.title} 
            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-black text-slate-700 block ml-1 uppercase tracking-wider">หมวดหมู่</label>
          <select required className="form-input w-full" value={courseForm.categoryId} onChange={(e) => setCourseForm({ ...courseForm, categoryId: e.target.value })}>
            <option value="">เลือกหมวดหมู่</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-black text-slate-700 block ml-1 uppercase tracking-wider">แต้มรางวัล (Points)</label>
          <div className="relative group">
            <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
            <input 
              type="number" 
              className="form-input w-full pl-12" 
              value={courseForm.points} 
              onChange={(e) => setCourseForm({ ...courseForm, points: parseInt(e.target.value || 0) })} 
            />
          </div>
        </div>
      </div>
      <div>
        <div className="relative overflow-hidden rounded-[2rem] border border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-amber-100/40 p-6 backdrop-blur-md shadow-sm transition-all hover:shadow-md mb-6">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl animate-pulse"></div>
          <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-amber-300/10 blur-2xl animate-pulse delay-700"></div>

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-700 shadow-inner">
                <Clock size={24} className="animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-black uppercase tracking-widest text-amber-900/70">คอร์สเรียนชั่วคราว</p>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                </div>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-amber-900/80">
                  คอร์สนี้จะถูกซ่อน <span className="font-bold">อัตโนมัติ</span> เมื่อถึงกำหนดเวลาที่ตั้งไว้
                </p>
              </div>
            </div>
            
            <label className="group flex cursor-pointer select-none items-center gap-3 self-end rounded-2xl border border-amber-300/40 bg-white/80 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-amber-900 shadow-sm transition-all hover:bg-white hover:shadow-md active:scale-95 md:self-start">
              <div className="relative inline-flex h-5 w-5 items-center justify-center">
                <input
                  type="checkbox"
                  checked={Boolean(courseForm.isTemporary)}
                  onChange={(event) =>
                    setCourseForm({
                      ...courseForm,
                      isTemporary: event.target.checked,
                      expiredAt: event.target.checked ? courseForm.expiredAt : '',
                    })
                  }
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-amber-300 transition-all checked:bg-amber-500 checked:border-transparent"
                />
                <Plus size={14} className="absolute text-white opacity-0 transition-opacity peer-checked:opacity-100 rotate-45" />
              </div>
              ใช้งานระบบชั่วคราว
            </label>
          </div>

          {courseForm.isTemporary && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <CustomDateTimePicker
                value={courseForm.expiredAt}
                onChange={(e) => setCourseForm({ ...courseForm, expiredAt: e.target.value })}
                label="กำหนดวันและเวลาหมดอายุ (พ.ศ.)"
              />
            </div>
          )}
        </div>
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
      <div className="space-y-1.5">
        <label className="text-sm font-black text-slate-700 block ml-1 uppercase tracking-wider">รายละเอียด (Description)</label>
        <div className="relative group">
          <FileText className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <textarea 
            rows={4} 
            className="form-input w-full pl-12 resize-none" 
            value={courseForm.description} 
            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} 
            placeholder="เขียนรายละเอียดหลักสูตร ให้พนักงานอยากเรียน..." 
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-black text-slate-900">สิทธิ์การมองเห็นคอร์ส</h4>
          <p className="text-sm text-slate-500">
            กำหนดได้ว่าแผนกไหนและระดับผู้ใช้งานไหนจะเห็นคอร์สนี้ ถ้าไม่จำกัด ระบบจะแสดงคอร์สให้ทุกคน
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
                ถ้าปิดตัวเลือกนี้ ระบบจะใช้แผนกและระดับผู้ใช้งานด้านล่างในการคุมการมองเห็น
              </span>
            </span>
          </label>
        </div>

        {!courseForm.visibleToAll && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3">
                <h5 className="text-sm font-black text-slate-900">แผนกที่เห็นคอร์สได้</h5>
                <p className="text-xs text-slate-500">ถ้าไม่เลือกแผนกเลย จะใช้เฉพาะระดับผู้ใช้งานในการคุมสิทธิ์</p>
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
                <h5 className="text-sm font-black text-slate-900">ระดับผู้ใช้งานที่เห็นคอร์สได้</h5>
                <p className="text-xs text-slate-500">ถ้าเลือกทั้งแผนกและระดับผู้ใช้งาน ผู้ใช้ต้องผ่านเงื่อนไขที่กำหนด</p>
              </div>
              <div className="space-y-2">
                {tiers.length === 0 ? (
                  <p className="text-sm text-slate-500">ยังไม่มีระดับผู้ใช้งานในระบบ กรุณาไปเพิ่มจากหน้าผู้ใช้งานก่อน</p>
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

      <div className="mt-4 pt-6 border-t border-slate-100">
        <h4 className="text-sm font-black text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
           <Layers size={16}/> รายละเอียดหลักสูตรเพิ่มเติม (Premium Display)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-black text-slate-400 uppercase mb-2 flex items-center gap-2">ข้อมูลผู้สอน</p>
            <div>
              <label className="text-xs font-black text-slate-500 block mb-1.5 ml-1">ชื่อผู้สอน</label>
              <div className="relative group">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                <input type="text" placeholder="ระบุชื่อ-นามสกุล..." className="form-input w-full bg-white text-sm py-2.5 pl-10" value={courseForm.instructorName} onChange={(e) => setCourseForm({ ...courseForm, instructorName: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-slate-500 block mb-1.5 ml-1">ตำแหน่ง (Role)</label>
              <div className="relative group">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                <input type="text" placeholder="เช่น ผู้เชี่ยวชาญด้าน..." className="form-input w-full bg-white text-sm py-2.5 pl-10" value={courseForm.instructorRole} onChange={(e) => setCourseForm({ ...courseForm, instructorRole: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm font-black text-slate-400 uppercase mb-3">สื่อและสถิติหลักสูตร</p>
            <div>
              <label className="text-sm font-black text-slate-600 block mb-2 ml-1">วิดีโอตัวอย่าง (YouTube URL)</label>
              <div className="relative group">
                <Video size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input type="text" placeholder="https://youtube.com/..." className="form-input w-full bg-white text-sm py-3 pl-10" value={courseForm.previewVideoUrl} onChange={(e) => setCourseForm({ ...courseForm, previewVideoUrl: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-black text-slate-600 block mb-2 ml-1">ความยาวคอร์สทั้งหมด</label>
              <div className="relative group">
                <Clock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input type="text" placeholder="เช่น 24 ชั่วโมง หรือ 120 นาที" className="form-input w-full bg-white text-sm py-3 pl-10" value={courseForm.totalDuration} onChange={(e) => setCourseForm({ ...courseForm, totalDuration: e.target.value })} />
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

      <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn border-2 border-slate-200 bg-white px-8 text-xs font-black uppercase tracking-[0.15em] text-slate-500 hover:bg-slate-50 transition-all flex-1">
          ยกเลิก
        </button>
        <button type="submit" className="btn btn-primary px-8 text-xs font-black uppercase tracking-[0.15em] shadow-xl flex-1">
          บันทึกข้อมูลคอร์ส
        </button>
      </div>
    </form>
  );
};

export default CourseBasicInfoForm;
