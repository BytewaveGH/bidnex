"use client";

import { ArrowRight, Calendar1 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

import { ClassSchedule } from "../../academy/_components/class-schedule";
import { useVendorTasks } from "../_logics/useVendorTasks";

export function TaskReminders() {
  const { tasks, isLoading, markTask } = useVendorTasks();

  return (
    <section className="flex gap-4">
      <div className="overflow-hidden rounded-xl border bg-background flex-1 shadow-xs">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-sm">Today's Tasks</CardTitle>
          <CardAction className="flex items-center gap-1 text-muted-foreground text-xs">
            View All Tasks <ArrowRight className="size-4" />
          </CardAction>
        </CardHeader>
        <div className="divide-y">
          {isLoading
            ? Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-2 p-4">
                  <Skeleton className="size-4 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))
            : (tasks ?? []).map((task) => (
                <div key={task.id} className="flex items-center gap-2 p-4">
                  <Checkbox
                    checked={task.completed}
                    aria-label={task.title}
                    onCheckedChange={(checked) => {
                      void markTask(task.id, checked === true);
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
                        <span className={`truncate text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </span>
                        <Badge variant="outline" className="px-3 py-1 font-normal">
                          {task.tag}
                        </Badge>
                      </div>
                      {task.time && (
                        <div className="flex shrink-0 items-center gap-3 text-muted-foreground text-sm">
                          <span>{task.time}</span>
                          <Calendar1 className="size-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      <div className="w-[38%] shrink-0">
        <ClassSchedule />
      </div>
    </section>
  );
}
