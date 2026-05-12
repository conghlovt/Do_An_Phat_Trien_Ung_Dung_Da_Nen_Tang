// ============================================================
// Async Handler Utility
// Wraps async route handlers to forward errors to Express error handler.
// Without this, async errors would crash the server silently.
// ============================================================

import type { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
