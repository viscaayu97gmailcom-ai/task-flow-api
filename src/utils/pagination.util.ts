export type SortOrder = 'ASC' | 'DESC';

export interface IPaginationQuery {
  page?: number | string;
  limit?: number | string;
  sortOrder?: SortOrder | (string & {});
}

export interface INormalizedPagination {
  page: number;
  limit: number;
  skip: number;
  take: number;
  sortOrder: SortOrder;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IPaginatedResult<T> {
  items: T[];
  meta: IPaginationMeta;
}

function parsePositiveInt(
  value: number | string | undefined,
  fallback: number,
): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function normalizePaginationQuery(
  query: IPaginationQuery = {},
  defaultLimit = 10,
  maxLimit = 100,
): INormalizedPagination {
  const page = parsePositiveInt(query.page, 1);
  const rawLimit = parsePositiveInt(query.limit, defaultLimit);
  const limit = Math.min(Math.max(rawLimit, 1), maxLimit);
  const skip = (page - 1) * limit;
  const sortOrder: SortOrder =
    typeof query.sortOrder === 'string' &&
    query.sortOrder.trim().toUpperCase() === 'ASC'
      ? 'ASC'
      : 'DESC';

  return {
    page,
    limit,
    skip,
    take: limit,
    sortOrder,
  };
}

export function createPaginationMeta(
  totalItems: number,
  page: number,
  limit: number,
): IPaginationMeta {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function createPaginatedResult<T>(
  items: T[],
  totalItems: number,
  page: number,
  limit: number,
): IPaginatedResult<T> {
  return {
    items,
    meta: createPaginationMeta(totalItems, page, limit),
  };
}