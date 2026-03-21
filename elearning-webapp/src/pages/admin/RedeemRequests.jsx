import React, { useState, useEffect } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { adminAPI } from '../../utils/api';

const RedeemRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('PENDING'); // PENDING or ALL
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await adminAPI.getRedeems();
      setRequests(response.data);
    } catch (error) {
      console.error('Fetch redeems error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (confirm(`ยืนยันการ${status === 'APPROVED' ? 'อนุมัติ' : 'ปฏิเสธ'}คำขอนี้?`)) {
        try {
            await adminAPI.updateRedeemStatus(id, status);
            alert('อัปเดตสถานะสำเร็จ');
            fetchRequests();
        } catch (error) {
            console.error('Update redeem error:', error);
            alert('อัปเดตสถานะล้มเหลว');
        }
    }
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">รายการ Redeem ของรางวัล</h2>
        <p className="text-muted text-sm">ตรวจสอบและอนุมัติคำขอแลกของรางวัลจากผู้ใช้งาน</p>
      </div>

      <div className="flex gap-2">
        <button 
           onClick={() => setFilter('PENDING')}
           className={`badge text-sm px-4 py-1.5 ${filter === 'PENDING' ? 'badge-primary' : 'bg-white text-muted border border-border hover:bg-gray-50'}`}
        >
            รออนุมัติ ({requests.filter(r => r.status === 'PENDING').length})
        </button>
        <button 
           onClick={() => setFilter('ALL')}
           className={`badge text-sm px-4 py-1.5 ${filter === 'ALL' ? 'badge-primary' : 'bg-white text-muted border border-border hover:bg-gray-50'}`}
        >
            ประวัติทั้งหมด
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-sm text-muted">
                <th className="p-4 font-medium">รหัสอ้างอิง</th>
                <th className="p-4 font-medium">ผู้แลกรางวัล</th>
                <th className="p-4 font-medium">ของรางวัล</th>
                <th className="p-4 font-medium text-right">แต้มที่ใช้</th>
                <th className="p-4 font-medium">วันเวลาที่ขอ</th>
                <th className="p-4 font-medium">สถานะ</th>
                <th className="p-4 font-medium text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan="7" className="p-8 text-center">
                     <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                   </td>
                </tr>
              ) : requests.filter(r => filter === 'ALL' || r.status === 'PENDING').length === 0 ? (
                <tr>
                   <td colSpan="7" className="p-8 text-center text-muted">ไม่มีรายการ</td>
                </tr>
              ) : requests.filter(r => filter === 'ALL' || r.status === 'PENDING').map((req) => (
                <tr key={req.id} className="border-b border-border hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-medium">REQ-{req.id.replace(/\D/g, '').substring(0, 5) || req.id}</td>
                  <td className="p-4 text-sm">{req.user?.name || req.userId}</td>
                  <td className="p-4 text-sm font-medium">{req.reward?.name}</td>
                  <td className="p-4 text-sm text-right font-bold text-warning">{req.reward?.pointsCost}</td>
                  <td className="p-4 text-sm text-muted">{new Date(req.requestedAt || req.createdAt).toLocaleString('th-TH')}</td>
                  <td className="p-4">
                    {req.status === 'PENDING' && <span className="badge badge-warning text-[10px]"><Clock size={12} className="mr-1"/> รอดำเนินการ</span>}
                    {req.status === 'APPROVED' && <span className="badge badge-primary text-[10px]">อนุมัติแล้ว</span>}
                    {req.status === 'REJECTED' && <span className="badge badge-danger text-[10px]">ปฏิเสธ</span>}
                  </td>
                  <td className="p-4 text-center">
                    {req.status === 'PENDING' ? (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="p-1.5 bg-green-50 text-success hover:bg-green-100 rounded" title="อนุมัติ"><Check size={16} /></button>
                        <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="p-1.5 bg-red-50 text-danger hover:bg-red-100 rounded" title="ปฏิเสธ"><X size={16} /></button>
                      </div>
                    ) : (
                      <span className="text-muted text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RedeemRequests;
