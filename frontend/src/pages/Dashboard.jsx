import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

const COLUMNS = [
  { id: 'todo',        label: 'Todo',       icon: '📋', color: 'border-slate-600', text: 'text-slate-400' },
  { id: 'in-progress', label: 'In Progress', icon: '⚡', color: 'border-sky-500',   text: 'text-sky-400'   },
  { id: 'done',        label: 'Done',        icon: '✅', color: 'border-emerald-500',text: 'text-emerald-400'},
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [stats,        setStats]        = useState(null);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingTask,  setEditingTask]  = useState(null);
  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [search,       setSearch]       = useState('');
  const [filterPri,    setFilterPri]    = useState('');

  // ─── Fetch tasks ─────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (search)    params.search   = search;
      if (filterPri) params.priority = filterPri;

      const [tasksRes, statsRes] = await Promise.all([
        api.get('/tasks', { params }),
        api.get('/tasks/stats/summary'),
      ]);
      setTasks(tasksRes.data.tasks);
      setStats(statsRes.data.summary);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [search, filterPri]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ─── Create / Update task ─────────────────────────────────
  const handleSaveTask = async (formData) => {
    try {
      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, formData);
        setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? res.data.task : t)));
        toast.success('Task updated!');
      } else {
        const res = await api.post('/tasks', formData);
        setTasks((prev) => [res.data.task, ...prev]);
        toast.success('Task created!');
      }
      fetchTasks(); // refresh stats
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save task';
      toast.error(msg);
      throw err;
    }
  };

  // ─── Delete task ──────────────────────────────────────────
  const handleDelete = (taskId) => {
    setTaskToDelete(taskId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete));
      toast.success('Task deleted.');
      fetchTasks(); // refresh stats
    } catch (err) {
      toast.error('Failed to delete task');
    } finally {
      setConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  // ─── Status change ────────────────────────────────────────
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data.task : t)));
      fetchTasks(); // refresh stats
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // ─── Drag & Drop ──────────────────────────────────────────
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.patch(`/tasks/${draggableId}/status`, { status: newStatus });
      fetchTasks();
    } catch {
      toast.error('Failed to move task');
      fetchTasks(); // revert
    }
  };

  // ─── Open modals ──────────────────────────────────────────
  const openCreate = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit   = (task) => { setEditingTask(task); setModalOpen(true); };

  // ─── Filter tasks by column ───────────────────────────────
  const getColumnTasks = (colId) =>
    tasks.filter((t) => t.status === colId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar onNewTask={openCreate} stats={stats} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-400 text-base mt-2 max-w-2xl font-medium">
              You've got some work to do. Here's an overview of your active tasks and progress.
            </p>
          </div>
          
          <button 
            onClick={openCreate}
            className="hidden md:flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white 
                       px-6 py-3 rounded-2xl font-bold shadow-lg shadow-sky-500/20 
                       transition-all active:scale-95 group"
          >
            <span className="bg-white/20 p-1 rounded-md group-hover:bg-white/30 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            Create New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-10 bg-slate-800/30 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
          <div className="relative flex-1 min-w-[300px]">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" placeholder="Search for anything..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-100 
                         placeholder-slate-500 rounded-2xl pl-12 pr-4 py-3.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50
                         transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500 hidden sm:block">Priority:</span>
            <select
              value={filterPri} onChange={(e) => setFilterPri(e.target.value)}
              className="bg-slate-900/50 border border-slate-700/50 text-slate-200 
                         rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none
                         focus:ring-2 focus:ring-sky-500/50 transition-all cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {COLUMNS.map((col) => {
                const colTasks = getColumnTasks(col.id);
                return (
                  <div key={col.id} className="flex flex-col">
                    {/* Column header */}
                    <div className={`flex items-center gap-3 mb-6 pb-4 border-b-2 ${col.color} relative group`}>
                      <span className="text-xl">{col.icon}</span>
                      <h2 className="text-base font-bold text-white tracking-wide uppercase">{col.label}</h2>
                      <span className={`ml-auto px-2.5 py-1 rounded-lg bg-white/5 ${col.text} text-xs font-bold border border-white/5`}>
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Droppable column */}
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex flex-col gap-4 min-h-[500px] rounded-3xl p-4 transition-all duration-300
                            ${snapshot.isDraggingOver ? 'bg-sky-500/5 ring-2 ring-sky-500/20' : 'bg-slate-800/10'}`}
                        >
                          {colTasks.length === 0 && !snapshot.isDraggingOver && (
                            <div className="flex flex-col items-center justify-center h-32 text-slate-600 text-sm gap-2">
                              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <span>No tasks here</span>
                            </div>
                          )}

                          {colTasks.map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <TaskCard
                                    task={task}
                                    onEdit={openEdit}
                                    onDelete={handleDelete}
                                    onStatusChange={handleStatusChange}
                                    isDragging={snapshot.isDragging}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}

                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    {/* Add task shortcut in column */}
                    <button
                      onClick={openCreate}
                      className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-sky-400
                                 font-semibold bg-white/5 hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/20
                                 py-3.5 rounded-2xl transition-all group"
                    >
                      <span className="bg-slate-700/50 group-hover:bg-sky-500/20 p-1 rounded-lg transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                      Add a new card
                    </button>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone and will remove the task permanently."
      />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
