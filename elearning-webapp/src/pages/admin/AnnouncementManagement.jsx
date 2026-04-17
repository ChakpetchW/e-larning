import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, BellPlus, CalendarClock, Edit3, History, Search, Trash2, Upload, X } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../utils/imageUtils';
import { canEditAdminUsers } from '../../utils/roles';
import useConfirm from '../../hooks/useConfirm';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTable from '../../components/admin/AdminTable';
import ModalPortal from '../../components/common/ModalPortal';
import RichTextEditor from '../../components/common/RichTextEditor';
import QuizBuilder from '../../components/admin/QuizBuilder';
import CustomDateTimePicker from '../../components/common/CustomDateTimePicker';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ENTITY_VIEW_STATUS } from '../../utils/constants/statuses';
import { formatThaiDateTime } from '../../utils/dateUtils';

const getDefaultForm = (departmentId = '') => ({
  title: '',
  description: '',
  image: '',
  departmentId,
  type: 'article',
  contentUrl: '',
  content: '',
  duration: 0,
  passScore: 60,
  questions: [],
  expiredAt: '',
});

const getTypeLabel = (type) => {
  if (type === 'video') return 'วิดีโอ';
  if (type === 'quiz') return 'แบบทดสอบ';
  if (type === 'pdf' || type === 'document') return 'เอกสาร';
  return 'บทความ';
};

