import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaWallet, FaThLarge, FaExchangeAlt, FaChartPie, FaBullseye,
  FaBell, FaChartBar, FaBars, FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import DarkModeSwitch from './DarkModeSwitch.jsx';
import Modal from './Modal.jsx';

const NAV = [
  { to: '/', label: 'Tổng quan', icon: FaThLarge, end: true },
  { to: '/giao-dich', label: 'Giao dịch', icon: FaExchangeAlt },
  { to: '/ngan-sach', label: 'Ngân sách', icon: FaChartPie },
  { to: '/muc-tieu', label: 'Mục tiêu', icon: FaBullseye },
  { to: '/nhac-nho', label: 'Nhắc nhở', icon: FaBell },
  { to: '/bao-cao', label: 'Báo cáo', icon: FaChartBar },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  const initials = (user?.full_name || user?.email || '?').charAt(0).toUpperCase();

  function handleLogout() {
    logout();
    navigate('/dang-nhap');
  }

  const SidebarContent = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setOpenSidebar(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-500 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`
          }
        >
          <item.icon /> {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            onClick={() => setOpenSidebar(true)}
          >
            <FaBars />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
              <FaWallet />
            </span>
            <span className="text-lg font-bold tracking-tight">Ví Thông Minh</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DarkModeSwitch />
          <button
            onClick={() => setOpenUser(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 hover:ring-2 hover:ring-brand-400 dark:bg-slate-700 dark:text-white"
          >
            {initials}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar desktop */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 md:block">
          {SidebarContent}
        </aside>

        {/* Sidebar mobile */}
        <AnimatePresence>
          {openSidebar && (
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpenSidebar(false)}
            >
              <motion.aside
                className="h-full w-64 bg-white dark:bg-slate-900"
                initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                {SidebarContent}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Noi dung trang */}
        <main className="min-h-[calc(100vh-57px)] flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Modal thong tin nguoi dung */}
      <Modal open={openUser} onClose={() => setOpenUser(false)} title="Thông tin tài khoản">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-3xl font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold">{user?.full_name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </Modal>
    </div>
  );
}
