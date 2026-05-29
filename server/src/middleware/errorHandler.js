export function notFoundHandler(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (error.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors.map((item) => ({ path: item.path.join('.'), message: item.message }))
    });
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'production' ? {} : { stack: error.stack })
  });
}
