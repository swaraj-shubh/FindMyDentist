export type ApiResult<T> = { data: T } | { error: string; issues?: Record<string, string[]> };
