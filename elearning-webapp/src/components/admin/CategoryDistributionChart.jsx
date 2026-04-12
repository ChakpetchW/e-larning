import React from 'react';
import { PieChart as PieIcon } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const CategoryDistributionChart = ({ data, totalCourses }) => {
  return (
    <div className="card flex min-w-0 flex-col p-6 card-no-lift">
      <div className="flex items-center gap-2 mb-6">
        <PieIcon size={20} className="text-warning" />
        <h3 className="text-lg font-bold">สัดส่วนตามหมวดหมู่ (Categories)</h3>
      </div>
      
      <div className="relative h-[250px] w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height={250} minWidth={0} minHeight={250}>
          <PieChart>
            <Pie
              data={data || []}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {(data || []).map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-[10px] font-black text-muted uppercase">ทั้งหมด</p>
          <p className="text-xl font-black">{totalCourses || 0}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {(data || []).slice(0, 4).map((cat, i) => (
          <div key={cat.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
              <span className="text-slate-600 truncate max-w-[120px]">{cat.name}</span>
            </div>
            <span className="text-xs font-bold text-slate-800">{cat.value} คอร์ส</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDistributionChart;
