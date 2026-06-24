import { supabase } from '../config/supabase.js';

// GET /api/goals
export async function listGoals(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true });
    if (error) throw error;

    const enriched = (data || []).map((g) => {
      const percent = Math.min(100, Math.round((Number(g.saved_amount) / Number(g.target_amount)) * 100));
      let monthlySuggested = null;
      if (g.deadline) {
        const months = Math.max(
          1,
          Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30))
        );
        monthlySuggested = Math.max(0, Math.ceil((Number(g.target_amount) - Number(g.saved_amount)) / months));
      }
      return { ...g, percent, monthlySuggested };
    });
    res.json(enriched);
  } catch (err) { next(err); }
}

// POST /api/goals
export async function createGoal(req, res, next) {
  try {
    const { name, target_amount, saved_amount, deadline } = req.body;
    if (!name || !target_amount) {
      return res.status(400).json({ message: 'Thieu ten hoac so tien muc tieu' });
    }
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: req.user.id,
        name,
        target_amount,
        saved_amount: saved_amount || 0,
        deadline: deadline || null,
      })
      .select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
}

// PUT /api/goals/:id
export async function updateGoal(req, res, next) {
  try {
    const { name, target_amount, saved_amount, deadline } = req.body;
    const { data, error } = await supabase
      .from('goals')
      .update({ name, target_amount, saved_amount, deadline: deadline || null })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

// DELETE /api/goals/:id
export async function deleteGoal(req, res, next) {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Da xoa muc tieu' });
  } catch (err) { next(err); }
}
