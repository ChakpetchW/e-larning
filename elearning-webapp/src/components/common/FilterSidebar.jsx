import React, { useId, useRef } from 'react';
import { Filter, X } from 'lucide-react';
import useAccessibleOverlay from '../../hooks/useAccessibleOverlay';

const FilterSidebar = ({
  isOpen,
  onClose,
  sortBy,
  setSortBy,
  categories,
  activeCat,
  setActiveCat,
  onReset,
}) => {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const titleId = useId();

  useAccessibleOverlay({
    isOpen,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/30 backdrop-blur-sm animate-fade-in">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="ปิดตัวกรองคอร์ส"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex h-full w-full max-w-sm transform flex-col bg-white shadow-2xl animate-slide-in-right"
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-white p-6">
          <h3 id={titleId} className="flex items-center gap-2 text-xl font-black text-gray-900">
            <Filter size={20} className="text-primary" />
            ตัวกรองขั้นสูง
          </h3>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="ปิดตัวกรองคอร์ส"
            className="rounded-full bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6">
          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-sm font-bold uppercase tracking-widest text-gray-400">
              การจัดเรียง (Sort By)
            </h4>
            {[
              { label: 'เพิ่มล่าสุด (Newest)', value: 'newest' },
              { label: 'เก่าที่สุด (Oldest)', value: 'oldest' },
              { label: 'เรียงตามพยัญชนะ (A-Z)', value: 'a-z' },
              { label: 'คะแนนสูงสุด (Max Points)', value: 'points_desc' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 p-3 transition-colors hover:bg-gray-50"
              >
                <span className="font-bold text-gray-700">{option.label}</span>
                <input
                  type="radio"
                  name="sort"
                  checked={sortBy === option.value}
                  onChange={() => setSortBy(option.value)}
                  className="h-4 w-4 accent-primary"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-sm font-bold uppercase tracking-widest text-gray-400">
              หมวดหมู่ (Category)
            </h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCat(category.name)}
                  className={`rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                    activeCat === category.name
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-gray-100 bg-gray-50 p-6">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3.5 font-bold text-gray-600 transition-colors hover:bg-gray-100"
          >
            ล้างค่า
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-primary py-3.5 font-bold text-white shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] transition-all hover:bg-primary-hover hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)]"
          >
            ดูผลลัพธ์
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
