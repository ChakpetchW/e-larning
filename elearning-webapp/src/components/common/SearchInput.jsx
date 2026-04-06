import React from 'react';
import { Search, X } from 'lucide-react';

const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'ค้นหา...',
  ariaLabel = 'ค้นหา',
  className = '',
}) => {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
        <Search size={20} />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-2.5 sm:py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all text-[15px] font-medium placeholder-gray-400"
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="ล้างคำค้นหา"
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-500"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
