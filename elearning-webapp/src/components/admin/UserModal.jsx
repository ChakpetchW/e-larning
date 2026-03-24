import React from 'react';

const UserModal = ({ isOpen, onClose, onSave, editingUser, formData, setFormData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-hidden">
      <div className="card bg-white w-full max-w-md shadow-xl flex flex-col max-h-[95vh] rounded-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-2xl">
          <h3 className="text-xl font-bold">{editingUser ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <form id="user-form" onSubmit={onSave} className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">ชื่อ-นามสกุล</label>
              <input 
                required 
                type="text" 
                className="form-input w-full" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="เช่น นายสมบูรณ์ เรียนดี" 
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">อีเมล</label>
              <input 
                required 
                type="email" 
                className="form-input w-full" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                placeholder="user@company.com" 
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">
                รหัสผ่าน {editingUser && <span className="text-xs font-normal text-muted">(เว้นว่างถ้าไม่ต้องการเปลี่ยน)</span>}
              </label>
              <input 
                required={!editingUser} 
                type="password" 
                placeholder="••••••••" 
                className="form-input w-full font-mono" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">แผนก</label>
                  <input 
                    type="text" 
                    className="form-input w-full" 
                    value={formData.department} 
                    onChange={e => setFormData({...formData, department: e.target.value})} 
                    placeholder="เช่น IT" 
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">แต้มสะสม</label>
                  <input 
                    type="number" 
                    className="form-input w-full font-bold text-warning" 
                    value={formData.pointsBalance} 
                    onChange={e => setFormData({...formData, pointsBalance: parseInt(e.target.value) || 0})} 
                  />
                </div>
            </div>
          </form>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 rounded-b-2xl">
          <button type="button" onClick={onClose} className="btn btn-outline flex-1 py-3 font-medium">ยกเลิก</button>
          <button type="submit" form="user-form" className="btn btn-primary flex-1 py-3 font-bold shadow-lg shadow-primary/20">บันทึกข้อมูล</button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
