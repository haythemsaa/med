import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  };

  return res.status(statusCode).json(response);
};

export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response => {
  const totalPages = Math.ceil(total / limit);

  const response: ApiResponse<T[]> = {
    success: true,
    ...(message && { message }),
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };

  return res.status(200).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  errors?: any[]
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };

  return res.status(statusCode).json(response);
};
