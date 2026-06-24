import { supabase } from '../config/supabase.js';

// GET /api/reports/summary?from=&to=
// Tra ve: tong thu, tong chi, so du, chi theo danh muc (bieu do tron),
// va dong tien theo thang (bieu do duong/cot)
export async function summary(req, res, next) {
  try {
    const { from, to } = req.query;
    let q = supabase
      .from('transactions')
      .select('*, categories(name, color, icon)')
      .eq('user_id', req.user.id);
    if (from) q = q.gte('occurred_at', from);
    if (to) q = q.lte('occurred_at', to);

    const { data: txs, error } = await q;
    if (error) throw error;

    let totalIncome = 0;
    let totalExpense = 0;
    const byCategory = {}; // chi theo danh muc
    const byMonth = {};    // dong tien theo thang

    for (const t of txs || []) {
      const amount = Number(t.amount);
      const month = String(t.occurred_at).slice(0, 7); // YYYY-MM
      if (!byMonth[month]) byMonth[month] = { month, income: 0, expense: 0 };

      if (t.type === 'income') {
        totalIncome += amount;
        byMonth[month].income += amount;
      } else {
        totalExpense += amount;
        byMonth[month].expense += amount;
        const key = t.categories?.name || 'Khac';
        if (!byCategory[key]) {
          byCategory[key] = { name: key, value: 0, color: t.categories?.color || '#94a3b8' };
        }
        byCategory[key].value += amount;
      }
    }

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: (txs || []).length,
      byCategory: Object.values(byCategory).sort((a, b) => b.value - a.value),
      byMonth: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)),
    });
  } catch (err) { next(err); }
}
