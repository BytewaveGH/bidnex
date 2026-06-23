"use client";

import { useMemo } from "react";
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

type VendorTaskApiItem = {
  id?: string | number;
  title?: string;
  tag?: string;
  category?: string;
  label?: string;
  time?: string;
  dueTime?: string;
  dueAt?: string;
  completed?: boolean;
  isCompleted?: boolean;
};

const TASKS_KEY = "/vendor/tasks";

function formatTaskTime(value?: string) {
  if (!value) return undefined;
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(date);
  } catch {
    return value;
  }
}

function mapTask(item: VendorTaskApiItem): VendorTask {
  return {
    id: String(item.id ?? ""),
    title: item.title ?? "Untitled task",
    tag: item.tag ?? item.category ?? item.label ?? "",
    time: formatTaskTime(item.time ?? item.dueTime ?? item.dueAt),
    completed: item.completed ?? item.isCompleted ?? false,
  };
}

function normalizeTasks(raw: unknown): VendorTask[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => mapTask(item as VendorTaskApiItem));
  }
  return [];
}

export function useVendorTasks() {
  const queryClient = useQueryClient();
  const callApi = useAxios();
  const result = useFetchData<{ data: unknown; status: boolean }>(TASKS_KEY);

  const tasks = useMemo(() => normalizeTasks(result.data?.data), [result.data?.data]);

  async function markTask(taskId: string, completed: boolean) {
    queryClient.setQueryData([TASKS_KEY, undefined], (old: { data: unknown; status: boolean } | undefined) => {
      if (!old) return old;
      const current = normalizeTasks(old.data);
      return { ...old, data: current.map((t) => (t.id === taskId ? { ...t, completed } : t)) };
    });
    try {
      await callApi({ method: "PATCH", url: `/vendor/tasks/${taskId}`, data: { completed } });
    } catch {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    }
  }

  return {
    tasks: tasks.length ? tasks : result.isLoading ? null : [],
    isLoading: result.isLoading,
    error: result.error ? "Failed to load tasks." : null,
    markTask,
  };
}
