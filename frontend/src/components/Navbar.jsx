import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  LogOut, 
  ChevronDown, 
  Layout, 
  CheckCircle2, 
  Clock, 
  ListTodo,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onNewTask, stats }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-[100] bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-8">
        {/* Logo */}
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl 
                         flex items-center justify-center shadow-lg shadow-sky-500/20 
                         group-hover:scale-110 transition-transform duration-300">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">
              TaskFlow
            </span>
            <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mt-1 opacity-80">
              Workspace
            </span>
          </div>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="hidden lg:flex items-center gap-3 bg-slate-950/40 p-1.5 rounded-2xl border border-white/5">
            <StatPill icon={ListTodo} count={stats.todo} label="Todo" color="text-slate-400" bg="bg-slate-400/5" />
            <div className="w-px h-6 bg-white/5 mx-1" />
            <StatPill icon={Clock} count={stats['in-progress']} label="Progress" color="text-sky-400" bg="bg-sky-400/5" />
            <div className="w-px h-6 bg-white/5 mx-1" />
            <StatPill icon={CheckCircle2} count={stats.done} label="Done" color="text-emerald-400" bg="bg-emerald-400/5" />
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={onNewTask}
            className="hidden sm:flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 
                       rounded-xl font-bold text-sm hover:bg-sky-400 hover:text-white 
                       transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>

          {/* User Profile */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-white/5 
                         border border-transparent hover:border-white/10 transition-all duration-200"
            >
              <div className="relative">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=0ea5e9&color=fff`}
                  alt={user?.name}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-sky-500/20 shadow-lg shadow-sky-500/10"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-bold text-white leading-none mb-1">{user?.name}</span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider leading-none">Pro Plan</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-3 w-64 bg-slate-900/90 backdrop-blur-2xl 
                             border border-white/10 rounded-2xl shadow-2xl p-2 z-[110] 
                             overflow-hidden shadow-black/50"
                >
                  <div className="p-3 mb-2 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <MenuLink icon={UserIcon} label="Profile Settings" />
                    <MenuLink 
                      icon={LogOut} 
                      label="Sign Out" 
                      color="text-red-400" 
                      onClick={() => { logout(); setMenuOpen(false); }} 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatPill({ icon: Icon, count, label, color, bg }) {
  return (
    <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl ${bg} border border-transparent hover:border-white/5 transition-all`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">{label}</span>
        <span className="text-sm font-black text-white leading-none">{count}</span>
      </div>
    </div>
  );
}

function MenuLink({ icon: Icon, label, color = "text-slate-300", onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                 hover:bg-white/5 group`}
    >
      <div className={`p-1.5 rounded-lg bg-slate-800/50 group-hover:bg-slate-700 transition-colors`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className={`text-sm font-semibold ${color}`}>{label}</span>
    </button>
  );
}
