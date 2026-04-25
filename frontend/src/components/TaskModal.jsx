import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Type, AlignLeft, Flag, CheckSquare } from 'lucide-react';

const EMPTY = { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' };

export default function TaskModal({ isOpen, onClose, onSave, task }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title || '',
        description: task.description || '',
        priority:    task.priority || 'medium',
        status:      task.status || 'todo',
        dueDate:     task.dueDate ? task.dueDate.substring(0, 10) : '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [task, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Task title is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({ ...form, dueDate: form.dueDate || null });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl 
                       shadow-2xl overflow-hidden shadow-black/50"
          >
            {/* Header */}
            <div className="px-8 py-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                  {isEditing ? <CheckSquare className="w-5 h-5 text-sky-400" /> : <PlusCircle className="w-5 h-5 text-sky-400" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white leading-none">
                    {isEditing ? 'Edit Task' : 'New Task'}
                  </h2>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {isEditing ? 'Update existing details' : 'Fill in the details below'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Type className="w-3.5 h-3.5" />
                  Task Title
                </label>
                <input
                  type="text" name="title" value={form.title} onChange={handleChange}
                  placeholder="What needs to be done?"
                  className={`w-full bg-slate-950/50 border ${errors.title ? 'border-red-500/50' : 'border-white/10'} 
                             text-white placeholder-slate-600 rounded-2xl px-5 py-4 text-sm font-medium
                             focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all`}
                />
                {errors.title && <p className="text-xs font-bold text-red-400 ml-1">{errors.title}</p>}
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <AlignLeft className="w-3.5 h-3.5" />
                  Description
                </label>
                <textarea
                  name="description" value={form.description} onChange={handleChange}
                  placeholder="Add more details about this task..."
                  rows={4}
                  className="w-full bg-slate-950/50 border border-white/10 text-white placeholder-slate-600 
                             rounded-2xl px-5 py-4 text-sm font-medium resize-none
                             focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                />
              </div>

              {/* Grid Section */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Flag className="w-3.5 h-3.5" />
                    Priority
                  </label>
                  <select
                    name="priority" value={form.priority} onChange={handleChange}
                    className="w-full bg-slate-950/50 border border-white/10 text-white 
                               rounded-2xl px-5 py-4 text-sm font-medium cursor-pointer
                               focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🔴 High Priority</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    Due Date
                  </label>
                  <input
                    type="date" name="dueDate" value={form.dueDate} onChange={handleChange}
                    className="w-full bg-slate-950/50 border border-white/10 text-white 
                               rounded-2xl px-5 py-4 text-sm font-medium
                               focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/5 text-slate-400 font-bold 
                             hover:bg-white/10 hover:text-white transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[1.5] px-6 py-4 rounded-2xl bg-sky-500 text-white font-bold 
                             shadow-xl shadow-sky-500/20 hover:bg-sky-400 transition-all active:scale-95
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isEditing ? <CheckSquare className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      {isEditing ? 'Save Changes' : 'Create Task'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PlusCircle({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
