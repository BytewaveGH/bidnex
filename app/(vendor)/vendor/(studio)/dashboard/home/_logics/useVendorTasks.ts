"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useAxios } from "@/hooks/use-axios";
import { useFetchData } from "@/hooks/use-fetch-data";

export type VendorTask = {
  id: string;
  title: string;
  tag: string;
  time?: string;
  completed: boolean;
};

const TASKS_KEY = "/vendor/tasks";

export function useVendorTasks() {
  const queryClient = useQueryClient();
  const callApi = useAxios();
  const result = useFetchData<{ data: unknown; status: boolean }>(TASKS_KEY);

  async function markTask(taskId: string, completed: boolean) {
    queryClient.setQueryData(
      [TASKS_KEY, undefined],
      (old: { data: unknown; status: boolean } | undefined) => {
        if (!old || !Array.isArray(old.data)) return old;
        return { ...old, data: (old.data as VendorTask[]).map((t) => (t.id === taskId ? { ...t, completed } : t)) };
      },
    );
    try {
      await callApi({ method: "PATCH", url: `/vendor/tasks/${taskId}`, data: { completed } });
    } catch {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    }
  }

  const rawTasks = result.data?.data;
  return {
    tasks: Array.isArray(rawTasks) ? (rawTasks as VendorTask[]) : null,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load tasks." : null,
    markTask,
  };
}
