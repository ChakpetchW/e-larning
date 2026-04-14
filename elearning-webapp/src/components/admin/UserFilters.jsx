import React from 'react';
import { Search } from 'lucide-react';
import { FILTER_VALUES } from '../../utils/constants/filters';

const UserFilters = ({
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  departments,
  selectedTier,
  onTierChange,
  tiers,
}) => {
  return (
    <div className="flex flex-wrap gap-4 border-b border-border p-4">
      <div className="relative w-full lg:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          type="text"
          placeholder="เธเนเธเธซเธฒเธเธทเนเธญ เธซเธฃเธทเธญเธญเธตเน€เธกเธฅ..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-md border border-border bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      <select
        className="rounded-md border border-border bg-white px-3 py-2 text-sm text-muted outline-none"
        value={selectedDepartment}
        onChange={(event) => onDepartmentChange(event.target.value)}
      >
        <option value={FILTER_VALUES.ALL}>เธ—เธธเธเนเธเธเธ</option>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border border-border bg-white px-3 py-2 text-sm text-muted outline-none"
        value={selectedTier}
        onChange={(event) => onTierChange(event.target.value)}
      >
        <option value={FILTER_VALUES.ALL}>เธ”—เธธเธเธฃเธฐเธ”เธฑเธ</option>
        {tiers.map((tier) => (
          <option key={tier.id} value={tier.id}>
            {tier.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserFilters;
