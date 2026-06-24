import { supabase } from '../config/supabase.js';

// GET /api/transactions?type=&category_id=&from=&to=
export async function listTransactions(req, res, next) {
  try {
    const { type, category_id, from, to } = req.query;
    let q = supabase
      .from('transactions')
      .select('*, categories(name, icon, color, type)')
      .eq('user_id', req.user.id)
      .order('occurred_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (type) q = q.eq('type', type);
    if (category_id) q = q.eq('category_id', category_id);
    if (from) q = q.gte('occurred_at', from);
    if (to) q = q.lte('occurred_at', to);

    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

// POST /api/transactions
export async function createTransaction(req, res, next) {
  try {
    const { type, amount, category_id, note, occurred_at } = req.body;
    if (!type || amount == null) {
      return res.status(400).json({ message: 'Thieu loai hoac so tien' });
    }
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: req.user.id,
        type,
        amount,
        category_id: category_id || null,
        note: note || null,
        occurred_at: occurred_at || new Date().toISOString().slice(0, 10),
      })
      .select('*, categories(name, icon, color, type)').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
}

// PUT /api/transactions/:id
export async function updateTransaction(req, res, next) {
  try {
    const { type, amount, category_id, note, occurred_at } = req.body;
    const { data, error } = await supabase
      .from('transactions')
      .update({ type, amount, category_id: category_id || null, note, occurred_at })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*, categories(name, icon, color, type)').single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

// DELETE /api/transactions/:id
export async function deleteTransaction(req, res, next) {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Da xoa giao dich' });
  } catch (err) { next(err); }
}
