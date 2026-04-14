export type EntityId = string;

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface ServiceResult<T> {
  data: T;
  message?: string;
}
