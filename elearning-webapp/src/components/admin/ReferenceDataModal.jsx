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
}) => {
  const [draftName, setDraftName] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const submitLabel = useMemo(
    () => (editingItem ? `บันทึก${itemLabel}` : `เพิ่ม${itemLabel}`),
    [editingItem, itemLabel]
  );

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setDraftName('');
    setEditingItem(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = draftName.trim();
    if (!name) {
      return;
    }

    try {
      if (editingItem) {
        await onUpdate(editingItem.id, { name });
      } else {
        await onCreate({ name });
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
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="card flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden border border-slate-100 bg-white shadow-2xl">
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
          <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 md:flex-row">
            <input
              type="text"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder={`ตั้งชื่อ${itemLabel}`}
              className="form-input flex-1 bg-white"
              required
            />
            <div className="flex gap-2">
              {editingItem && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-outline"
                >
                  ยกเลิก
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                <Plus size={16} />
                {submitLabel}
              </button>
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
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
                >
                  <div>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-400">
                      สร้างเมื่อ {new Date(item.createdAt).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="rounded-xl p-2 text-primary transition-colors hover:bg-primary/10"
                      aria-label={`แก้ไข${itemLabel} ${item.name}`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id, item.name)}
                      className="rounded-xl p-2 text-rose-500 transition-colors hover:bg-rose-50"
                      aria-label={`ลบ${itemLabel} ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferenceDataModal;
