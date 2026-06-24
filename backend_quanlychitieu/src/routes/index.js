import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as auth from '../controllers/auth.controller.js';
import * as cat from '../controllers/categories.controller.js';
import * as tx from '../controllers/transactions.controller.js';
import * as budget from '../controllers/budgets.controller.js';
import * as goal from '../controllers/goals.controller.js';
import * as reminder from '../controllers/reminders.controller.js';
import * as report from '../controllers/reports.controller.js';

const router = Router();

// --- Auth ---
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', requireAuth, auth.me);

// Tat ca route ben duoi deu can dang nhap
router.use(requireAuth);

// --- Danh muc ---
router.get('/categories', cat.listCategories);
router.post('/categories', cat.createCategory);
router.put('/categories/:id', cat.updateCategory);
router.delete('/categories/:id', cat.deleteCategory);

// --- Giao dich ---
router.get('/transactions', tx.listTransactions);
router.post('/transactions', tx.createTransaction);
router.put('/transactions/:id', tx.updateTransaction);
router.delete('/transactions/:id', tx.deleteTransaction);

// --- Ngan sach ---
router.get('/budgets', budget.listBudgets);
router.post('/budgets', budget.createBudget);
router.put('/budgets/:id', budget.updateBudget);
router.delete('/budgets/:id', budget.deleteBudget);

// --- Muc tieu ---
router.get('/goals', goal.listGoals);
router.post('/goals', goal.createGoal);
router.put('/goals/:id', goal.updateGoal);
router.delete('/goals/:id', goal.deleteGoal);

// --- Nhac nho ---
router.get('/reminders', reminder.listReminders);
router.post('/reminders', reminder.createReminder);
router.put('/reminders/:id', reminder.updateReminder);
router.delete('/reminders/:id', reminder.deleteReminder);

// --- Bao cao ---
router.get('/reports/summary', report.summary);

export default router;
