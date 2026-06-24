import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaBullseye } from 'react-icons/fa';
import api from '../api/client.js';
import Modal from '../components/Modal.jsx';
import { formatVND, formatDate } from '../utils/format.js';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  async function load() {
    const { data } = await api.get('/goals');
    setGoals(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    reset({ name: '', target_amount: '', saved_amount: 0, deadline: '' });
    setOpen(true);
  }
  function openEdit(g) {
    setEditing(g);
    reset({ name: g.name, target_amount: g.target_amount, saved_amount: g.saved_amount, deadline: g.deadline || '' });
    setOpen(true);
  }

  async function onSubmit(data) {
    const payload = {
      ...data,
      target_amount: Number(data.target_amount),
      saved_amount: Number(data.saved_amount || 0),
      deadline: data.deadline || null,
    };
    if (editing) await api.put(`/goals/${editing.id}`, payload);
    else await api.post('/goals', payload);
    setOpen(false);
    load();
  }
  async function remove(id) {
    if (!confirm('Xóa mục tiêu này?')) return;
    await api.delete(`/goals/${id}`);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mục tiêu tài chính</h1>
          <p className="text-sm text-slate-500">Lập kế hoạch tiết kiệm cho mua xe, du lịch, quỹ khẩn cấp...</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600">
          <FaPlus /> Thêm mục tiêu
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" /></div>
      ) : goals.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-slate-400 dark:border-slate-700">Chưa có mục tiêu nào</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-700/30 dark:text-brand-100"><FaBullseye /></span>
                  <div>
                    <p className="font-semibold">{g.name}</p>
                    {g.deadline && <p className="text-xs text-slate-500">Hạn: {formatDate(g.deadline)}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(g)} className="p-2 text-slate-400 hover:text-brand-500"><FaEdit /></button>
                  <button onClick={() => remove(g.id)} className="p-2 text-slate-400 hover:text-red-500"><FaTrash /></button>
                </div>
              </div>
              <div className="mb-1 flex justify-between text-sm">
                <span>{formatVND(g.saved_amount)}</span>
                <span className="text-slate-500">/ {formatVND(g.target_amount)}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <motion.div className="h-full bg-green-500"
                  initial={{ width: 0 }} animate={{ width: `${g.percent}%` }} transition={{ duration: 0.6 }} />
              </div>
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>{g.percent}% hoàn thành</span>
                {g.monthlySuggested != null && g.percent < 100 && (
                  <span>Nên tiết kiệm <b className="text-brand-500">{formatVND(g.monthlySuggested)}</b>/tháng</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Sửa mục tiêu' : 'Thêm mục tiêu'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Tên mục tiêu</label>
            <input className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
              placeholder="VD: Mua xe máy" {...register('name', { required: 'Nhập tên mục tiêu' })} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Số tiền mục tiêu (đ)</label>
              <input type="number" className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
                {...register('target_amount', { required: 'Nhập số tiền', min: { value: 1, message: '> 0' } })} />
              {errors.target_amount && <p className="mt-1 text-xs text-red-500">{errors.target_amount.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Đã tiết kiệm (đ)</label>
              <input type="number" className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
                {...register('saved_amount')} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Hạn hoàn thành (tùy chọn)</label>
            <input type="date" className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
              {...register('deadline')} />
          </div>
          <button type="submit" className="w-full rounded-xl bg-brand-500 py-2.5 font-semibold text-white hover:bg-brand-600">
            {editing ? 'Lưu thay đổi' : 'Thêm mục tiêu'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
