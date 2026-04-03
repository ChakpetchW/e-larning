import React from 'react';
import {
  Trash2,
  MonitorPlay,
  FileText,
  Infinity as InfIcon,
  Award,
  PlayCircle,
  BookOpen,
} from 'lucide-react';

const BenefitListEditor = ({ value, onChange }) => {
  const tryParse = (rawValue) => {
    try {
      const parsed = JSON.parse(rawValue || '[]');

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map((item) =>
        typeof item === 'string' || item === null
          ? { icon: 'MonitorPlay', text: item || '' }
          : item
      );
    } catch {
      return [];
    }
  };

  const items = tryParse(value);
  const update = (newItems) => onChange(JSON.stringify(newItems));
  const iconMap = { MonitorPlay, FileText, InfIcon, Award, PlayCircle, BookOpen };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const Icon = iconMap[item.icon || 'MonitorPlay'] || MonitorPlay;

        return (
          <div
            key={index}
            className="space-y-3 rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Icon size={22} />
              </div>
              <select
                className="cursor-pointer rounded-lg border-none bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-tight text-slate-600 focus:ring-0"
                value={item.icon || 'MonitorPlay'}
                onChange={(event) => {
                  const newItems = [...items];
                  newItems[index] = { ...item, icon: event.target.value };
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
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => update(items.filter((_, itemIndex) => itemIndex !== index))}
                className="rounded-lg p-2 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <input
              className="form-input w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-base font-medium transition-all focus:bg-white focus:ring-1 focus:ring-primary/20"
              placeholder="เช่น รับวิดีโอคุณภาพระดับ Full HD..."
              value={item.text}
              onChange={(event) => {
                const newItems = [...items];
                newItems[index] = { ...item, text: event.target.value };
                update(newItems);
              }}
            />
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => update([...items, { icon: 'MonitorPlay', text: '' }])}
        className="block w-full rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm font-black text-primary transition-all hover:bg-primary hover:text-white"
      >
        + เพิ่มสิทธิประโยชน์ที่จะได้รับ
      </button>
    </div>
  );
};

export default BenefitListEditor;
