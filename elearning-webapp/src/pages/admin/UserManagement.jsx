import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Eye, Plus, Search, Settings2, Sparkles } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTable from '../../components/admin/AdminTable';
import UserModal from '../../components/admin/UserModal';
import ReferenceDataModal from '../../components/admin/ReferenceDataModal';
import UserDetailModal from '../../components/admin/UserDetailModal';
import { canEditAdminUsers, getRoleLabel } from '../../utils/roles';

const getDefaultFormData = () => ({
  name: '',
  email: '',
  password: '',
  role: 'user',
  departmentId: '',
  tierId: '',
  employmentDate: '',
  pointsBalance: 0,
});

const formatDateForInput = (value) => {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString().slice(0, 10);
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [referenceLoading, setReferenceLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState('ALL');

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(getDefaultFormData());

  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), []);
  const canEditUsers = canEditAdminUsers(currentUser?.role);
  const isManagerView = !canEditUsers;

  useEffect(() => {
    const bootstrap = async () => {
      await Promise.all([fetchUsers(), fetchReferenceData()]);
    };

    bootstrap();
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

  const fetchReferenceData = async () => {
    try {
      const [departmentResponse, tierResponse] = await Promise.all([
        adminAPI.getDepartments(),
        adminAPI.getTiers(),
      ]);
      setDepartments(departmentResponse.data);
      setTiers(tierResponse.data);
    } catch (error) {
      console.error('Fetch reference data error:', error);
    } finally {
      setReferenceLoading(false);
    }
  };

  const handleSaveUser = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...formData,
        employmentDate: formData.employmentDate || null,
      };

      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, payload);
        alert('อัปเดตข้อมูลผู้ใช้งานเรียบร้อย');
      } else {
        await adminAPI.createUser(payload);
        alert('เพิ่มผู้ใช้งานเรียบร้อย');
      }

      setShowUserModal(false);
      setEditingUser(null);
      setFormData(getDefaultFormData());
      fetchUsers();
    } catch (error) {
      console.error('Save user error:', error);
      alert(error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลผู้ใช้งานได้');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`ต้องการลบผู้ใช้งาน "${name}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      alert(error.response?.data?.message || 'ลบผู้ใช้งานไม่สำเร็จ');
    }
  };

  const handleViewUser = async (userId) => {
    try {
      setShowDetailModal(true);
      setDetailLoading(true);
      const response = await adminAPI.getUserDetails(userId);
      setSelectedUserDetail(response.data);
    } catch (error) {
      console.error('Fetch user detail error:', error);
      alert(error.response?.data?.message || 'ไม่สามารถโหลดประวัติผู้ใช้งานได้');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openAddUser = () => {
    setEditingUser(null);
    setFormData(getDefaultFormData());
    setShowUserModal(true);
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role || 'user',
      departmentId: user.departmentId || '',
      tierId: user.tierId || '',
      employmentDate: formatDateForInput(user.employmentDate),
      pointsBalance: user.pointsBalance || 0,
    });
    setShowUserModal(true);
  };

  const handleDepartmentDelete = async (id, name) => {
    if (!window.confirm(`ต้องการลบแผนก "${name}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      await adminAPI.deleteDepartment(id);
      await Promise.all([fetchReferenceData(), fetchUsers()]);
    } catch (error) {
      console.error('Delete department error:', error);
      alert(error.response?.data?.message || 'ลบแผนกไม่สำเร็จ');
    }
  };

  const handleTierDelete = async (id, name) => {
    if (!window.confirm(`ต้องการลบระดับ "${name}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      await adminAPI.deleteTier(id);
      await Promise.all([fetchReferenceData(), fetchUsers()]);
    } catch (error) {
      console.error('Delete tier error:', error);
      alert(error.response?.data?.message || 'ลบระดับไม่สำเร็จ');
    }
  };

  const filteredUsers = useMemo(() => (
    users.filter((user) => {
      const keyword = searchTerm.trim().toLowerCase();
      const matchesKeyword =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword);

      const matchesDepartment =
        selectedDepartment === 'ALL' || user.departmentId === selectedDepartment;

      const matchesTier =
        selectedTier === 'ALL' || user.tierId === selectedTier;

      return matchesKeyword && matchesDepartment && matchesTier;
    })
  ), [searchTerm, selectedDepartment, selectedTier, users]);

  const columns = [
    { label: 'ผู้ใช้งาน' },
    { label: 'Role ระบบ' },
    { label: 'แผนก' },
    { label: 'ระดับผู้เรียน' },
    { label: 'เริ่มงาน' },
    { label: 'คอร์สที่จบ', className: 'text-center' },
    { label: 'แต้มสะสม', className: 'text-right' },
    { label: 'จัดการ', className: 'text-right' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={isManagerView ? 'พนักงานในแผนก' : 'ผู้ใช้งานระบบ'}
        subtitle={isManagerView
          ? `ดูข้อมูลผู้ใช้งานเฉพาะแผนก ${currentUser?.department || 'ของคุณ'} และตรวจสอบประวัติการเรียนกับ Point ได้ในที่เดียว`
          : 'เพิ่มผู้ใช้งาน จัดการแผนก/ระดับ และดูประวัติการเรียนกับ Point รายบุคคล'}
        actions={(
          <div className="flex flex-wrap gap-2">
            {canEditUsers && (
              <>
                <button type="button" onClick={() => setShowDepartmentModal(true)} className="btn btn-outline">
                  <Settings2 size={18} />
                  จัดการแผนก
                </button>
                <button type="button" onClick={() => setShowTierModal(true)} className="btn btn-outline">
                  <Sparkles size={18} />
                  จัดการระดับผู้เรียน
                </button>
                <button type="button" onClick={openAddUser} className="btn btn-primary">
                  <Plus size={18} />
                  เพิ่มผู้ใช้งาน
                </button>
              </>
            )}
          </div>
        )}
      />

      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
        departments={departments}
        tiers={tiers}
        canEditRole={canEditUsers}
      />

      {canEditUsers && (
        <>
          <ReferenceDataModal
            isOpen={showDepartmentModal}
            title="จัดการแผนก"
            description="เพิ่ม แก้ไข หรือลบแผนกที่ใช้กับการกำหนดผู้ใช้งานและขอบเขตการมองเห็นคอร์ส"
            itemLabel="แผนก"
            items={departments}
            loading={referenceLoading}
            onClose={() => setShowDepartmentModal(false)}
            onCreate={async (payload) => {
              await adminAPI.createDepartment(payload);
              await Promise.all([fetchReferenceData(), fetchUsers()]);
            }}
            onUpdate={async (id, payload) => {
              await adminAPI.updateDepartment(id, payload);
              await Promise.all([fetchReferenceData(), fetchUsers()]);
            }}
            onDelete={handleDepartmentDelete}
          />

          <ReferenceDataModal
            isOpen={showTierModal}
            title="จัดการระดับผู้เรียน"
            description="ระดับผู้เรียนจะถูกใช้แบบลำดับขั้น เช่น ตั้งแต่ Supervisor จะครอบคลุม Manager และ Director ที่สูงกว่า"
            itemLabel="ระดับ"
            items={tiers}
            loading={referenceLoading}
            onClose={() => setShowTierModal(false)}
            onCreate={async (payload) => {
              await adminAPI.createTier(payload);
              await Promise.all([fetchReferenceData(), fetchUsers()]);
            }}
            onUpdate={async (id, payload) => {
              await adminAPI.updateTier(id, payload);
              await Promise.all([fetchReferenceData(), fetchUsers()]);
            }}
            onDelete={handleTierDelete}
          />
        </>
      )}

      <UserDetailModal
        isOpen={showDetailModal}
        loading={detailLoading}
        detail={selectedUserDetail}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedUserDetail(null);
        }}
      />

      <div className="card overflow-hidden">
        <div className="flex flex-wrap gap-4 border-b border-border p-4">
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรืออีเมล..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-md border border-border bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary"
            />
          </div>

          <select
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-muted outline-none"
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
          >
            <option value="ALL">ทุกแผนก</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-muted outline-none"
            value={selectedTier}
            onChange={(event) => setSelectedTier(event.target.value)}
          >
            <option value="ALL">ทุกระดับ</option>
            {tiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name}
              </option>
            ))}
          </select>
        </div>

        <AdminTable
          columns={columns}
          data={filteredUsers}
          loading={loading}
          emptyMessage="ยังไม่พบผู้ใช้งานที่ตรงกับตัวกรอง"
          renderRow={(user) => (
            <tr key={user.id} className="border-b border-border transition-colors hover:bg-gray-50/50">
              <td className="p-4">
                <div className="font-medium text-sm">{user.name}</div>
                <div className="mt-0.5 text-xs text-muted">{user.email}</div>
              </td>
              <td className="p-4 text-sm text-muted">{getRoleLabel(user.role)}</td>
              <td className="p-4 text-sm text-muted">{user.department || '-'}</td>
              <td className="p-4 text-sm text-muted">{user.tier || '-'}</td>
              <td className="p-4 text-sm text-muted">
                {user.employmentDate ? new Date(user.employmentDate).toLocaleDateString('th-TH') : '-'}
              </td>
              <td className="p-4 text-center text-sm">
                <span className="rounded-full bg-primary-light px-2 py-1 font-bold text-primary">
                  {user._count?.enrollments || 0}
                </span>
              </td>
              <td className="p-4 text-right text-sm font-bold text-warning">{user.pointsBalance || 0}</td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => handleViewUser(user.id)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <Eye size={14} />
                    ดูประวัติ
                  </button>
                  {canEditUsers && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditUser(user)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:underline"
                      >
                        <Edit size={14} />
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-sm font-medium text-red-500 hover:underline"
                      >
                        ลบ
                      </button>
                    </>
                  )}
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
