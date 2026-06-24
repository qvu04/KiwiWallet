import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaBell, FaCheck, FaRedo } from 'react-icons/fa';
import api from '../api/client.js';
import Modal from '../components/Modal.jsx';
import { formatVND, formatDate, todayISO } from '../utils/format.js';

const REPEAT_LABEL = { none: 'Một lần', weekly: 'Hàng tuần', monthly: 'Hàng tháng' };

export default function Reminders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  async function load() {
    const { data } = await api.get('/reminders');
    setItems(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    reset({ title: '', amount: '', due_date: todayISO(), repeat: 'monthly' });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    reset({ title: r.title, amount: r.amount || '', due_date: r.due_date, repeat: r.repeat });
    setOpen(true);
  }

  async function onSubmit(data) {
    const payload = { ...data, amount: data.amount ? Number(data.amount) : null };
    if (editing) await api.put(`/reminders/${editing.id}`, payload);
    else await api.post('/reminders', payload);
    setOpen(false);
    load();
  }
  async function toggleDone(r) {
    await api.put(`/reminders/${r.id}`, { ...r, is_done: !r.is_done });
    load();
  }
  async function remove(id) {
    if (!confirm('Xóa nhắc nhở này?')) return;
    await api.delete(`/reminders/${id}`);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Nhắc nhở & Hóa đơn</h1>
          <p className="text-sm text-slate-500">Tiền nhà, điện nước, thẻ tín dụng... không bao giờ quên</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600">
          <FaPlus /> Thêm nhắc nhở
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-slate-400 dark:border-slate-700">Chưa có nhắc nhở nào</p>
      ) : (
        <div className="space-y-2">
          {items.map((r) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                r.is_done ? 'border-slate-200 bg-slate-50 opacity-60 dark:border-slate-700 dark:bg-slate-800/50'
                : r.isOverdue ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                : r.isDueSoon ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
              }`}>
              <button onClick={() => toggleDone(r)}
                className={`flex h-9 w-9 items-center justify-center rounded-full ${r.is_done ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700'}`}>
                {r.is_done ? <FaCheck /> : <FaBell />}
              </button>
              <div className="flex-1">
                <p className={`font-medium ${r.is_done ? 'line-through' : ''}`}>{r.title}</p>
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  Hạn: {formatDate(r.due_date)} · <FaRedo className="inline" /> {REPEAT_LABEL[r.repeat]}
                  {r.isOverdue && !r.is_done && <span className="font-semibold text-red-500">· Quá hạn</span>}
                  {r.isDueSoon && !r.is_done && <span className="font-semibold text-amber-500">· Sắp đến hạn</span>}
                </p>
              </div>
              {r.amount && <span className="font-semibold">{formatVND(r.amount)}</span>}
              <button onClick={() => openEdit(r)} className="p-2 text-slate-400 hover:text-brand-500"><FaEdit /></button>
              <button onClick={() => remove(r.id)} className="p-2 text-slate-400 hover:text-red-500"><FaTrash /></button>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Sửa nhắc nhở' : 'Thêm nhắc nhở'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Tiêu đề</label>
            <input className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
              placeholder="VD: Tiền điện tháng 6" {...register('title', { required: 'Nhập tiêu đề' })} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Số tiền (tùy chọn)</label>
            <input type="number" className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
              {...register('amount')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Ngày đến hạn</label>
              <input type="date" className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
                {...register('due_date', { required: true })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Lặp lại</label>
              <select className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
                {...register('repeat')}>
                <option value="none">Một lần</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-brand-500 py-2.5 font-semibold text-white hover:bg-brand-600">
            {editing ? 'Lưu thay đổi' : 'Thêm nhắc nhở'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
