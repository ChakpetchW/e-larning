import React, { useMemo, useState } from 'react';
import { Edit2, Plus, Trash2, X } from 'lucide-react';

const ReferenceDataModal = ({
  isOpen,
  title,
  description,
  itemLabel,
  items,
  loading,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  showAccessToggle = false,
}) => {
  const [draftName, setDraftName] = useState('');
  const [accessAdmin, setAccessAdmin] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const submitLabel = useMemo(
    () => (editingItem ? `บันทึกการแก้ไข` : `เพิ่ม${itemLabel}ใหม่`),
    [editingItem, itemLabel]
  );

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setDraftName('');
    setAccessAdmin(false);
    setEditingItem(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = draftName.trim();
    if (!name) {
      return;
    }

    try {
      const payload = {
        name,
        ...(showAccessToggle ? { accessAdmin } : {}),
      };

      if (editingItem) {
        await onUpdate(editingItem.id, payload);
      } else {
        await onCreate(payload);
      }

      resetForm();
    } catch (error) {
      console.error(`Save ${itemLabel} error:`, error);
      alert(error.response?.data?.message || `ไม่สามารถบันทึก${itemLabel}ได้`);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setDraftName(item.name);
    if (showAccessToggle) {
      setAccessAdmin(item.accessAdmin || false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="card flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden border border-slate-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h3 className="text-xl font-black text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label={`ปิดหน้าต่าง${title}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <form 
            onSubmit={handleSubmit} 
            className={`mb-6 flex flex-col gap-4 rounded-3xl border-2 p-5 transition-all duration-300 ${
              editingItem 
                ? 'border-primary/30 bg-primary/5 shadow-inner' 
                : 'border-slate-100 bg-slate-50/70'
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <span className={`text-[10px] font-black uppercase tracking-widest ${editingItem ? 'text-primary' : 'text-slate-400'}`}>
                {editingItem ? `กำลังแก้ไข${itemLabel}` : `สร้าง${itemLabel}ใหม่`}
              </span>
              {editingItem && (
                <span className="text-[10px] font-bold text-slate-400 italic">
                  แก้ไขจาก: {editingItem.name}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder={editingItem ? `ชื่อ${itemLabel}ใหม่...` : `ตั้งชื่อ${itemLabel}...`}
                className={`form-input flex-1 bg-white px-5 py-3 text-sm font-bold transition-all focus:ring-4 ${
                  editingItem ? 'border-primary/50 focus:ring-primary/10' : 'border-slate-200'
                }`}
                required
              />
              {showAccessToggle && (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={accessAdmin}
                    onChange={(event) => setAccessAdmin(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">สิทธิ์ Manager Access</span>
                    <span className="text-[10px] text-slate-400">อนุญาตการใช้งานหน้าหลังบ้าน</span>
                  </div>
                </label>
              )}
              <div className="flex gap-2">
                {editingItem && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn border-2 border-slate-200 bg-white px-6 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50"
                  >
                    ยกเลิก
                  </button>
                )}
                <button 
                  type="submit" 
                  className={`btn ${editingItem ? 'bg-slate-900 text-white' : 'btn-primary'} flex-1 px-8 py-3 text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 md:flex-none`}
                >
                  {editingItem ? <Edit2 size={16} /> : <Plus size={16} />}
                  {submitLabel}
                </button>
              </div>
            </div>
          </form>

          <div className="space-y-3">
            {loading ? (
              <div className="py-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                ยังไม่มี{itemLabel}ในระบบ
              </div>
            ) : (
              items.map((item) => {
                const isEditing = editingItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 transition-all duration-300 ${
                      isEditing 
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary' 
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {isEditing && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20 animate-pulse">
                          <Edit2 size={14} />
                        </div>
                      )}
                      <div>
                        <div className={`font-black tracking-tight ${isEditing ? 'text-primary' : 'text-slate-900 font-bold'}`}>
                          <div className="flex items-center gap-2">
                            {item.name}
                            {showAccessToggle && item.accessAdmin && (
                              <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-black uppercase text-rose-500 ring-1 ring-inset ring-rose-200">
                                ADMIN
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          #{item.id.slice(-4)} • สร้างเมื่อ {item.createdAt ? new Date(item.createdAt).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-xl bg-slate-50 p-2.5 text-primary transition-all hover:bg-primary hover:text-white"
                          aria-label={`แก้ไข${itemLabel} ${item.name}`}
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(item.id, item.name)}
                        className="rounded-xl bg-slate-50 p-2.5 text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
                        aria-label={`ลบ${itemLabel} ${item.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferenceDataModal;
