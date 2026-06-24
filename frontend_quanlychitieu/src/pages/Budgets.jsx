import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import api from '../api/client.js';
import Modal from '../components/Modal.jsx';
import { formatVND } from '../utils/format.js';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  async function load() {
    const [b, c] = await Promise.all([api.get('/budgets'), api.get('/categories')]);
    setBudgets(b.data);
    setCategories(c.data.filter((x) => x.type === 'expense'));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    reset({ category_id: '', amount_limit: '', period: 'monthly' });
    setOpen(true);
  }
  function openEdit(b) {
    setEditing(b);
    reset({ category_id: b.category_id, amount_limit: b.amount_limit, period: b.period });
    setOpen(true);
  }

  async function onSubmit(data) {
    const payload = { ...data, amount_limit: Number(data.amount_limit) };
    if (editing) await api.put(`/budgets/${editing.id}`, payload);
    else await api.post('/budgets', payload);
    setOpen(false);
    load();
  }
  async function remove(id) {
    if (!confirm('Xóa ngân sách này?')) return;
    await api.delete(`/budgets/${id}`);
    load();
  }

  function barColor(p) {
    if (p >= 100) return 'bg-red-500';
    if (p >= 80) return 'bg-amber-500';
    return 'bg-brand-500';
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ngân sách</h1>
          <p className="text-sm text-slate-500">Đặt hạn mức chi tiêu để tránh vung tay quá trán</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600">
          <FaPlus /> Thêm ngân sách
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" /></div>
      ) : budgets.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-slate-400 dark:border-slate-700">Chưa có ngân sách nào</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {budgets.map((b) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{b.categories?.name}</p>
                  <p className="text-xs text-slate-500">{b.period === 'weekly' ? 'Theo tuần' : 'Theo tháng'}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(b)} className="p-2 text-slate-400 hover:text-brand-500"><FaEdit /></button>
                  <button onClick={() => remove(b.id)} className="p-2 text-slate-400 hover:text-red-500"><FaTrash /></button>
                </div>
              </div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Đã chi: <b>{formatVND(b.spent)}</b></span>
                <span className="text-slate-500">/ {formatVND(b.amount_limit)}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <motion.div className={`h-full ${barColor(b.percent)}`}
                  initial={{ width: 0 }} animate={{ width: `${Math.min(100, b.percent)}%` }}
                  transition={{ duration: 0.6 }} />
              </div>
              <p className={`mt-1 text-xs font-medium ${b.percent >= 100 ? 'text-red-500' : b.percent >= 80 ? 'text-amber-500' : 'text-slate-500'}`}>
                {b.percent}% — còn lại {formatVND(b.remaining)}
                {b.percent >= 100 && ' (đã vượt hạn mức!)'}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Sửa ngân sách' : 'Thêm ngân sách'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Hạng mục</label>
            <select className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
              {...register('category_id', { required: 'Chọn hạng mục' })}>
              <option value="">— Chọn hạng mục —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Hạn mức (đ)</label>
            <input type="number" className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
              {...register('amount_limit', { required: 'Nhập hạn mức', min: { value: 1, message: 'Phải lớn hơn 0' } })} />
            {errors.amount_limit && <p className="mt-1 text-xs text-red-500">{errors.amount_limit.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Chu kỳ</label>
            <select className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
              {...register('period')}>
              <option value="monthly">Theo tháng</option>
              <option value="weekly">Theo tuần</option>
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl bg-brand-500 py-2.5 font-semibold text-white hover:bg-brand-600">
            {editing ? 'Lưu thay đổi' : 'Thêm ngân sách'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
