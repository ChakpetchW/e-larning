import React from 'react';
import { Download, Calendar, BarChart2 } from 'lucide-react';
import CustomSelect from '../../components/common/CustomSelect';

const Reports = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold mb-1">รายงานและการส่งออก</h2>
          <p className="text-muted text-sm">ดูสถิติเชิงลึกและดาวน์โหลดข้อมูลในรูปแบบ CSV</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learning Report */}
        <div className="card p-6 flex flex-col items-start bg-surface transition-all">
          <div className="p-3 bg-primary-light text-primary rounded-lg mb-4">
            <BarChart2 size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2">รายงานผลปฏิบัติการเรียน</h3>
          <p className="text-sm text-muted mb-6 flex-1">
            รายงานและสรุปผลข้อมูลการเรียนคอร์สต่างๆ ของพนักงาน รวมถึงอัตราการเรียนจบและเวลาเฉลี่ย
          </p>
          
          <div className="w-full flex flex-col gap-3">
            <CustomSelect
              size="sm"
              value="current"
              onChange={() => {}}
              options={[
                { value: 'current', label: 'เดือนปัจจุบัน (มีนาคม 2026)' },
                { value: 'prev', label: 'เดือนที่ผ่านมา (กุมภาพันธ์ 2026)' },
                { value: 'q1', label: 'ไตรมาสที่ 1 (2026)' },
                { value: 'year', label: 'ปีนี้ (2026)' }
              ]}
              className="w-full"
            />
            <button className="btn btn-primary w-full justify-center">
              <Download size={18} /> ดาวน์โหลด CSV (Learning)
            </button>
          </div>
        </div>

        {/* Redeem Report */}
        <div className="card p-6 flex flex-col items-start bg-surface transition-all">
          <div className="p-3 bg-orange-100/50 text-warning rounded-lg mb-4">
            <div className="font-bold text-xl leading-none">Pts</div>
          </div>
          <h3 className="text-lg font-bold mb-2">รายงานการแจกและการแลกแต้ม</h3>
          <p className="text-sm text-muted mb-6 flex-1">
            รายงานสรุปการได้รับแต้มของพนักงาน และข้อมูลการแลกของรางวัล เพื่อการควบคุมงบประมาณ
          </p>
          
          <div className="w-full flex flex-col gap-3">
            <CustomSelect
              size="sm"
              value="week"
              onChange={() => {}}
              options={[
                { value: 'week', label: 'สัปดาห์นี้' },
                { value: 'month', label: 'เดือนนี้' },
                { value: 'prev', label: 'เดือนที่ผ่านมา' }
              ]}
              className="w-full"
            />
            <button className="btn btn-outline w-full justify-center border-warning text-warning hover:bg-orange-50">
              <Download size={18} /> ดาวน์โหลด CSV (Redeem)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
