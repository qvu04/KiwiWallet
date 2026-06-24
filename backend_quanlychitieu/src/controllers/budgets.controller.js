import { supabase } from '../config/supabase.js';

// Tinh moc thoi gian bat dau cua ky (tuan/thang)
function periodStart(period) {
  const now = new Date();
  if (period === 'weekly') {
    const day = (now.getDay() + 6) % 7; // thu 2 = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - day);
    return monday.toISOString().slice(0, 10);
  }
  // monthly
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

// GET /api/budgets  -> kem so da chi trong ky hien tai
export async function listBudgets(req, res, next) {
  try {
    const { data: budgets, error } = await supabase
      .from('budgets')
      .select('*, categories(name, icon, color)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true });
    if (error) throw error;

    const result = [];
    for (const b of budgets) {
      const start = periodStart(b.period);
      const { data: txs } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', req.user.id)
        .eq('category_id', b.category_id)
        .eq('type', 'expense')
        .gte('occurred_at', start);
      const spent = (txs || []).reduce((s, t) => s + Number(t.amount), 0);
      result.push({
        ...b,
        spent,
        remaining: Number(b.amount_limit) - spent,
        percent: Math.round((spent / Number(b.amount_limit)) * 100),
      });
    }
    res.json(result);
  } catch (err) { next(err); }
}

// POST /api/budgets
export async function createBudget(req, res, next) {
  try {
    const { category_id, amount_limit, period } = req.body;
    if (!category_id || !amount_limit) {
      return res.status(400).json({ message: 'Thieu danh muc hoac han muc' });
    }
    const { data, error } = await supabase
      .from('budgets')
      .insert({ user_id: req.user.id, category_id, amount_limit, period: period || 'monthly' })
      .select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
}

// PUT /api/budgets/:id
export async function updateBudget(req, res, next) {
  try {
    const { category_id, amount_limit, period } = req.body;
    const { data, error } = await supabase
      .from('budgets')
      .update({ category_id, amount_limit, period })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

// DELETE /api/budgets/:id
export async function deleteBudget(req, res, next) {
  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Da xoa ngan sach' });
  } catch (err) { next(err); }
}
