import React, { useId, useMemo, useRef, useState } from 'react';
import {
  X,
  Search,
  Grid,
  Zap,
  Code,
  BarChart,
  PenTool,
  Layout,
  Database,
  Globe,
  Cpu,
  Hash,
  ArrowRight,
} from 'lucide-react';
import useAccessibleOverlay from '../../hooks/useAccessibleOverlay';

const CategorySearchModal = ({ isOpen, onClose, categories, courses, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const dialogRef = useRef(null);
  const searchInputRef = useRef(null);
  const titleId = useId();
  const searchInputId = useId();

  const categoryIconMap = {
    AI: Zap,
    'Artificial Intelligence': Zap,
    Technology: Cpu,
    IT: Cpu,
    Business: BarChart,
    Management: BarChart,
    Design: PenTool,
    Creative: PenTool,
    Programming: Code,
    Code,
    Development: Code,
    Marketing: Globe,
    Data: Database,
    Web: Layout,
  };

  const getCategoryIcon = (name) => {
    const key = Object.keys(categoryIconMap).find((label) =>
      name.toLowerCase().includes(label.toLowerCase())
    );

    return categoryIconMap[key] || Hash;
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const getCourseCount = (categoryId) => {
    return courses.filter((course) => course.categoryId === categoryId).length;
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  useAccessibleOverlay({
    isOpen,
    onClose: handleClose,
    containerRef: dialogRef,
    initialFocusRef: searchInputRef,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 animate-fade-in sm:p-4 md:items-center md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={handleClose}
        aria-label="ปิดหน้าต่างเลือกหมวดหมู่"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2.5rem] rounded-b-none bg-white shadow-2xl ring-1 ring-black/5 animate-slide-up md:h-[80vh] md:rounded-[2.5rem]"
      >
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 p-6 pt-4 shrink-0 md:p-8 md:pt-8">
          <div>
            <h2 id={titleId} className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900 md:text-3xl">
              <Grid className="text-primary" size={24} />
              เลือกหมวดหมู่ที่สนใจ
            </h2>
            <p className="mt-1 text-[11px] font-medium text-slate-400 md:text-sm">
              ค้นหาจาก {categories.length} หมวดหมู่ทั้งหมดในระบบ
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="ปิดหน้าต่างเลือกหมวดหมู่"
            className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 md:p-3"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 shrink-0 md:px-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400 pointer-events-none transition-colors group-focus-within:text-primary">
              <Search size={22} />
            </div>
            <label htmlFor={searchInputId} className="sr-only">
              ค้นหาหมวดหมู่
            </label>
            <input
              id={searchInputId}
              ref={searchInputRef}
              type="text"
              placeholder="พิมพ์ชื่อหมวดหมู่ที่ต้องการค้นหา..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-4.5 pl-14 pr-6 text-lg font-medium shadow-sm transition-all placeholder-slate-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar md:p-8">
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {filteredCategories.map((category) => {
                const Icon = getCategoryIcon(category.name);
                const count = getCourseCount(category.id);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      onSelect(category.name);
                      handleClose();
                    }}
                    className="group relative flex items-center gap-4 overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white p-5 text-left transition-all hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon size={28} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="break-words text-[1.05rem] font-black leading-tight text-slate-900 transition-colors group-hover:text-primary">
                        {category.name}
                      </h4>
                      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {count} Courses
                      </p>
                    </div>
                    <div className="flex h-8 w-8 -translate-x-2 items-center justify-center rounded-full bg-slate-50 text-slate-300 opacity-0 transition-all group-hover:translate-x-0 group-hover:bg-primary group-hover:text-white group-hover:opacity-100">
                      <ArrowRight size={16} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-300">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-400">ไม่พบหมวดหมู่ที่ค้นหา</h3>
              <p className="mt-2 max-w-xs font-medium">
                ลองเปลี่ยนคำค้นหาหรือตัวเลือกระบบจะพยายามช่วยคุณหาครับ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySearchModal;
