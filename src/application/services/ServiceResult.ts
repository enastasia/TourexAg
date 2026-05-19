export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const successResult = <T>(data: T): ServiceResult<T> => ({
  success: true,
  data,
});

export const failureResult = <T = never>(error: string): ServiceResult<T> => ({
  success: false,
  error,
});
