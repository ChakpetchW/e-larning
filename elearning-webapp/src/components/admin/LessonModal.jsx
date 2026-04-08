import React, { useRef } from 'react';
import { X, Upload, FileText, Play } from 'lucide-react';
import QuizBuilder from './QuizBuilder';
import ModalPortal from '../common/ModalPortal';

const LessonModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  lessonForm, 
  setLessonForm, 
  uploading, 
  onDocUpload,
  isEditing = false
}) => {
  const docInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(e);
  };

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 lg:p-8 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="card bg-white w-full max-w-6xl h-full p-0 shadow-2xl overflow-hidden flex flex-col border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h4 className="text-lg font-bold">{isEditing ? 'แก้ไขบทเรียน' : 'เพิ่มบทเรียนใหม่'}</h4>
          <button onClick={onClose} className="text-muted hover:text-gray-900"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-700 block mb-1">ชื่อบทเรียน/บทที่</label>
                <input 
                  required 
                  type="text" 
                  className="form-input w-full" 
                  value={lessonForm.title} 
                  onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} 
                  placeholder="เช่น บทนำเครื่องจักร" 
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">ประเภทเนื้อหา</label>
                <select 
                  className="form-input w-full" 
                  value={lessonForm.type} 
                  onChange={e => setLessonForm({ ...lessonForm, type: e.target.value })}
                >
                  <option value="video">วิดีโอ (YouTube / Vimeo)</option>
                  <option value="pdf">เอกสาร (PDF/Link)</option>
                  <option value="article">บทความเนื้อหา</option>
                  <option value="quiz">แบบทดสอบ (Quiz)</option>
                </select>
              </div>

              {lessonForm.type !== 'quiz' ? (
                <>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">
                      {lessonForm.type === 'video' ? 'ลิงก์วิดีโอ (YouTube / Vimeo)' : 'ไฟล์เอกสาร'}
                    </label>
                    {lessonForm.type === 'video' ? (
                      <div className="flex flex-col gap-1.5">
                        <input
                          type="text"
                          className="form-input w-full"
                          value={lessonForm.contentUrl}
                          onChange={e => setLessonForm({ ...lessonForm, contentUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=... หรือ https://vimeo.com/..."
                        />
                        <p className="text-[10px] text-muted flex items-center gap-1">
                          <Play size={10} /> รองรับลิงก์ YouTube และ Vimeo
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <input 
                          type="file" 
                          ref={docInputRef} 
                          onChange={onDocUpload} 
                          className="hidden" 
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" 
                        />
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            className="form-input flex-1 font-mono text-xs" 
                            value={lessonForm.contentUrl} 
                            onChange={e => setLessonForm({ ...lessonForm, contentUrl: e.target.value })} 
                            placeholder="URL หรืออัปโหลดไฟล์" 
                            readOnly={uploading} 
                          />
                          <button 
                            type="button" 
                            onClick={() => docInputRef.current?.click()} 
                            disabled={uploading} 
                            className="btn btn-outline btn-sm shrink-0 gap-1"
                          >
                            {uploading ? (
                              <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            ) : (
                              <Upload size={14} />
                            )}
                            อัปโหลด
                          </button>
                        </div>
                        {lessonForm.contentUrl && (
                          <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                            <FileText size={12} /> อัปโหลดไฟล์แล้ว
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 block mb-1">เนื้อหาบทเรียน (Text/Content)</label>
                    <textarea
                      rows={8}
                      className="form-input w-full font-mono text-sm"
                      value={lessonForm.content || ''}
                      onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
                      placeholder="เขียนเนื้อหาบทเรียนที่นี่ (รองรับข้อความดิบหรือคำอธิบาย)..."
                    />
                    <p className="text-[10px] text-muted mt-1">คุณสามารถเขียนเนื้อหาบรรยายประกอบ หรือใส่รายละเอียดเพิ่มเติมที่นี่เพื่อให้ผู้เรียนอ่านได้โดยไม่ต้องเปิดไฟล์แยก</p>
                  </div>
                </>
              ) : (
                <div className="md:col-span-2 flex flex-col gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-2 relative">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h5 className="font-bold text-lg text-primary">สเปคแบบทดสอบ (Quiz Builder)</h5>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-sm font-bold text-gray-700 block mb-1">คะแนนรวมที่จะได้รับ (Points)</label>
                       <input 
                         type="number" 
                         className="form-input w-full" 
                         value={lessonForm.points} 
                         onChange={e => setLessonForm({...lessonForm, points: parseInt(e.target.value) || 0})} 
                       />
                    </div>
                    <div>
                       <label className="text-sm font-bold text-gray-700 block mb-1">เกณฑ์สอบผ่าน (Pass Score %)</label>
                       <input 
                         type="number" 
                         className="form-input w-full" 
                         value={lessonForm.passScore} 
                         onChange={e => setLessonForm({...lessonForm, passScore: parseInt(e.target.value) || 0})} 
                       />
                    </div>
                  </div>
                  
                  <QuizBuilder 
                    questions={lessonForm.questions}
                    onChange={(questions) => setLessonForm({ ...lessonForm, questions })}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1 py-3">ยกเลิก</button>
            <button type="submit" className="btn btn-primary flex-1 py-3 font-bold">บันทึกบทเรียน</button>
          </div>
        </form>
      </div>
      </div>
    </ModalPortal>
  );
};

export default LessonModal;
