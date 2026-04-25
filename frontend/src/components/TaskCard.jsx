import { format, isPast } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar, Trash2, Edit3 } from 'lucide-react';
import StatusDropdown from './StatusDropdown';

const PRIORITY_MAP = {
  low:    { label: 'Low',    class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  medium: { label: 'Medium', class: 'bg-amber-500/10   text-amber-400 border-amber-500/20'   },
  high:   { label: 'High',   class: 'bg-red-500/10     text-red-400 border-red-500/20'     },
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, isDragging }) {
  const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
  const isOverdue = task.dueDate && task.status !== 'done' && isPast(new Date(task.dueDate));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative p-5 cursor-grab active:cursor-grabbing transition-all duration-300 group
        bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl
        hover:border-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/5
        ${isDragging ? 'z-50 shadow-2xl shadow-sky-900/40 scale-105 rotate-1 opacity-90' : ''}
      `}
    >
      {/* Glow Effect Layer */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Priority & Actions */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${priority.class}`}>
          {priority.label}
        </span>
        
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-all"
            title="Edit task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-slate-400 hover:text-white transition-all"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className={`text-base font-bold text-slate-100 mb-2 leading-tight
        ${task.status === 'done' ? 'line-through text-slate-500' : ''}`}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-slate-400/80 leading-relaxed line-clamp-2 mb-5">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex flex-col gap-4 mt-auto pt-4 border-t border-slate-700/30">
        <div className="flex items-center justify-between gap-2">
          {/* Due date */}
          {task.dueDate ? (
            <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-[11px] font-medium
              ${isOverdue ? 'bg-red-500/10 text-red-400' : 'bg-slate-700/30 text-slate-500'}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            </div>
          ) : (
            <div />
          )}

          {/* Custom Status Dropdown */}
          <StatusDropdown 
            value={task.status} 
            onChange={(newStatus) => onStatusChange(task._id, newStatus)} 
          />
        </div>
      </div>
    </motion.div>
  );
}
