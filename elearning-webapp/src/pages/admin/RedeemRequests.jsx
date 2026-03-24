import React, { useState, useEffect } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTable from '../../components/admin/AdminTable';

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

  const columns = [
    { label: "รหัสอ้างอิง" },
    { label: "ผู้แลกรางวัล" },
    { label: "ของรางวัล" },
    { label: "แต้มที่ใช้", className: "text-right" },
    { label: "วันเวลาที่ขอ" },
    { label: "สถานะ" },
    { label: "จัดการ", className: "text-center" }
  ];

  const filteredRequests = requests.filter(r => filter === 'ALL' || r.status === 'PENDING');

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader 
        title="รายการแลกของรางวัล"
        subtitle="ตรวจสอบและอนุมัติคำขอแลกพอยท์เป็นของรางวัลจากพนักงาน"
      />

      <div className="flex gap-2">
        <button 
           onClick={() => setFilter('PENDING')}
           className={`badge text-xs font-black uppercase tracking-wider px-4 py-2 transition-all ${filter === 'PENDING' ? 'badge-primary scale-105' : 'bg-white text-muted border border-border hover:bg-gray-50'}`}
        >
            รออนุมัติ ({requests.filter(r => r.status === 'PENDING').length})
        </button>
        <button 
           onClick={() => setFilter('ALL')}
           className={`badge text-xs font-black uppercase tracking-wider px-4 py-2 transition-all ${filter === 'ALL' ? 'badge-primary scale-105' : 'bg-white text-muted border border-border hover:bg-gray-50'}`}
        >
            ประวัติทั้งหมด
        </button>
      </div>

      <AdminTable 
        columns={columns}
        data={filteredRequests}
        loading={loading}
        renderRow={(req) => (
          <tr key={req.id} className="border-b border-border hover:bg-gray-50/50 transition-colors">
            <td className="p-4 text-sm font-black text-slate-400">REQ-{req.id.replace(/\D/g, '').substring(0, 5) || req.id}</td>
            <td className="p-4">
               <div className="text-sm font-bold text-slate-800">{req.user?.name || req.userId}</div>
               <div className="text-[10px] text-muted">{req.user?.department || '-'}</div>
            </td>
            <td className="p-4 text-sm font-bold text-primary">{req.reward?.name}</td>
            <td className="p-4 text-sm text-right font-black text-warning">{req.reward?.pointsCost}</td>
            <td className="p-4 text-sm text-muted">{new Date(req.requestedAt || req.createdAt).toLocaleString('th-TH')}</td>
            <td className="p-4">
              {req.status === 'PENDING' && <span className="badge badge-warning text-[10px] font-bold"><Clock size={12} className="mr-1"/> รอดำเนินการ</span>}
              {req.status === 'APPROVED' && <span className="badge badge-success text-[10px] font-bold">อนุมัติแล้ว</span>}
              {req.status === 'REJECTED' && <span className="badge badge-danger text-[10px] font-bold">ปฏิเสธ</span>}
            </td>
            <td className="p-4 text-center">
              {req.status === 'PENDING' ? (
                <div className="flex justify-center gap-2">
                  <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="p-2 bg-green-50 text-success hover:bg-green-500 hover:text-white rounded-lg transition-all" title="อนุมัติ"><Check size={18} /></button>
                  <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="p-2 bg-red-50 text-danger hover:bg-red-500 hover:text-white rounded-lg transition-all" title="ปฏิเสธ"><X size={18} /></button>
                </div>
              ) : (
                <span className="text-slate-300 text-xs font-black">PROCESSED</span>
              )}
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default RedeemRequests;
