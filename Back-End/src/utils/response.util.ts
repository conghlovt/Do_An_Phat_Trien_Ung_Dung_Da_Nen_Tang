export interface ApiResponse<T = any> {
  status: 'success' | 'error' | 'fail';
  code: number;
  message: string;
  data?: T | undefined;
}

/**
 * Standardized API Response helper
 * @param res Express Response object
 * @param code HTTP Status Code
 * @param message Response Message
 * @param data Response Data (optional)
 */
export const sendResponse = <T>(
  res: any,
  code: number,
  message: string,
  data?: T
) => {
  let status: 'success' | 'error' | 'fail' = 'success';
  if (code >= 500) status = 'error';
  else if (code >= 400) status = 'fail';

  const response: ApiResponse<T> = {
    status,
    code,
    message,
    data,
  };

  return res.status(code).json(response);
};
