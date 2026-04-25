const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// All task routes require authentication
router.use(protect);

// ─── GET /api/tasks — Get all tasks for current user ──────
router.get(
  '/',
  [
    query('status').optional().isIn(['todo', 'in-progress', 'done']),
    query('priority').optional().isIn(['low', 'medium', 'high']),
  ],
  async (req, res, next) => {
    try {
      const { status, priority, search } = req.query;

      // Build filter: only tasks belonging to this user
      const filter = { user: req.user._id };
      if (status)   filter.status = status;
      if (priority) filter.priority = priority;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const tasks = await Task.find(filter).sort({ order: 1, createdAt: -1 });

      // Group tasks by status for Kanban view
      const grouped = {
        todo:        tasks.filter((t) => t.status === 'todo'),
        'in-progress': tasks.filter((t) => t.status === 'in-progress'),
        done:        tasks.filter((t) => t.status === 'done'),
      };

      res.json({
        success: true,
        count: tasks.length,
        tasks,
        grouped,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/tasks — Create a new task ──────────────────
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required')
      .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
    body('tags').optional().isArray(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
      }

      const { title, description, status, priority, dueDate, tags } = req.body;

      const task = await Task.create({
        title,
        description: description || '',
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
        user: req.user._id,
      });

      res.status(201).json({ success: true, task });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/tasks/:id — Get single task ─────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.json({ success: true, task });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID.' });
    }
    next(err);
  }
});

// ─── PUT /api/tasks/:id — Update task ─────────────────────
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().isLength({ max: 120 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional({ nullable: true }).isISO8601(),
    body('tags').optional().isArray(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      // Find the task owned by this user
      const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found.' });
      }

      const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'tags', 'order'];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          task[field] = field === 'dueDate' && req.body[field]
            ? new Date(req.body[field])
            : req.body[field];
        }
      });

      await task.save();

      res.json({ success: true, task });
    } catch (err) {
      if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid task ID.' });
      }
      next(err);
    }
  }
);

// ─── PATCH /api/tasks/:id/status — Quick status update ────
router.patch(
  '/:id/status',
  [body('status').isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { status: req.body.status },
        { new: true, runValidators: true }
      );

      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found.' });
      }

      res.json({ success: true, task });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/tasks/:id — Delete task ──────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.json({ success: true, message: 'Task deleted successfully.', taskId: req.params.id });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID.' });
    }
    next(err);
  }
});

// ─── GET /api/tasks/stats/summary — Dashboard stats ───────
router.get('/stats/summary', async (req, res, next) => {
  try {
    const stats = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = { todo: 0, 'in-progress': 0, done: 0, total: 0 };
    stats.forEach(({ _id, count }) => {
      summary[_id] = count;
      summary.total += count;
    });

    // Overdue tasks
    const overdue = await Task.countDocuments({
      user: req.user._id,
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() },
    });

    res.json({ success: true, summary: { ...summary, overdue } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
