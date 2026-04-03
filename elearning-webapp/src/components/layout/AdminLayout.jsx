import React, { useId, useRef, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Book,
  Users,
  Target,
  FileText,
  Gift,
  Menu,
  X,
  LogOut,
  Settings,
} from 'lucide-react';
import useAccessibleOverlay from '../../hooks/useAccessibleOverlay';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const drawerTitleId = useId();

  const toggleDrawer = () => setDrawerOpen((current) => !current);
  const closeDrawer = () => setDrawerOpen(false);

  useAccessibleOverlay({
    isOpen: isDrawerOpen,
    onClose: closeDrawer,
    containerRef: drawerRef,
    initialFocusRef: closeButtonRef,
  });

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
      <header className="admin-mobile-header">
        <button
          type="button"
          onClick={toggleDrawer}
          className="menu-btn"
          aria-controls="admin-navigation-drawer"
          aria-expanded={isDrawerOpen}
          aria-haspopup="dialog"
          aria-label="เปิดเมนูผู้ดูแลระบบ"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold">Admin Panel</h1>
        <div style={{ width: 24 }} />
      </header>

      {isDrawerOpen && (
        <button
          type="button"
          className="admin-backdrop"
          onClick={closeDrawer}
          aria-label="ปิดเมนูผู้ดูแลระบบ"
        />
      )}

      <aside
        id="admin-navigation-drawer"
        ref={drawerRef}
        role={isDrawerOpen ? 'dialog' : undefined}
        aria-modal={isDrawerOpen ? 'true' : undefined}
        aria-labelledby={drawerTitleId}
        tabIndex={isDrawerOpen ? -1 : undefined}
        className={`admin-sidebar ${isDrawerOpen ? 'open' : ''}`}
      >
        <div className="sidebar-header">
          <div className="flex items-center gap-2 text-primary">
            <LayoutDashboard size={24} />
            <h2 id={drawerTitleId} className="font-bold text-xl">
              LMS Admin
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="close-btn lg-hidden"
            onClick={closeDrawer}
            aria-label="ปิดเมนูผู้ดูแลระบบ"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="เมนูผู้ดูแลระบบ">
          <div className="nav-group">
            <p className="nav-group-title">เมนูหลัก</p>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeDrawer}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-link text-danger w-full justify-start"
          >
            <LogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
