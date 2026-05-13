import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bus, Map, 
  CalendarClock, Ticket, Percent, 
  Settings, LogOut, ChevronLeft, ChevronRight,
  ShieldCheck, Activity, LayoutGrid, MapPin,
  ExternalLink, Home, Menu, X
} from 'lucide-react';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const adminName = localStorage.getItem('userName') || 'System Admin';
  const adminEmail = localStorage.getItem('userEmail') || 'admin@bluebus.com';

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { path: '/admin/operators', icon: <Activity size={20} />, label: 'Partners' },
    { path: '/admin/buses', icon: <Bus size={20} />, label: 'Fleet' },
    { path: '/admin/seats', icon: <LayoutGrid size={20} />, label: 'Seats' },
    { path: '/admin/trips', icon: <CalendarClock size={20} />, label: 'Schedules' },
    { path: '/admin/stops', icon: <MapPin size={20} />, label: 'Stops' },
    { path: '/admin/bookings', icon: <Ticket size={20} />, label: 'Bookings' },
    { path: '/admin/coupons', icon: <Percent size={20} />, label: 'Coupons' },
    { path: '/admin/maintenance', icon: <Settings size={20} />, label: 'Maintenance' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-[#0d2694] text-white transition-all duration-300 ease-in-out z-50 flex flex-col shadow-2xl 
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'} 
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-white/10 overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
              <Bus className="text-[#0d2694]" size={20} />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-black tracking-tighter uppercase italic">Blue<span className="text-blue-400">Bus</span> Admin</span>
            )}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-white/15 text-white shadow-lg shadow-black/10 backdrop-blur-md border border-white/10' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="shrink-0">{item.icon}</div>
                  {!isCollapsed && <span className="font-bold text-sm">{item.label}</span>}
                  {!isCollapsed && isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center gap-4 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!isCollapsed && <span className="font-bold text-sm">Collapse Sidebar</span>}
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 mt-1 text-red-300 hover:text-red-100 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`flex-1 transition-all duration-300 min-w-0 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsMobileOpen(true)}
               className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
             >
               <Menu size={24} />
             </button>
             <h2 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight">Console</h2>
             <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">Live</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* ✅ Switch to Normal Site Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group"
            >
              <Home size={16} className="group-hover:scale-110 transition-transform" />
              View Site
            </button>

            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Admin</p>
                <p className="text-sm font-black text-slate-800 max-w-[140px] truncate">{adminName}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="p-8 animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default AdminLayout;
