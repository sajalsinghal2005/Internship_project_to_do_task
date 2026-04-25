import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Circle, Clock, CheckCircle2 } from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'todo', label: 'Todo', icon: Circle, color: 'text-slate-400', bg: 'bg-slate-400/10' },
  { id: 'in-progress', label: 'In Progress', icon: Clock, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { id: 'done', label: 'Done', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
];

export default function StatusDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const currentStatus = STATUS_OPTIONS.find((s) => s.id === value) || STATUS_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-slate-700/50 
                   bg-slate-800/40 hover:bg-slate-800/80 transition-all group min-w-[120px]
                   ${isOpen ? 'ring-2 ring-sky-500/50 border-sky-500/50' : ''}`}
      >
        <div className="flex items-center gap-2">
          <currentStatus.icon className={`w-3.5 h-3.5 ${currentStatus.color}`} />
          <span className="text-xs font-medium text-slate-200">{currentStatus.label}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 top-full mt-2 w-48 z-[110] bg-slate-900 border border-white/10 
                       rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="p-1.5 space-y-0.5">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg 
                             text-left transition-all group
                             ${value === option.id 
                               ? 'bg-sky-500/10 text-sky-400' 
                               : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <option.icon className={`w-4 h-4 ${value === option.id ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  {value === option.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
