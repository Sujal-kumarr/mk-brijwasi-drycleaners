export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function getPagination(params: PaginationParams): PaginationResult {
  const page = Math.max(1, parseInt(String(params.page || 1), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(params.limit || 20), 10) || 20));
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    page,
    limit,
  };
}
