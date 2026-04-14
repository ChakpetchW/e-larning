import React, { useState, useEffect } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTable from '../../components/admin/AdminTable';
import { useToast } from '../../context/ToastContext';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { FILTER_VALUES } from '../../utils/constants/filters';
import { REDEEM_STATUS } from '../../utils/constants/statuses';

const RedeemRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState(REDEEM_STATUS.PENDING);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { confirm, ConfirmDialogProps } = useConfirm();

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
    const actionLabel = status === REDEEM_STATUS.APPROVED ? 'เธญเธเธธเธกเธฑเธ•เธด' : 'เธเธเธดเน€เธชเธ';
    const ok = await confirm({
      title: `เธขเธทเธเธขเธฑเธเธเธฒเธฃ${actionLabel}`,
      message: `เธขเธทเธเธขเธฑเธเธเธฒเธฃ${actionLabel}เธเธณเธเธญเธเธตเน?`,
      confirmLabel: actionLabel,
      variant: status === REDEEM_STATUS.APPROVED ? 'primary' : 'danger',
    });
    if (!ok) return;

    try {
      await adminAPI.updateRedeemStatus(id, status);
      toast.success('เธญเธฑเธเน€เธ”เธ•เธชเธ–เธฒเธเธฐเธชเธณเน€เธฃเนเธ');
      fetchRequests();
    } catch (error) {
      console.error('Update redeem error:', error);
      toast.error('เธญเธฑเธเน€เธ”เธ•เธชเธ–เธฒเธเธฐเธฅเนเธกเน€เธซเธฅเธง');
    }
  };

  const columns = [
    { label: 'เธฃเธซเธฑเธชเธญเนเธฒเธเธญเธดเธ' },
    { label: 'เธเธนเนเนเธฅเธเธฃเธฒเธเธงเธฑเธฅ' },
    { label: 'เธเธญเธเธฃเธฒเธเธงเธฑเธฅ' },
    { label: 'เนเธ•เนเธกเธ—เธตเนเนเธเน', className: 'text-right' },
    { label: 'เธงเธฑเธเน€เธงเธฅเธฒเธ—เธตเนเธเธญ' },
    { label: 'เธชเธ–เธฒเธเธฐ' },
    { label: 'เธเธฑเธ”เธเธฒเธฃ', className: 'text-center' }
  ];

  const filteredRequests = requests.filter((request) => (
    filter === FILTER_VALUES.ALL || request.status === REDEEM_STATUS.PENDING
  ));

  const pendingCount = requests.filter((request) => request.status === REDEEM_STATUS.PENDING).length;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="เธฃเธฒเธขเธเธฒเธฃเนเธฅเธเธเธญเธเธฃเธฒเธเธงเธฑเธฅ"
        subtitle="เธ•เธฃเธงเธเธชเธญเธเนเธฅเธฐเธญเธเธธเธกเธฑเธ•เธดเธเธณเธเธญเนเธฅเธเธเธญเธขเธ—เนเน€เธเนเธเธเธญเธเธฃเธฒเธเธงเธฑเธฅเธเธฒเธเธเธเธฑเธเธเธฒเธ"
      />

      <div className="flex gap-2">
        <button
          onClick={() => setFilter(REDEEM_STATUS.PENDING)}
          className={`badge text-xs font-black uppercase tracking-wider px-4 py-2 transition-all ${filter === REDEEM_STATUS.PENDING ? 'badge-primary scale-105' : 'bg-white text-muted border border-border hover:bg-gray-50'}`}
        >
          เธฃเธญเธญเธเธธเธกเธฑเธ•เธด ({pendingCount})
        </button>
        <button
          onClick={() => setFilter(FILTER_VALUES.ALL)}
          className={`badge text-xs font-black uppercase tracking-wider px-4 py-2 transition-all ${filter === FILTER_VALUES.ALL ? 'badge-primary scale-105' : 'bg-white text-muted border border-border hover:bg-gray-50'}`}
        >
          เธเธฃเธฐเธงเธฑเธ•เธดเธ—เธฑเนเธเธซเธกเธ”
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
              {req.status === REDEEM_STATUS.PENDING && <span className="badge badge-warning text-[10px] font-bold"><Clock size={12} className="mr-1" /> เธฃเธญเธ”เธณเน€เธเธดเธเธเธฒเธฃ</span>}
              {req.status === REDEEM_STATUS.APPROVED && <span className="badge badge-success text-[10px] font-bold">เธญเธเธธเธกเธฑเธ•เธดเนเธฅเนเธง</span>}
              {req.status === REDEEM_STATUS.REJECTED && <span className="badge badge-danger text-[10px] font-bold">เธเธเธดเน€เธชเธ</span>}
            </td>
            <td className="p-4 text-center">
              {req.status === REDEEM_STATUS.PENDING ? (
                <div className="flex justify-center gap-2">
                  <button onClick={() => handleUpdateStatus(req.id, REDEEM_STATUS.APPROVED)} className="p-2 bg-success-bg text-success hover:bg-success hover:text-white rounded-lg transition-all" title="เธญเธเธธเธกเธฑเธ•เธด"><Check size={18} /></button>
                  <button onClick={() => handleUpdateStatus(req.id, REDEEM_STATUS.REJECTED)} className="p-2 bg-danger-bg text-danger hover:bg-danger hover:text-white rounded-lg transition-all" title="เธเธเธดเน€เธชเธ"><X size={18} /></button>
                </div>
              ) : (
                <span className="text-slate-300 text-xs font-black">PROCESSED</span>
              )}
            </td>
          </tr>
        )}
      />
      <ConfirmDialog {...ConfirmDialogProps} />
    </div>
  );
};

export default RedeemRequests;
