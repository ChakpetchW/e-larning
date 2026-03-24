import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTable from '../../components/admin/AdminTable';
import UserModal from '../../components/admin/UserModal';

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

  const handleDelete = async (id, name) => {
    if (confirm(`คุณต้องการลบผู้ใช้ "${name}" ใช่หรือไม่?`)) {
      try {
        await adminAPI.deleteUser(id);
        fetchUsers();
      } catch (error) {
        alert('ไม่สามารถลบผู้ใช้ได้');
      }
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      department: user.department || '',
      pointsBalance: user.pointsBalance || 0,
      password: ''
    });
    setShowModal(true);
  };
   
  const openAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', department: '', pointsBalance: 0 });
    setShowModal(true);
  };

  const columns = [
    { label: "ผู้ใช้งาน" },
    { label: "แผนก" },
    { label: "คอร์สที่จบแล้ว", className: "text-center" },
    { label: "แต้มสะสม", className: "text-right" },
    { label: "จัดการ", className: "text-right" }
  ];

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader 
        title="ผู้ใช้งานระบบ" 
        subtitle="ติดตามความคืบหน้าการเรียนและข้อมูลพนักงาน"
        actions={
          <button onClick={openAdd} className="btn btn-primary">
            <Plus size={18} /> เพิ่มผู้ใช้งาน
          </button>
        }
      />

      <UserModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
      />

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
          <select className="border border-border rounded-md px-3 py-2 bg-white text-sm text-muted outline-none cursor-pointer">
            <option>ทุกแผนก</option>
            <option>IT</option>
            <option>HR</option>
            <option>Marketing</option>
          </select>
        </div>

        <AdminTable 
          columns={columns}
          data={filteredUsers}
          loading={loading}
          renderRow={(user) => (
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
              <td className="p-4 text-right">
                <div className="flex justify-end gap-3">
                  <button className="text-primary text-sm font-medium hover:underline">ดูประวัติ</button>
                  <button onClick={() => openEdit(user)} className="text-gray-600 text-sm font-medium hover:underline">แก้ไข</button>
                  <button onClick={() => handleDelete(user.id, user.name)} className="text-red-500 text-sm font-medium hover:underline">ลบ</button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default UserManagement;
