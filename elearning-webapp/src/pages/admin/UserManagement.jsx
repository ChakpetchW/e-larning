import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { adminAPI } from '../../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '', pointsBalance: 0 });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, formData);
        alert('แก้ไขข้อมูลเรียบร้อย');
      } else {
        await adminAPI.createUser(formData);
        alert('เพิ่มผู้ใช้งานเรียบร้อย');
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', department: '', pointsBalance: 0 });
      fetchUsers();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'เกิดข้อผิดพลาด';
      alert(msg);
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      department: user.department || '',
      pointsBalance: user.pointsBalance || 0,
      password: '' // Keep password empty unless changing
    });
    setShowModal(true);
  };
   
  const openAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', department: '', pointsBalance: 0 });
    setShowModal(true);
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">ผู้ใช้งานระบบ</h2>
          <p className="text-muted text-sm">ติดตามความคืบหน้าการเรียนและข้อมูลพนักงาน</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          + เพิ่มผู้ใช้งาน
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-hidden">
          <div className="card bg-white w-full max-w-md shadow-xl flex flex-col max-h-[95vh] rounded-2xl">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-2xl">
                <h3 className="text-xl font-bold">{editingUser ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
                  <span className="text-2xl leading-none">&times;</span>
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6">
               <form id="user-form" onSubmit={handleSave} className="flex flex-col gap-5">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">ชื่อ-นามสกุล</label>
                    <input required type="text" className="form-input w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="เช่น นายสมบูรณ์ เรียนดี" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">อีเมล</label>
                    <input required type="email" className="form-input w-full" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="user@company.com" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">รหัสผ่าน {editingUser && <span className="text-xs font-normal text-muted">(เว้นว่างถ้าไม่ต้องการเปลี่ยน)</span>}</label>
                    <input required={!editingUser} type="password" placeholder="••••••••" className="form-input w-full font-mono" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1.5">แผนก</label>
                        <input type="text" className="form-input w-full" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="เช่น IT" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1.5">แต้มสะสม</label>
                        <input type="number" className="form-input w-full font-bold text-warning" value={formData.pointsBalance} onChange={e => setFormData({...formData, pointsBalance: parseInt(e.target.value) || 0})} />
                      </div>
                  </div>
               </form>
             </div>
             
             <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 rounded-b-2xl">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline flex-1 py-3 font-medium">ยกเลิก</button>
                <button type="submit" form="user-form" className="btn btn-primary flex-1 py-3 font-bold shadow-lg shadow-primary/20">บันทึกข้อมูล</button>
             </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรืออีเมล..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-border rounded-md text-sm outline-none focus:border-primary"
            />
          </div>
          <select className="border border-border rounded-md px-3 py-2 bg-white text-sm text-muted outline-none">
            <option>ทุกแผนก</option>
            <option>IT</option>
            <option>HR</option>
            <option>Marketing</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-sm text-muted">
                <th className="p-4 font-medium">ผู้ใช้งาน</th>
                <th className="p-4 font-medium">แผนก</th>
                <th className="p-4 font-medium text-center">คอร์สที่จบแล้ว</th>
                <th className="p-4 font-medium text-right">แต้มสะสม</th>
                <th className="p-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan="5" className="p-8 text-center">
                     <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                   </td>
                </tr>
              ) : users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-muted mt-0.5">{user.email}</div>
                  </td>
                  <td className="p-4 text-sm text-muted">{user.department || '-'}</td>
                  <td className="p-4 text-sm text-center">
                    <span className="bg-primary-light text-primary font-bold px-2 py-1 rounded-full">{user._count?.enrollments || 0}</span>
                  </td>
                  <td className="p-4 text-sm text-right font-bold text-warning">{user.pointsBalance || 0}</td>
                  <td className="p-4 text-right flex justify-end gap-3">
                    <button className="text-primary text-sm font-medium hover:underline">ดูประวัติ</button>
                    <button onClick={() => openEdit(user)} className="text-gray-600 text-sm font-medium hover:underline">แก้ไข</button>
                    <button onClick={() => handleDelete(user.id, user.name)} className="text-red-500 text-sm font-medium hover:underline">ลบ</button>
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

export default UserManagement;
