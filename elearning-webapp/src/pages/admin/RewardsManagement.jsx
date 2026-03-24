import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ImageIcon } from 'lucide-react';
import { adminAPI, getFullUrl } from '../../utils/api';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import RewardModal from '../../components/admin/RewardModal';

const RewardsManagement = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [rewardForm, setRewardForm] = useState({ name: '', pointsCost: 100, stock: 10, maxPerUser: 1, image: '' });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await adminAPI.getRewards();
      setRewards(response.data);
    } catch (error) {
      console.error('Fetch rewards error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const res = await adminAPI.uploadFile(file);
      setRewardForm({ ...rewardForm, image: res.data.fileUrl });
    } catch (err) {
      console.error(err);
      alert('อัปโหลดรูปภาพไม่สำเร็จ');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await adminAPI.updateReward(editingId, { ...rewardForm });
        alert('อัปเดตของรางวัลสำเร็จ!');
      } else {
        await adminAPI.createReward({ ...rewardForm, status: 'ACTIVE' });
        alert('เพิ่มของรางวัลสำเร็จ!');
      }
      closeModal();
      fetchRewards();
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setRewardForm({ name: '', pointsCost: 100, stock: 10, maxPerUser: 1, image: '' });
  };

  const openEdit = (reward) => {
    setIsEditing(true);
    setEditingId(reward.id);
    setRewardForm({ name: reward.name, pointsCost: reward.pointsCost, stock: reward.stock, maxPerUser: reward.maxPerUser || 1, image: reward.image || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(confirm('ยืนยันการลบของรางวัล?')) {
        try {
            await adminAPI.deleteReward(id);
            setRewards(rewards.filter(r => r.id !== id));
        } catch (error) {
            console.error(error);
            alert('ลบไม่สำเร็จ');
        }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader 
        title="จัดการของรางวัล"
        subtitle="จัดการรายการของรางวัลในระบบเพื่อจูงใจพนักงาน"
        actions={
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} /> เพิ่มของรางวัล
          </button>
        }
      />

      <RewardModal 
        isOpen={showModal}
        onClose={closeModal}
        onSave={handleSubmit}
        isEditing={isEditing}
        rewardForm={rewardForm}
        setRewardForm={setRewardForm}
        onImageUpload={handleImageUpload}
        uploadingImage={uploadingImage}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : rewards.length === 0 ? (
          <div className="col-span-full text-center p-12 text-muted border-2 border-dashed rounded-2xl border-border bg-gray-50/50">
            ยังไม่มีของรางวัลในระบบ
          </div>
        ) : rewards.map((reward) => (
          <div key={reward.id} className={`card p-5 group transition-all hover:border-primary/20 hover:shadow-lg ${reward.stock === 0 ? 'bg-gray-50' : 'bg-surface'}`}>
            <div className="flex justify-between items-start mb-4">
              <span className={`badge text-[10px] font-black uppercase tracking-wider ${reward.stock > 0 ? 'badge-success' : 'bg-gray-200 text-gray-700'}`}>
                {reward.stock > 0 ? 'Active' : 'หมดสต๊อก'}
              </span>
              <div className="flex gap-1 text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => openEdit(reward)} className="p-1.5 hover:bg-white rounded text-primary"><Edit size={16}/></button>
                 <button onClick={() => handleDelete(reward.id)} className="p-1.5 hover:bg-white rounded text-danger"><Trash2 size={16}/></button>
              </div>
            </div>
            
            <div className="flex gap-4 items-center mb-3">
              {reward.image ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                  <img src={getFullUrl(reward.image)} alt="Reward" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <ImageIcon size={24} className="text-indigo-400" />
                </div>
              )}
              <h3 className="font-bold text-base leading-tight">{reward.name}</h3>
            </div>
            
            <div className="flex justify-between items-end mt-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-[10px] font-black text-muted mb-0.5 uppercase tracking-wide">แต้มที่ใช้</p>
                <p className="font-black text-lg text-warning leading-none">{reward.pointsCost} <span className="text-[10px]">PTS</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted mb-0.5 uppercase tracking-wide">คงเหลือ</p>
                <p className={`font-black text-lg leading-none ${reward.stock === 0 ? 'text-danger' : 'text-primary'}`}>
                  {reward.stock}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardsManagement;
