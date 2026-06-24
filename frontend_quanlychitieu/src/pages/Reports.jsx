import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import api from '../api/client.js';
import { formatVND, firstDayOfMonthISO, todayISO } from '../utils/format.js';

const COLORS = ['#6366f1', '#f97316', '#22c55e', '#ef4444', '#a855f7', '#06b6d4', '#eab308', '#3b82f6'];

export default function Reports() {
  const [from, setFrom] = useState(firstDayOfMonthISO());
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await api.get('/reports/summary', { params: { from, to } });
    setData(res.data);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Báo cáo trực quan</h1>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div>
          <label className="mb-1 block text-sm font-medium">Từ ngày</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-600" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Đến ngày</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-600" />
        </div>
        <button onClick={load} className="rounded-xl bg-brand-500 px-5 py-2 font-medium text-white hover:bg-brand-600">Xem báo cáo</button>
      </div>

      {loading || !data ? (
        <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" /></div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Tổng thu" value={data.totalIncome} color="text-green-500" />
            <Stat label="Tổng chi" value={data.totalExpense} color="text-red-500" />
            <Stat label="Số dư" value={data.balance} color="text-brand-500" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Tỷ trọng chi theo hạng mục">
              {data.byCategory.length === 0 ? <Empty /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={data.byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(e) => `${e.name}`}>
                      {data.byCategory.map((e, i) => <Cell key={i} fill={e.color || COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatVND(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card title="So sánh thu/chi theo tháng">
              {data.byMonth.length === 0 ? <Empty /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.byMonth}>
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(v) => v / 1000 + 'k'} />
                    <Tooltip formatter={(v) => formatVND(v)} />
                    <Legend />
                    <Bar dataKey="income" name="Thu" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Chi" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card title="Xu hướng chi tiêu" full>
              {data.byMonth.length === 0 ? <Empty /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.byMonth}>
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(v) => v / 1000 + 'k'} />
                    <Tooltip formatter={(v) => formatVND(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="income" name="Thu" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="expense" name="Chi" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{formatVND(value)}</p>
    </div>
  );
}
function Card({ title, children, full }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800 ${full ? 'lg:col-span-2' : ''}`}>
      <h3 className="mb-3 font-semibold">{title}</h3>
      {children}
    </div>
  );
}
function Empty() {
  return <p className="py-12 text-center text-sm text-slate-400">Không có dữ liệu trong khoảng thời gian này</p>;
}
