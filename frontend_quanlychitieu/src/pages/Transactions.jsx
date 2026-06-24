import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import api from '../api/client.js';
import Modal from '../components/Modal.jsx';
import { CategoryIcon } from '../utils/icons.jsx';
import { formatVND, formatDate, todayISO } from '../utils/format.js';

export default function Transactions() {
  const [txs, setTxs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const type = watch('type', 'expense');

  async function load() {
    const [t, c] = await Promise.all([api.get('/transactions'), api.get('/categories')]);
    setTxs(t.data);
    setCategories(c.data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    reset({ type: 'expense', amount: '', category_id: '', note: '', occurred_at: todayISO() });
    setOpen(true);
  }
  function openEdit(tx) {
    setEditing(tx);
    reset({
      type: tx.type, amount: tx.amount, category_id: tx.category_id || '',
      note: tx.note || '', occurred_at: tx.occurred_at,
    });
    setOpen(true);
  }

  async function onSubmit(data) {
    const payload = { ...data, amount: Number(data.amount) };
    if (editing) await api.put(`/transactions/${editing.id}`, payload);
    else await api.post('/transactions', payload);
    setOpen(false);
    load();
  }

  async function remove(id) {
    if (!confirm('Xóa giao dịch này?')) return;
    await api.delete(`/transactions/${id}`);
    load();
  }

  const filtered = txs.filter((t) => filter === 'all' || t.type === filter);
  const catOptions = categories.filter((c) => c.type === type);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Giao dịch</h1>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600">
          <FaPlus /> Thêm giao dịch
        </button>
      </div>

      <div className="flex gap-2">
        {[['all', 'Tất cả'], ['income', 'Thu'], ['expense', 'Chi']].map(([v, label]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter === v ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-slate-400 dark:border-slate-700">Chưa có giao dịch nào</p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((t) => (
              <motion.div key={t.id}
                layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: t.categories?.color || '#94a3b8' }}>
                  <CategoryIcon name={t.categories?.icon} />
                </span>
                <div className="flex-1">
                  <p className="font-medium">{t.categories?.name || 'Không phân loại'}</p>
                  <p className="text-xs text-slate-500">{t.note || '—'} · {formatDate(t.occurred_at)}</p>
                </div>
                <span className={`flex items-center gap-1 font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? <FaArrowUp /> : <FaArrowDown />}
                  {formatVND(t.amount)}
                </span>
                <button onClick={() => openEdit(t)} className="p-2 text-slate-400 hover:text-brand-500"><FaEdit /></button>
                <button onClick={() => remove(t.id)} className="p-2 text-slate-400 hover:text-red-500"><FaTrash /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Sửa giao dịch' : 'Thêm giao dịch'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {['expense', 'income'].map((v) => (
              <label key={v} className="cursor-pointer">
                <input type="radio" value={v} {...register('type')} className="peer hidden" />
                <div className="rounded-xl border border-slate-300 py-2 text-center font-medium peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-600 dark:border-slate-600 dark:peer-checked:bg-brand-700/20">
                  {v === 'expense' ? 'Khoản chi' : 'Khoản thu'}
                </div>
              </label>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Số tiền (đ)</label>
            <input type="number" className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
              {...register('amount', { required: 'Nhập số tiền', min: { value: 1, message: 'Số tiền phải lớn hơn 0' } })} />
            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Hạng mục</label>
            <select className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
              {...register('category_id')}>
              <option value="">— Chọn hạng mục —</option>
              {catOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Ghi chú</label>
            <input className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
              placeholder="VD: ăn trưa với bạn" {...register('note')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Ngày</label>
            <input type="date" className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
              {...register('occurred_at', { required: true })} />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-brand-500 py-2.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
            {editing ? 'Lưu thay đổi' : 'Thêm giao dịch'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
