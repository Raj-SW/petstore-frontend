import { useState, useCallback } from "react";

/**
 * Custom hook for API calls with loading and error states
 * @param {Function} apiFunc - The API function to call
 * @param {Object} options - Hook options
 * @param {boolean} options.immediate - Execute immediately on mount
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 */
const useApi = (apiFunc, options = {}) => {
  const { immediate = false, onSuccess, onError } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFunc(...args);

        setData(response);

        if (onSuccess) {
          onSuccess(response);
        }

        return response;
      } catch (err) {
        const errorMessage = err?.message || "An error occurred";
        setError(errorMessage);

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

/**
 * Hook for paginated API calls
 * @param {Function} apiFunc - The API function to call
 * @param {Object} defaultParams - Default query parameters
 */
export const usePaginatedApi = (apiFunc, defaultParams = {}) => {
  const [page, setPage] = useState(1);
  const [params, setParams] = useState(defaultParams);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const { data, loading, error, execute } = useApi(apiFunc, {
    onSuccess: (response) => {
      if (response?.pagination) {
        setTotalPages(response.pagination.pages || 0);
        setTotalItems(response.pagination.total || 0);
      }
    },
  });

  const fetchData = useCallback(
    async (pageNumber = page, newParams = params) => {
      const queryParams = {
        ...newParams,
        page: pageNumber,
      };

      return execute(queryParams);
    },
    [execute, page, params]
  );

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      fetchData(newPage);
    }
  }, [page, totalPages, fetchData]);

  const previousPage = useCallback(() => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetchData(newPage);
    }
  }, [page, fetchData]);

  const goToPage = useCallback(
    (pageNumber) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setPage(pageNumber);
        fetchData(pageNumber);
      }
    },
    [totalPages, fetchData]
  );

  const updateParams = useCallback(
    (newParams) => {
      setParams(newParams);
      setPage(1); // Reset to first page when params change
      fetchData(1, newParams);
    },
    [fetchData]
  );

  return {
    data: data?.data || [],
    loading,
    error,
    page,
    totalPages,
    totalItems,
    fetchData,
    nextPage,
    previousPage,
    goToPage,
    updateParams,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
};

export default useApi;
