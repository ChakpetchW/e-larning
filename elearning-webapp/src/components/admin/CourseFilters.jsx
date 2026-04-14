import React from 'react';
import { LayoutGrid, Archive, Search } from 'lucide-react';
import { FILTER_VALUES } from '../../utils/constants/filters';
import { ENTITY_VIEW_STATUS } from '../../utils/constants/statuses';

const CourseFilters = ({
  courseView,
  setCourseView,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  activeCount,
  archivedCount
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: ENTITY_VIEW_STATUS.ACTIVE, label: `เธเธญเธฃเนเธชเธ—เธตเนเน€เธเธขเนเธเธฃเนเธญเธขเธนเน (${activeCount})`, icon: LayoutGrid },
          { key: ENTITY_VIEW_STATUS.ARCHIVED, label: `Archive (${archivedCount})`, icon: Archive },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setCourseView(key)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
              courseView === key
                ? 'bg-slate-900 text-white shadow-lg'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="เธเนเธเธซเธฒเธเธญเธฃเนเธช..."
              className="w-full rounded-md border border-border bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            className="cursor-pointer rounded-md border border-border bg-white px-3 py-2 text-sm text-muted focus:outline-none"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value={FILTER_VALUES.ALL}>เธ—เธธเธเธซเธกเธงเธ”เธซเธกเธนเน</option>
            {categories.filter((category) => !category.isArchived).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;
