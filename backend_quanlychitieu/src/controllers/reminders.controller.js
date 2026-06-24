import { supabase } from '../config/supabase.js';

// GET /api/reminders
export async function listReminders(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('due_date', { ascending: true });
    if (error) throw error;

    const today = new Date().toISOString().slice(0, 10);
    const enriched = (data || []).map((r) => ({
      ...r,
      isOverdue: !r.is_done && r.due_date < today,
      isDueSoon:
        !r.is_done &&
        r.due_date >= today &&
        (new Date(r.due_date) - new Date(today)) / (1000 * 60 * 60 * 24) <= 3,
    }));
    res.json(enriched);
  } catch (err) { next(err); }
}

// POST /api/reminders
export async function createReminder(req, res, next) {
  try {
    const { title, amount, due_date, repeat } = req.body;
    if (!title || !due_date) {
      return res.status(400).json({ message: 'Thieu tieu de hoac ngay den han' });
    }
    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: req.user.id,
        title,
        amount: amount || null,
        due_date,
        repeat: repeat || 'none',
      })
      .select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
}

// PUT /api/reminders/:id
export async function updateReminder(req, res, next) {
  try {
    const { title, amount, due_date, repeat, is_done } = req.body;
    const { data, error } = await supabase
      .from('reminders')
      .update({ title, amount, due_date, repeat, is_done })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

// DELETE /api/reminders/:id
export async function deleteReminder(req, res, next) {
  try {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Da xoa nhac nho' });
  } catch (err) { next(err); }
}
