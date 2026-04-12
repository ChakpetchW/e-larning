import React from 'react';
import { Gift, CheckCircle } from 'lucide-react';
import { formatThaiDateTime } from '../../utils/dateUtils';

const PointsHistoryList = ({ history }) => {
  return (
    <section>
      <h3 className="text-lg font-bold mb-3 tracking-tight text-gray-900 px-1">ประวัติล่าสุด</h3>
      <div className="flex flex-col gap-3">
        {history.length > 0 ? history.map(entry => (
          <div key={entry.id} className="card flex items-center justify-between border border-slate-100 bg-white p-4 transition-colors hover:border-slate-200">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl border ${entry.points > 0 ? 'bg-green-50 text-success border-green-100' : 'bg-orange-50 text-warning border-orange-100'}`}>
                {entry.points > 0 ? <CheckCircle size={20} strokeWidth={2}/> : <Gift size={20} strokeWidth={2}/>}
              </div>
              <div className="text-left">
                <h4 className="mb-1 max-w-[160px] truncate text-[15px] font-bold leading-tight text-slate-900">{entry.note}</h4>
                <p className="text-xs font-medium text-slate-500">{formatThaiDateTime(entry.createdAt)}</p>
              </div>
            </div>
            <div className="text-right flex flex-col justify-center">
              <p className={`text-base font-black ${entry.points > 0 ? 'text-success' : 'text-danger'}`}>
                {entry.points > 0 ? `+${entry.points}` : entry.points}
              </p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{entry.sourceType}</p>
            </div>
          </div>
        )) : (
          <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-slate-500">
            <p className="font-medium">ยังไม่มีประวัติการรับแต้ม</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PointsHistoryList;
