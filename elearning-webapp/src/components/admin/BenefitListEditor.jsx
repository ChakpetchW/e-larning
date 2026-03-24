import React from 'react';
import { Trash2, MonitorPlay, FileText, Infinity as InfIcon, Award, PlayCircle, BookOpen } from 'lucide-react';

const BenefitListEditor = ({ value, onChange }) => {
  const tryParse = (val) => {
    try {
      const parsed = JSON.parse(val || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => (typeof item === 'string' || item === null) ? { icon: 'MonitorPlay', text: item || '' } : item);
    } catch (e) { return []; }
  };
  
  const items = tryParse(value);
  const update = (newItems) => onChange(JSON.stringify(newItems));

  const IconCompMap = { MonitorPlay, FileText, InfIcon, Award, PlayCircle, BookOpen };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const IconComp = IconCompMap[item.icon || 'MonitorPlay'] || MonitorPlay;
        return (
          <div key={idx} className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <IconComp size={22} />
              </div>
              <select 
                className="bg-slate-100 border-none text-xs font-black rounded-lg py-1.5 px-3 cursor-pointer text-slate-600 uppercase tracking-tight focus:ring-0"
                value={item.icon || 'MonitorPlay'}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx] = { ...item, icon: e.target.value };
                  update(newItems);
                }}
              >
                <option value="MonitorPlay">วิดีโอ (Video)</option>
                <option value="FileText">เอกสาร (File)</option>
                <option value="InfIcon">ตลอดชีพ (Lifetime)</option>
                <option value="Award">วุฒิบัตร (Award)</option>
                <option value="PlayCircle">การเล่น (Play)</option>
                <option value="BookOpen">บทเรียน (Lesson)</option>
              </select>
              <div className="flex-1"></div>
              <button type="button" onClick={() => update(items.filter((_, i) => i !== idx))}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                <Trash2 size={20}/>
              </button>
            </div>
            <input 
              className="form-input w-full border-none bg-slate-50 text-base py-3 px-4 rounded-xl focus:bg-white focus:ring-1 focus:ring-primary/20 transition-all font-medium" 
              placeholder="เช่น รับวิดีโอคุณภาพระดับ Full HD..."
              value={item.text} 
              onChange={(e) => {
                const newItems = [...items];
                newItems[idx] = { ...item, text: e.target.value };
                update(newItems);
              }}
            />
          </div>
        );
      })}
      <button type="button" onClick={() => update([...items, { icon: 'MonitorPlay', text: '' }])}
        className="text-sm font-black text-primary hover:bg-primary px-4 py-3 rounded-2xl border-2 border-dashed border-primary/20 hover:text-white block w-full text-center transition-all bg-primary/5">
        + เพิ่มสิทธิประโยชน์ที่จะได้รับ
      </button>
    </div>
  );
};

export default BenefitListEditor;
