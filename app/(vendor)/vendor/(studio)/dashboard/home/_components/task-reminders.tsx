"use client";

import { ArrowRight, Calendar1 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

import { ClassSchedule } from "../../academy/_components/class-schedule";
import { useVendorTasks } from "../_logics/useVendorTasks";

export function TaskReminders() {
  const { tasks, isLoading, error, markTask } = useVendorTasks();

  return (
    <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="min-w-0 overflow-hidden rounded-xl border bg-background shadow-xs">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-sm">Today's Tasks</CardTitle>
          <CardAction className="flex items-center gap-1 text-muted-foreground text-xs">
            View All Tasks <ArrowRight className="size-4" />
          </CardAction>
        </CardHeader>
        <div className="divide-y">
          {isLoading ? (
            Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-2 p-4">
                <Skeleton className="size-4 rounded" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))
          ) : error ? (
            <p className="p-4 text-muted-foreground text-sm">{error}</p>
          ) : tasks?.length ? (
            tasks.map((task) => (
              <div key={task.id} className="flex min-w-0 items-start gap-2 p-4">
                <Checkbox
                  checked={task.completed}
                  aria-label={task.title}
                  className="mt-0.5 shrink-0"
                  onCheckedChange={(checked) => {
                    void markTask(task.id, checked === true);
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-2">
                    {task.tag ? (
                      <Badge variant="outline" className="max-w-full truncate px-2 py-0.5 font-normal text-xs">
                        {task.tag}
                      </Badge>
                    ) : null}
                    {task.time ? (
                      <span className="flex min-w-0 items-center gap-1 text-muted-foreground text-xs">
                        <Calendar1 className="size-3.5 shrink-0" />
                        <span className="truncate">{task.time}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-muted-foreground text-sm">No tasks for today.</p>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <ClassSchedule />
      </div>
    </section>
  );
}
