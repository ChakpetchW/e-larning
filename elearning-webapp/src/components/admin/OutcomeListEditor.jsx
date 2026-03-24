import React from 'react';
import { Trash2 } from 'lucide-react';

const OutcomeListEditor = ({ value, onChange }) => {
  const tryParse = (val) => {
    try {
      const parsed = JSON.parse(val || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  };
  
  const items = tryParse(value);

  const update = (newItems) => onChange(JSON.stringify(newItems));

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 group">
          <input 
            className="form-input flex-1 bg-white text-base py-3 border-emerald-100 focus:border-emerald-400" 
            value={item} 
            placeholder="เช่น หลักการออกแบบ UX/UI เบื้องต้น..."
            onChange={(e) => {
              const newItems = [...items];
              newItems[idx] = e.target.value;
              update(newItems);
            }}
          />
          <button type="button" onClick={() => update(items.filter((_, i) => i !== idx))} 
            className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded transition-all">
            <Trash2 size={20}/>
          </button>
        </div>
      ))}
      <button type="button" onClick={() => update([...items, ""])} 
        className="text-sm font-black text-emerald-600 hover:bg-emerald-50 px-4 py-2.5 rounded-xl border-2 border-dashed border-emerald-200 block w-full text-center transition-all">
        + เพิ่มสิ่งที่จะได้เรียนรู้ใหม่
      </button>
    </div>
  );
};

export default OutcomeListEditor;
