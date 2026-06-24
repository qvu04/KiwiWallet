import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  FaArrowUp, FaArrowDown, FaWallet, FaExclamationTriangle, FaBell,
} from 'react-icons/fa';
import api from '../api/client.js';
import { formatVND, firstDayOfMonthISO, todayISO, formatDate } from '../utils/format.js';

const COLORS = ['#6366f1', '#f97316', '#22c55e', '#ef4444', '#a855f7', '#06b6d4', '#eab308', '#3b82f6'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/summary', { params: { from: firstDayOfMonthISO(), to: todayISO() } }),
      api.get('/budgets'),
      api.get('/reminders'),
    ])
      .then(([s, b, r]) => {
        setSummary(s.data);
        setBudgets(b.data);
        setReminders(r.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
    </div>;
  }

  const overBudgets = budgets.filter((b) => b.percent >= 80);
  const dueReminders = reminders.filter((r) => !r.is_done && (r.isOverdue || r.isDueSoon));

  const cards = [
    { label: 'Tổng thu (tháng này)', value: summary.totalIncome, icon: FaArrowUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Tổng chi (tháng này)', value: summary.totalExpense, icon: FaArrowDown, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
    { label: 'Số dư', value: summary.balance, icon: FaWallet, color: 'text-brand-500', bg: 'bg-brand-100 dark:bg-brand-700/30' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tổng quan tháng này</h1>

      {/* Canh bao */}
      {(overBudgets.length > 0 || dueReminders.length > 0) && (
        <div className="space-y-2">
          {overBudgets.map((b) => (
            <div key={b.id} className="flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              <FaExclamationTriangle />
              Hạng mục <b>{b.categories?.name}</b> đã dùng {b.percent}% ngân sách
              {b.percent >= 100 ? ' — đã vượt hạn mức!' : ' — sắp vượt hạn mức.'}
            </div>
          ))}
          {dueReminders.map((r) => (
            <div key={r.id} className="flex items-center gap-2 rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
              <FaBell />
              Hóa đơn <b>{r.title}</b> {r.isOverdue ? 'đã quá hạn' : 'đến hạn'} ngày {formatDate(r.due_date)}
            </div>
          ))}
        </div>
      )}

      {/* The thong ke */}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{c.label}</span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.bg} ${c.color}`}>
                <c.icon />
              </span>
            </div>
            <p className={`mt-2 text-2xl font-bold ${c.color}`}>{formatVND(c.value)}</p>
          </motion.div>
        ))}
      </div>

      {/* Bieu do */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-3 font-semibold">Chi tiêu theo hạng mục</h3>
          {summary.byCategory.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">Chưa có dữ liệu chi tiêu</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={summary.byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {summary.byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatVND(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-3 font-semibold">Thu / Chi theo tháng</h3>
          {summary.byMonth.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={summary.byMonth}>
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => (v / 1000) + 'k'} />
                <Tooltip formatter={(v) => formatVND(v)} />
                <Legend />
                <Bar dataKey="income" name="Thu" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Chi" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
