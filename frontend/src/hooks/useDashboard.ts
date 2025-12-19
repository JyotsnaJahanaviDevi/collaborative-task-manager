import useSWR from 'swr';
import { tasksAPI } from '../lib/api';

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR(
    '/tasks/dashboard',
    async () => {
      const response = await tasksAPI.getAll({ sortBy: 'dueDate' });
      return response;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      keepPreviousData: true,
    }
  );

  return {
    dashboard: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}
