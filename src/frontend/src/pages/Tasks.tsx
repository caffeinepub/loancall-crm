import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCompleteTask,
  useCreateTask,
  useGetAllTasks,
} from "../hooks/useQueries";
import { formatDate } from "../types/crm";

export default function Tasks() {
  const { data: tasks = [] } = useGetAllTasks();
  const completeTask = useCompleteTask();
  const createTask = useCreateTask();
  const { identity } = useInternetIdentity();

  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [dueDays, setDueDays] = useState("1");

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !identity) return;
    const days = Number.parseInt(dueDays) || 1;
    const dueTime = BigInt(Date.now() + days * 86400000) * BigInt(1_000_000);
    try {
      await createTask.mutateAsync({
        title: newTitle.trim(),
        dueTime,
        assignedTo: identity.getPrincipal() as any,
      });
      toast.success("Task created");
      setNewTitle("");
      setDueDays("1");
      setAddOpen(false);
    } catch {
      toast.error("Could not create task");
    }
  }

  function handleComplete(taskId: bigint) {
    completeTask.mutate(taskId, {
      onSuccess: () => toast.success("Task completed!"),
      onError: () => toast.error("Could not update task"),
    });
  }

  return (
    <div className="space-y-5" data-ocid="tasks.page">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {pending.length} pending · {completed.length} completed
          </p>
        </div>
        <Button
          data-ocid="tasks.add_task.primary_button"
          onClick={() => setAddOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </motion.div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30">
          <p className="text-sm font-semibold">Pending ({pending.length})</p>
        </div>
        <div className="divide-y divide-border">
          {pending.length === 0 && (
            <div
              data-ocid="tasks.pending.empty_state"
              className="py-10 text-center text-muted-foreground text-sm"
            >
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-accent" />
              All tasks done! Great work.
            </div>
          )}
          <AnimatePresence>
            {pending.map((task, i) => (
              <motion.div
                key={task.id.toString()}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ delay: i * 0.04 }}
                data-ocid={`tasks.item.${i + 1}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors"
              >
                <Checkbox
                  data-ocid={`tasks.checkbox.${i + 1}`}
                  checked={task.completed}
                  onCheckedChange={() => handleComplete(task.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Due {formatDate(task.dueTime)}
                  </p>
                </div>
                <Circle className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {completed.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30">
            <p className="text-sm font-semibold text-muted-foreground">
              Completed ({completed.length})
            </p>
          </div>
          <div className="divide-y divide-border">
            {completed.map((task, i) => (
              <div
                key={task.id.toString()}
                data-ocid={`tasks.completed.item.${i + 1}`}
                className="flex items-center gap-4 px-5 py-3.5 opacity-60"
              >
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <p className="text-sm line-through text-muted-foreground flex-1">
                  {task.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="task.modal" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                data-ocid="task.input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Follow up with James Rodriguez"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due in (days)</Label>
              <Input
                id="task-due"
                data-ocid="task.due.input"
                type="number"
                min="1"
                value={dueDays}
                onChange={(e) => setDueDays(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="task.cancel_button"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="task.submit_button"
                disabled={createTask.isPending}
              >
                {createTask.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
