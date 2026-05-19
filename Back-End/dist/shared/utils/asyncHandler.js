// ============================================================
// Async Handler Utility
// Wraps async route handlers to forward errors to Express error handler.
// Without this, async errors would crash the server silently.
// ============================================================
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
//# sourceMappingURL=asyncHandler.js.map