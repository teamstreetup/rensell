function notFoundMiddleware(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorMiddleware(err, req, res, _next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Multer file upload errors
  if (err && err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: err.message || 'File upload error' });
  }

  // Mongoose validation error
  if (err && err.name === 'ValidationError') {
    const firstMsg = Object.values(err.errors || {})[0]?.message || 'Validation failed';
    return res.status(400).json({ error: firstMsg });
  }

  // Mongoose invalid ObjectId
  if (err && err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid resource ID format' });
  }

  // Duplicate key error
  if (err && err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate record already exists' });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && err.details ? { details: err.details } : {}),
  });
}

module.exports = { notFoundMiddleware, errorMiddleware };
