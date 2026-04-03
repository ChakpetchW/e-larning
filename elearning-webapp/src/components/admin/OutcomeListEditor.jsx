import React from 'react';
import { Trash2 } from 'lucide-react';

const OutcomeListEditor = ({ value, onChange }) => {
  const tryParse = (rawValue) => {
    try {
      const parsed = JSON.parse(rawValue || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const items = tryParse(value);
  const update = (newItems) => onChange(JSON.stringify(newItems));

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="group flex gap-2">
          <input
            className="form-input flex-1 border-emerald-100 bg-white py-3 text-base focus:border-emerald-400"
            value={item}
            placeholder="เช่น หลักการออกแบบ UX/UI เบื้องต้น..."
            onChange={(event) => {
              const newItems = [...items];
              newItems[index] = event.target.value;
              update(newItems);
            }}
          />
          <button
            type="button"
            onClick={() => update(items.filter((_, itemIndex) => itemIndex !== index))}
            className="rounded p-2 text-red-300 transition-all hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => update([...items, ''])}
        className="block w-full rounded-xl border-2 border-dashed border-emerald-200 px-4 py-2.5 text-center text-sm font-black text-emerald-600 transition-all hover:bg-emerald-50"
      >
        + เพิ่มสิ่งที่จะได้เรียนรู้ใหม่
      </button>
    </div>
  );
};

export default OutcomeListEditor;
