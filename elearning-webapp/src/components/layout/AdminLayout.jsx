import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Book, Users, Target, FileText, Gift, Menu, X, LogOut, Settings } from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/courses', icon: <Book size={20} />, label: 'จัดการคอร์สเรียน' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'ผู้ใช้งานระบบ' },
    { path: '/admin/rewards', icon: <Gift size={20} />, label: 'จัดการของรางวัล' },
    { path: '/admin/redeems', icon: <Target size={20} />, label: 'รายการ Redeem' },
    { path: '/admin/reports', icon: <FileText size={20} />, label: 'รายงาน' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'ตั้งค่าระบบ' },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <header className="admin-mobile-header">
        <button onClick={toggleDrawer} className="menu-btn">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold">Admin Panel</h1>
        <div style={{width: 24}}></div> {/* Spacer for flex balance */}
      </header>

      {/* Backdrop for mobile */}
      {isDrawerOpen && <div className="admin-backdrop" onClick={toggleDrawer}></div>}

      {/* Side Drawer / Sidebar */}
      <aside className={`admin-sidebar ${isDrawerOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="flex items-center gap-2 text-primary">
            <LayoutDashboard size={24} />
            <h2 className="font-bold text-xl">LMS Admin</h2>
          </div>
          <button className="close-btn lg-hidden" onClick={toggleDrawer}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <p className="nav-group-title">เมนูหลัก</p>
            {menuItems.map((item, idx) => (
              <NavLink 
                key={idx}
                to={item.path} 
                className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setDrawerOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-link text-danger w-full justify-start">
            <LogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
