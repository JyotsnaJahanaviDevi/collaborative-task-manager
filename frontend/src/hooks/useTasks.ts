import useSWR from 'swr';
import type { Task } from '../types';
import { tasksAPI } from '../lib/api';

export function useTasks(filters?: { status?: string; priority?: string; sortBy?: string; teamId?: string }) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/tasks', filters],
    () => tasksAPI.getAll(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    tasks: data?.data as Task[] | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTask(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/tasks/${id}` : null,
    () => (id ? tasksAPI.getById(id) : null),
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  return {
    task: data?.data as Task | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useMyTasks() {
  const { data, error, isLoading, mutate } = useSWR(
    '/tasks/my/assigned',
    () => tasksAPI.getMyTasks(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      keepPreviousData: true,
    }
  );

  return {
    tasks: data?.data as Task[] | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCreatedTasks() {
  const { data, error, isLoading, mutate } = useSWR(
    '/tasks/my/created',
    () => tasksAPI.getCreatedTasks(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      keepPreviousData: true,
    }
  );

  return {
    tasks: data?.data as Task[] | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useOverdueTasks() {
  const { data, error, isLoading, mutate } = useSWR(
    '/tasks/overdue',
    () => tasksAPI.getOverdueTasks(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      keepPreviousData: true,
    }
  );

  return {
    tasks: data?.data as Task[] | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}
