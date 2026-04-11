import React from 'react';
import { useTranslation } from '../../context/LanguageContext';

const AdminPageHeader = ({ title, subtitle, actions }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">{title}</h2>
        {subtitle && <p className="text-muted text-sm">{subtitle}</p>}
      </div>
      <div className="flex gap-2">
        {actions}
      </div>
    </div>
  );
};

export default AdminPageHeader;
