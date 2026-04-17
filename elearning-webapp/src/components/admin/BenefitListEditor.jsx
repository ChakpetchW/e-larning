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
import CustomSelect from '../common/CustomSelect';

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
              <CustomSelect
                fullWidth={false}
                size="sm"
                className="w-40"
                value={item.icon || 'MonitorPlay'}
                onChange={(event) => {
                  const newItems = [...items];
                  newItems[index] = { ...item, icon: event.target.value };
                  update(newItems);
                }}
                options={[
                  { value: 'MonitorPlay', label: 'วิดีโอ (Video)', icon: MonitorPlay },
                  { value: 'FileText', label: 'เอกสาร (File)', icon: FileText },
                  { value: 'InfIcon', label: 'ตลอดชีพ (Lifetime)', icon: InfIcon },
                  { value: 'Award', label: 'วุฒิบัตร (Award)', icon: Award },
                  { value: 'PlayCircle', label: 'การเล่น (Play)', icon: PlayCircle },
                  { value: 'BookOpen', label: 'บทเรียน (Lesson)', icon: BookOpen }
                ]}
              />
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
