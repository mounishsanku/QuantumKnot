/**
 * Middleware to handle 404 Not Found errors
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handling middleware
 * Returns structured JSON: { success: false, message, statusCode }
 */
export const errorHandler = (err, req, res, next) => {
  // If status code is 200, default to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error for server-side debugging
  console.error(`[Error] ${err.stack || err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message,
    statusCode,
    // Include stack trace only in non-production environments
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
