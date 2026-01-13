export interface ApiResponse<T = null> {
  code: number;
  message: string;
  success: boolean;
  result: T;
}

export function successResponse<T>(
  data: T,
  message: string = '成功',
  code: number = 200,
): ApiResponse<T> {
  return {
    code,
    message,
    success: true,
    result: data,
  };
}

export function errorResponse(
  message: string = '失败',
  code: number = 400,
): ApiResponse<null> {
  return {
    code,
    message,
    success: false,
    result: null,
  };
}
