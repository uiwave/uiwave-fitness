import { useCallback, useEffect, useMemo, useState } from 'react';
import { get, errorMessage } from '../lib/apiClient';
import type { Meta, Paginated } from '../types/api';

interface UsePaginatedResult<T, M extends Meta = Meta> {
  data: T[];
  meta: M;
  loading: boolean;
  error: string;
  page: number;
  setPage: (page: number) => void;
  search: string;
  setSearch: (value: string) => void;
  filters: Record<string, unknown>;
  setFilter: (key: string, value: unknown) => void;
  clearFilters: () => void;
  reload: () => void;
}

export function usePaginated<T, M extends Meta = Meta>(
  path: string,
  options: { limit?: number } = {},
): UsePaginatedResult<T, M> {
  const limit = options.limit ?? 20;
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<M>({ total: 0, page: 1, limit } as M);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [refresh, setRefresh] = useState(0);

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const params = useMemo(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  );

  // búsqueda/filtros reinician a página 1
  useEffect(() => {
    setPage(1);
  }, [params]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    get<Paginated<T>>(path, { page, limit, ...params })
      .then((result) => {
        if (!cancelled) {
          setData(result.data);
          setMeta(result.meta as M);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path, page, limit, params, refresh]);

  const setFilter = useCallback((key: string, value: unknown) => {
    setFilters((prev) => {
      if (value === undefined || value === null || value === '') {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  const reload = useCallback(() => setRefresh((n) => n + 1), []);

  return {
    data,
    meta,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    filters,
    setFilter,
    clearFilters,
    reload,
  };
}
