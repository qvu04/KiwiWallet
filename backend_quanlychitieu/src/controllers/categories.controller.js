import { supabase } from '../config/supabase.js';

// GET /api/categories
export async function listCategories(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

// POST /api/categories
export async function createCategory(req, res, next) {
  try {
    const { name, type, icon, color } = req.body;
    if (!name || !type) {
      return res.status(400).json({ message: 'Thieu ten hoac loai danh muc' });
    }
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: req.user.id, name, type, icon, color })
      .select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
}

// PUT /api/categories/:id
export async function updateCategory(req, res, next) {
  try {
    const { name, type, icon, color } = req.body;
    const { data, error } = await supabase
      .from('categories')
      .update({ name, type, icon, color })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

// DELETE /api/categories/:id
export async function deleteCategory(req, res, next) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Da xoa danh muc' });
  } catch (err) { next(err); }
}
