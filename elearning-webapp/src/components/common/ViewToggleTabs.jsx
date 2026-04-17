import React from 'react';

/**
 * A reusable tab toggle component for Admin Management pages
 * 
 * @param {string} viewMode - The currently selected tab key
 * @param {Function} setViewMode - Function to update the view mode
 * @param {Array} tabs - Array of tab objects: { key: string, label: string, icon: LucideIcon }
 */
const ViewToggleTabs = ({ viewMode, setViewMode, tabs = [] }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => setViewMode(key)}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
            viewMode === key
              ? 'bg-slate-900 text-white shadow-lg'
              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          {Icon && <Icon size={16} />}
          {label}
        </button>
      ))}
    </div>
  );
};

export default ViewToggleTabs;