const AnnouncementManagement = () => {
  const toast = useToast();
  const { confirm, ConfirmDialogProps } = useConfirm();
  const docInputRef = useRef(null);
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const isFullAdmin = canEditAdminUsers(user);

  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editorImageUploading, setEditorImageUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(ENTITY_VIEW_STATUS.ACTIVE);
  const [form, setForm] = useState(getDefaultForm());
  
  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentAnnouncementTitle, setCurrentAnnouncementTitle] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [announcementRes, departmentRes] = await Promise.all([
        adminAPI.getAnnouncements(),
        adminAPI.getDepartments(),
      ]);

      const nextAnnouncements = Array.isArray(announcementRes?.data) ? announcementRes.data : [];
      const nextDepartments = Array.isArray(departmentRes?.data) ? departmentRes.data : [];

      setAnnouncements(nextAnnouncements);
      setDepartments(nextDepartments);
      setForm((current) => current.departmentId || !nextDepartments.length
        ? current
        : { ...current, departmentId: nextDepartments[0].id });
    } catch (error) {
      console.error('Fetch announcement data error:', error);
      toast.error('ไม่สามารถโหลดข้อมูลประกาศได้');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingAnnouncement(null);
    setForm(getDefaultForm(departments[0]?.id || user?.departmentId || ''));
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (announcement) => {
    setEditingAnnouncement(announcement);
    setForm({
      title: announcement.title || '',
      description: announcement.description || '',
      image: announcement.image || '',
      departmentId: announcement.departmentId || departments[0]?.id || '',
      type: announcement.type || 'article',
      contentUrl: announcement.contentUrl || '',
      content: announcement.content || '',
      duration: Number(announcement.duration) || 0,
      passScore: announcement.passScore || 60,
      questions: announcement.questions || [],
      expiredAt: announcement.expiredAt || '',
    });
    setShowModal(true);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const compressedFile = await compressImage(file);
      const response = await adminAPI.uploadFile(compressedFile);
      setForm((current) => ({ ...current, image: response.data.fileUrl }));
      toast.success('อัปโหลดภาพประกาศเรียบร้อย');
    } catch (error) {
      console.error('Upload announcement image error:', error);
      toast.error('อัปโหลดภาพไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  const handleDocUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const compressedFile = file.type.startsWith('image/') ? await compressImage(file) : file;
      const response = await adminAPI.uploadFile(compressedFile);
      setForm((current) => ({ ...current, contentUrl: response.data.fileUrl }));
      toast.success('อัปโหลดไฟล์เนื้อหาประกาศเรียบร้อย');
    } catch (error) {
      console.error('Upload announcement document error:', error);
      toast.error('อัปโหลดไฟล์ไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  const handleEditorImageUpload = async (file) => {
    if (!file?.type?.startsWith('image/')) {
      toast.error('รองรับเฉพาะไฟล์รูปภาพ');
      return '';
    }

    try {
      setEditorImageUploading(true);
      const compressedFile = await compressImage(file);
      const response = await adminAPI.uploadFile(compressedFile);
      return response.data.fileUrl;
    } catch (error) {
      console.error('Upload announcement editor image error:', error);
      toast.error('อัปโหลดรูปในเนื้อหาไม่สำเร็จ');
      return '';
    } finally {
      setEditorImageUploading(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.expiredAt) {
      toast.error('กรุณากำหนดวันหมดอายุของประกาศ');
      return;
    }

    if (!form.departmentId) {
      toast.error('กรุณาเลือกแผนก');
      return;
    }

    try {
      const payload = {
        ...form,
        duration: Number(form.duration) || 0,
        passScore: Number(form.passScore) || 60,
      };

      if (editingAnnouncement) {
        await adminAPI.updateAnnouncement(editingAnnouncement.id, payload);
        toast.success('อัปเดตประกาศเรียบร้อย');
      } else {
        await adminAPI.createAnnouncement(payload);
        toast.success('สร้างประกาศเรียบร้อย');
      }

      setShowModal(false);
      resetForm();
      await fetchData();
    } catch (error) {
      console.error('Save announcement error:', error);
      toast.error(error.response?.data?.message || 'ไม่สามารถบันทึกประกาศได้');
    }
  };

  const handleArchive = async (announcement) => {
    const ok = await confirm({
      title: 'ต้องการเก็บประกาศลงกรุ?',
      message: `ประกาศ "${announcement.title}" จะหมดอายุทันทีและถูกย้ายไปยังแท็บ "หมดอายุแล้ว" คุณต้องการดำเนินการต่อใช่หรือไม่?`,
      confirmLabel: 'แจ้งหมดอายุ',
      variant: 'warning',
    });

    if (!ok) return;

    try {
      await adminAPI.archiveAnnouncement(announcement.id);
      toast.success('ย้ายประกาศลงกรุเรียบร้อย');
      await fetchData();
    } catch (error) {
      console.error('Archive announcement error:', error);
      toast.error('ไม่สามารถเก็บประกาศลงกรุได้');
    }
  };

  const handleViewHistory = async (announcement) => {
    try {
      setHistoryLoading(true);
      setCurrentAnnouncementTitle(announcement.title);
      setShowHistoryModal(true);
      const response = await adminAPI.getAnnouncementHistory(announcement.id);
      setHistoryData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('View history error:', error);
      toast.error('ไม่สามารถโหลดข้อมูลประวัติได้');
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    const now = new Date();
    return announcements.filter((announcement) => {
      const isArchived = announcement.expiredAt ? new Date(announcement.expiredAt) <= now : false;
      const matchesView = viewMode === ENTITY_VIEW_STATUS.ARCHIVED ? isArchived : !isArchived;
      const keyword = `${announcement.title} ${announcement.department?.name || ''}`.toLowerCase();
      const matchesSearch = keyword.includes(searchTerm.toLowerCase());
      return matchesView && matchesSearch;
    });
  }, [announcements, searchTerm, viewMode]);

  const activeCount = useMemo(
    () => announcements.filter((announcement) => !announcement.expiredAt || new Date(announcement.expiredAt) > new Date()).length,
    [announcements],
  );

  const archivedCount = announcements.length - activeCount;

  const columns = [
    { label: 'ประกาศ' },
    { label: 'แผนก', className: 'min-w-[140px]' },
    { label: 'ชนิดหน้า', className: 'min-w-[120px]' },
    { label: 'หมดอายุ', className: 'min-w-[180px]' },
    { label: 'จัดการ', className: 'w-[160px]' },
  ];

  const renderSourceField = () => {
    if (form.type === 'video') {
      return (
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">ลิงก์วิดีโอ</label>
          <input
            type="text"
            className="form-input w-full"
            value={form.contentUrl}
            onChange={(event) => setForm((current) => ({ ...current, contentUrl: event.target.value }))}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
      );
    }

    if (form.type === 'pdf' || form.type === 'document') {
      return (
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">ไฟล์เอกสาร</label>
          <input
            ref={docInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            onChange={handleDocUpload}
          />
          <div className="flex gap-2">
            <input
              type="text"
              className="form-input flex-1 font-mono text-xs"
              value={form.contentUrl}
              onChange={(event) => setForm((current) => ({ ...current, contentUrl: event.target.value }))}
              placeholder="URL หรืออัปโหลดไฟล์"
            />
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="btn btn-outline btn-sm gap-1"
              disabled={uploading}
            >
              <Upload size={14} />
              อัปโหลด
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3">
        <p className="text-sm font-bold text-primary">เนื้อหาประกาศจะแสดงจาก editor ด้านล่าง</p>
        <p className="mt-1 text-xs text-muted">เหมาะสำหรับบทความประกาศหรือข้อความสำคัญที่ต้องการจัดรูปแบบ</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <AdminPageHeader
        title="จัดการประกาศแผนก"
        subtitle={isFullAdmin ? 'สร้างและดูประกาศได้ทุกแผนก' : `ดูแลประกาศสำหรับแผนก ${user?.department || 'ของคุณ'}`}
        actions={(
          <button type="button" onClick={openCreateModal} className="btn btn-primary gap-2">
            <BellPlus size={18} />
            สร้างประกาศ
          </button>
        )}
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: ENTITY_VIEW_STATUS.ACTIVE, label: `ประกาศที่ยังใช้งาน (${activeCount})` },
            { key: ENTITY_VIEW_STATUS.ARCHIVED, label: `หมดอายุแล้ว (${archivedCount})` },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setViewMode(item.key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                viewMode === item.key
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <CalendarClock size={16} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                className="w-full rounded-md border border-border bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
                placeholder="ค้นหาชื่อประกาศหรือแผนก..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={filteredAnnouncements}
        loading={loading}
        emptyMessage="ยังไม่มีประกาศในรายการนี้"
        renderRow={(announcement) => (
          <tr key={announcement.id} className="border-b border-slate-100 align-top">
            <td className="p-4">
              <div className="max-w-xl">
                <p className="font-bold text-slate-900">{announcement.title}</p>
                <p className="mt-1 text-sm text-slate-500">{announcement.description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
              </div>
            </td>
            <td className="p-4 text-sm font-medium text-slate-600">
              {announcement.department?.name || '-'}
            </td>
            <td className="p-4">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                {getTypeLabel(announcement.type)}
              </span>
            </td>
            <td className="p-4 text-sm font-medium text-slate-600">
              {announcement.expiredAt ? formatThaiDateTime(announcement.expiredAt, true) : '-'}
            </td>
            <td className="p-4">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => handleViewHistory(announcement)} className="btn btn-outline btn-sm gap-1 bg-blue-50/50 text-blue-600 border-blue-200">
                  <History size={14} />
                  ประวัติ
                </button>
                <button type="button" onClick={() => openEditModal(announcement)} className="btn btn-outline btn-sm gap-1">
                  <Edit3 size={14} />
                  แก้ไข
                </button>
                {viewMode === ENTITY_VIEW_STATUS.ACTIVE && (
                  <button type="button" onClick={() => handleArchive(announcement)} className="btn btn-outline btn-sm gap-1 text-warning border-warning/30">
                    <Archive size={14} />
                    เก็บลงกรุ
                  </button>
                )}
                <button type="button" onClick={() => handleDelete(announcement)} className="btn btn-outline btn-sm gap-1 text-danger border-danger/30">
                  <Trash2 size={14} />
                  ลบ
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      <ModalPortal isOpen={showModal}>
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="card flex h-full w-full max-w-6xl flex-col overflow-hidden border border-gray-100 bg-white p-0 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
              <h4 className="text-lg font-bold">{editingAnnouncement ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}</h4>
              <button type="button" onClick={() => setShowModal(false)} className="text-muted hover:text-gray-900">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-bold text-gray-700">ชื่อประกาศ</label>
                    <input
                      required
                      type="text"
                      className="form-input w-full"
                      value={form.title}
                      onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                      placeholder="เช่น แจ้งปิดระบบชั่วคราวสำหรับแผนกขาย"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-bold text-gray-700">คำอธิบายสั้น</label>
                    <textarea
                      rows={3}
                      className="form-input w-full"
                      value={form.description}
                      onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder="สรุปสั้น ๆ เพื่อแสดงบนการ์ดประกาศ"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">แผนก</label>
                    <select
                      className="form-input w-full"
                      value={form.departmentId}
                      onChange={(event) => setForm((current) => ({ ...current, departmentId: event.target.value }))}
                      disabled={!isFullAdmin && departments.length <= 1}
                    >
                      <option value="">เลือกแผนก</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">ชนิดหน้า</label>
                    <select
                      className="form-input w-full"
                      value={form.type}
                      onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                    >
                      <option value="video">วิดีโอ</option>
                      <option value="pdf">เอกสาร</option>
                      <option value="article">บทความ</option>
                      <option value="quiz">แบบทดสอบ</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <CustomDateTimePicker
                      value={form.expiredAt}
                      onChange={(event) => setForm((current) => ({ ...current, expiredAt: event.target.value }))}
                      label="วันหมดอายุของประกาศ"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-bold text-gray-700">ภาพหน้าปก</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="form-input flex-1"
                        value={form.image}
                        onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
                        placeholder="URL ของภาพหน้าปก"
                      />
                      <label className="btn btn-outline btn-sm gap-1 cursor-pointer">
                        <Upload size={14} />
                        อัปโหลด
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>

                  {form.type !== 'quiz' && (
                    <div>
                      <label className="mb-1 block text-sm font-bold text-gray-700">ระยะเวลาโดยประมาณ (นาที)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-input w-full"
                        value={form.duration || 0}
                        onChange={(event) => setForm((current) => ({ ...current, duration: Number(event.target.value) || 0 }))}
                      />
                    </div>
                  )}

                  <div className={form.type === 'quiz' ? 'md:col-span-2' : ''}>
                    {renderSourceField()}
                  </div>

                  {form.type !== 'quiz' ? (
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-bold text-gray-700">เนื้อหาประกาศ</label>
                      <RichTextEditor
                        label="Announcement content editor"
                        value={form.content || ''}
                        onChange={(content) => setForm((current) => ({ ...current, content }))}
                        onImageUpload={handleEditorImageUpload}
                        imageUploading={editorImageUploading}
                        minHeight={260}
                      />
                    </div>
                  ) : (
                    <div className="relative mt-2 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-bold text-gray-700">เกณฑ์ผ่าน (%)</label>
                          <input
                            type="number"
                            className="form-input w-full"
                            value={form.passScore}
                            onChange={(event) => setForm((current) => ({ ...current, passScore: Number(event.target.value) || 0 }))}
                          />
                        </div>
                        <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-primary">
                          Quiz สำหรับประกาศจะใช้เพื่อแสดงผลและประเมินทันที โดยไม่ผูกแต้มคอร์ส
                        </div>
                      </div>

                      <QuizBuilder
                        questions={form.questions}
                        onChange={(questions) => setForm((current) => ({ ...current, questions }))}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 border-t border-gray-100 bg-gray-50 p-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline flex-1 py-3">
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary flex-1 py-3 font-bold" disabled={uploading}>
                  {editingAnnouncement ? 'บันทึกการแก้ไข' : 'สร้างประกาศ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </ModalPortal>

      <ConfirmDialog {...ConfirmDialogProps} />

      {/* History Modal */}
      <ModalPortal isOpen={showHistoryModal}>
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="card flex h-full max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden border border-gray-100 bg-white p-0 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
              <div>
                <h4 className="text-lg font-bold">ประวัติการเข้าอ่านประกาศ</h4>
                <p className="text-sm text-muted">{currentAnnouncementTitle}</p>
              </div>
              <button type="button" onClick={() => setShowHistoryModal(false)} className="text-muted hover:text-gray-900">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              {historyLoading ? (
                <div className="flex h-32 items-center justify-center text-muted">กำลังโหลดข้อมูล...</div>
              ) : historyData.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted">ยังไม่มีผู้เข้าอ่าน</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-gray-50 text-xs font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4">ผู้เข้าอ่าน</th>
                      <th className="px-6 py-4">แผนก</th>
                      <th className="px-6 py-4">วันที่เข้าอ่าน</th>
                      <th className="px-6 py-4">คะแนนสอบ</th>
                      <th className="px-6 py-4">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{item.user?.name}</span>
                            <span className="text-xs text-muted">{item.user?.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.user?.department || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatThaiDateTime(item.viewedAt, true)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.score !== null ? `${item.score}%` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {item.passed === true && (
                            <span className="inline-flex rounded-full bg-success/10 px-2 py-1 text-[10px] font-black uppercase text-success">
                              ผ่าน
                            </span>
                          )}
                          {item.passed === false && (
                            <span className="inline-flex rounded-full bg-danger/10 px-2 py-1 text-[10px] font-black uppercase text-danger">
                              ไม่ผ่าน
                            </span>
                          )}
                          {item.passed === null && (
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500">
                              อ่านแล้ว
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="border-t border-gray-100 bg-gray-50 p-4 text-right">
              <button type="button" onClick={() => setShowHistoryModal(false)} className="btn btn-outline px-8">
                ปิด
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
    </div>
  );
};

export default AnnouncementManagement;
