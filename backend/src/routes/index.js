const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const auth   = require('../controllers/authController');
const user   = require('../controllers/userController');
const task   = require('../controllers/taskController');
const sub    = require('../controllers/submissionController');
const ev     = require('../controllers/evaluationController');
const admin  = require('../controllers/adminController');
const notif  = require('../controllers/notificationController');
const ai     = require('../controllers/aiController');

// Auth
router.post('/auth/login',   auth.login);
router.post('/auth/refresh', auth.refresh);
router.post('/auth/logout',  protect, auth.logout);
router.get ('/auth/me',      protect, auth.me);

// Users
router.get ('/users',             protect, authorize('admin'), user.getAll);
router.post('/users',             protect, authorize('admin'), user.create);
router.get ('/users/mentors',     protect, user.getMentors);
router.get ('/users/my-students', protect, authorize('admin','mentor'), user.getMyStudents);
router.put ('/users/:id',         protect, authorize('admin'), user.update);
router.delete('/users/:id',       protect, authorize('admin'), user.remove);

// Tasks
router.get ('/tasks',    protect, task.getAll);
router.post('/tasks',    protect, authorize('admin','mentor'), task.create);
router.put ('/tasks/:id',protect, authorize('admin','mentor'), task.update);
router.delete('/tasks/:id', protect, authorize('admin','mentor'), task.remove);

// Submissions
router.post('/submissions',         protect, authorize('student'), sub.create);
router.get ('/submissions',         protect, sub.getAll);
router.get ('/submissions/pending', protect, authorize('admin','evaluator'), sub.getPending);

// Evaluations
router.post('/evaluations', protect, authorize('admin','evaluator'), ev.create);
router.get ('/evaluations', protect, ev.getAll);

// Admin
router.get('/admin/stats',        protect, authorize('admin'), admin.stats);
router.get('/admin/perf',         protect, authorize('admin'), admin.perfDistribution);
router.get('/admin/score-trend',  protect, authorize('admin'), admin.scoreTrend);
router.get('/admin/task-trend',   protect, authorize('admin'), admin.taskTrend);
router.get('/admin/top-students', protect, authorize('admin'), admin.topStudents);

// Notifications
router.get  ('/notifications',          protect, notif.getAll);
router.patch('/notifications/read-all', protect, notif.markAllRead);
router.patch('/notifications/:id/read', protect, notif.markRead);

// AI
router.post('/ai/readiness', ai.readiness);  // public
router.post('/ai/study-plan', protect, ai.generatePlan);
router.get ('/ai/study-plans', protect, ai.getPlans);

module.exports = router;
