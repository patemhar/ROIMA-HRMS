export type ApiResponse<T = undefined> = {
  success: boolean;
  message?: string | null;
  data?: T;
  errors?: string | null;
};
