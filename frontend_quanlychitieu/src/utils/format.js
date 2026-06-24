// Dinh dang tien te VND
export function formatVND(value) {
  const n = Number(value || 0);
  return n.toLocaleString('vi-VN') + ' đ';
}

// Dinh dang ngay dd/mm/yyyy
export function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleDateString('vi-VN');
}

// Ngay hom nay dang YYYY-MM-DD (cho input type=date)
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Ngay dau thang hien tai
export function firstDayOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
