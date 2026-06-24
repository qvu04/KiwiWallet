import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

// Danh muc mac dinh tao san khi dang ky
const DEFAULT_CATEGORIES = [
  { name: 'Luong', type: 'income', icon: 'FaMoneyBillWave', color: '#22c55e' },
  { name: 'Thuong', type: 'income', icon: 'FaGift', color: '#16a34a' },
  { name: 'Loi nhuan', type: 'income', icon: 'FaChartLine', color: '#10b981' },
  { name: 'An uong', type: 'expense', icon: 'FaUtensils', color: '#f97316' },
  { name: 'Giai tri', type: 'expense', icon: 'FaGamepad', color: '#a855f7' },
  { name: 'Nhu yeu pham', type: 'expense', icon: 'FaShoppingBasket', color: '#06b6d4' },
  { name: 'Giao duc', type: 'expense', icon: 'FaBook', color: '#3b82f6' },
  { name: 'Hoa don', type: 'expense', icon: 'FaFileInvoiceDollar', color: '#ef4444' },
  { name: 'Di chuyen', type: 'expense', icon: 'FaCar', color: '#eab308' },
];

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(u) {
  return { id: u.id, email: u.email, full_name: u.full_name, avatar_url: u.avatar_url };
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui long nhap email va mat khau' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Mat khau toi thieu 6 ky tu' });
    }

    const { data: existed } = await supabase
      .from('users').select('id').eq('email', email).maybeSingle();
    if (existed) {
      return res.status(409).json({ message: 'Email da duoc su dung' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from('users')
      .insert({ email, password_hash, full_name: full_name || email.split('@')[0] })
      .select('*')
      .single();
    if (error) throw error;

    // Tao danh muc mac dinh cho nguoi dung moi
    await supabase.from('categories').insert(
      DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: user.id }))
    );

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui long nhap email va mat khau' });
    }

    const { data: user } = await supabase
      .from('users').select('*').eq('email', email).maybeSingle();
    if (!user) {
      return res.status(401).json({ message: 'Email hoac mat khau khong dung' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Email hoac mat khau khong dung' });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export async function me(req, res, next) {
  try {
    const { data: user } = await supabase
      .from('users').select('*').eq('id', req.user.id).maybeSingle();
    if (!user) return res.status(404).json({ message: 'Khong tim thay nguoi dung' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}
