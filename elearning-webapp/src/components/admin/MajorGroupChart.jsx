import React from 'react';
import { PieChart as PieIcon, ChevronRight } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const TYPE_COLORS = {
  'LEADERSHIP': '#6366f1',
  'FUNCTION': '#94a3b8',
  'INNOVATION': '#f59e0b'
};

const MajorGroupChart = ({ data, onSelectGroup }) => {
  return (
    <div className="card flex min-w-0 flex-col p-6 h-full card-no-lift">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PieIcon size={20} className="text-indigo-600" />
          <h3 className="text-lg font-bold">สถิติตามกลุ่มหลัก (Major Group)</h3>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md">คลิกดูรายละเอียด</span>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative h-[220px] w-full max-w-[220px] shrink-0 min-w-0">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={8}
                dataKey="value"
                onClick={(d) => onSelectGroup(d)}
                className="cursor-pointer outline-none"
              >
                {(data || []).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={TYPE_COLORS[entry.name.toUpperCase()] || COLORS[index % COLORS.length]} 
                    className="hover:opacity-80 transition-opacity outline-none"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                formatter={(value, name) => [`${value} คอร์ส`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Major Groups</p>
            <p className="text-2xl font-black text-slate-800 leading-none">{(data || []).length}</p>
          </div>
        </div>

        <div className="flex-1 w-full space-y-3">
          {(data || []).map((type, i) => (
            <button 
              key={type.name} 
              type="button"
              onClick={() => onSelectGroup(type)}
              className="flex items-center justify-between w-full p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: TYPE_COLORS[type.name.toUpperCase()] || COLORS[i % COLORS.length] }}></div>
                <div className="flex flex-col items-start translate-y-[-1px] text-left">
                  <span className="text-sm font-bold text-slate-900 leading-none">{type.name}</span>
                  <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">{type.enrollmentCount.toLocaleString()} Enrollments</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800">{type.value}</span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MajorGroupChart;
