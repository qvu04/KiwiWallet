import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaWallet } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  async function onSubmit(data) {
    setError('');
    try {
      await signup(data.email, data.password, data.full_name);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800"
      >
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-2xl text-white">
            <FaWallet />
          </span>
          <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
          <p className="text-sm text-slate-500">Bắt đầu quản lý tài chính ngay</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Họ và tên</label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
              placeholder="Nguyễn Văn A"
              {...register('full_name', { required: 'Vui lòng nhập họ tên' })}
            />
            {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
              placeholder="email@vidu.com"
              {...register('email', { required: 'Vui lòng nhập email' })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-600"
              placeholder="Tối thiểu 6 ký tự"
              {...register('password', { required: 'Vui lòng nhập mật khẩu', minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' } })}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-brand-500 py-2.5 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/dang-nhap" className="font-semibold text-brand-500 hover:underline">Đăng nhập</Link>
        </p>
      </motion.div>
    </div>
  );
}
