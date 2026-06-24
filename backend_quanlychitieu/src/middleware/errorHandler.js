// Middleware xu ly loi tap trung
export function notFound(req, res) {
  res.status(404).json({ message: 'Khong tim thay endpoint: ' + req.originalUrl });
}

export function errorHandler(err, req, res, next) {
  console.error('[LOI]', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Loi he thong',
  });
}
