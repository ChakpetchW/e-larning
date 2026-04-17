import React from 'react';
import { LayoutGrid, Archive, Search } from 'lucide-react';
import { FILTER_VALUES } from '../../utils/constants/filters';
import { ENTITY_VIEW_STATUS } from '../../utils/constants/statuses';
import ViewToggleTabs from '../common/ViewToggleTabs';

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
      <ViewToggleTabs
        viewMode={courseView}
        setViewMode={setCourseView}
        tabs={[
          { key: ENTITY_VIEW_STATUS.ACTIVE, label: `คอร์สที่เผยแพร่อยู่ (${activeCount})`, icon: LayoutGrid },
          { key: ENTITY_VIEW_STATUS.ARCHIVED, label: `Archive (${archivedCount})`, icon: Archive },
        ]}
      />

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="ค้นหาคอร์ส..."
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
            <option value={FILTER_VALUES.ALL}>ทุกหมวดหมู่</option>
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
