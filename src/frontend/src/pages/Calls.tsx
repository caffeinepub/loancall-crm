import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Plus, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import CallModal from "../components/CallModal";
import { useGetAllLeads, useGetCallLogs } from "../hooks/useQueries";
import {
  OUTCOME_COLORS,
  OUTCOME_LABELS,
  formatDuration,
  timeAgo,
} from "../types/crm";

const SKELETON_ROWS = ["r1", "r2", "r3", "r4", "r5"] as const;
const SKELETON_COLS = ["a", "b", "c", "d", "e"] as const;

export default function Calls() {
  const { data: callLogs = [], isLoading } = useGetCallLogs();
  const { data: leads = [] } = useGetAllLeads();
  const [logOpen, setLogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const leadsById = new Map(leads.map((l) => [l.id.toString(), l]));

  const sorted = [...callLogs].sort((a, b) => Number(b.calledAt - a.calledAt));
  const filtered = sorted.filter((c) => {
    if (!search) return true;
    const lead = leadsById.get(c.leadId.toString());
    return (
      lead?.name.toLowerCase().includes(search.toLowerCase()) ||
      OUTCOME_LABELS[c.outcome as string]
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      c.notes.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-5" data-ocid="calls.page">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Call Log</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {callLogs.length} calls recorded
          </p>
        </div>
        <Button
          data-ocid="calls.log_call.primary_button"
          onClick={() => setLogOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Log Call
        </Button>
      </motion.div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="calls.search_input"
          placeholder="Search calls..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Lead</TableHead>
              <TableHead className="font-semibold">Outcome</TableHead>
              <TableHead className="font-semibold">Duration</TableHead>
              <TableHead className="font-semibold">Notes</TableHead>
              <TableHead className="font-semibold">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              SKELETON_ROWS.map((rowKey) => (
                <TableRow key={rowKey}>
                  {SKELETON_COLS.map((colKey) => (
                    <TableCell key={colKey}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="calls.empty_state"
                >
                  No calls logged yet. Click "Log Call" to get started.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((call, i) => {
              const lead = leadsById.get(call.leadId.toString());
              return (
                <TableRow
                  key={`${call.leadId}-${call.calledAt}`}
                  data-ocid={`calls.item.${i + 1}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-semibold text-primary">
                          {lead?.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2) ?? "?"}
                        </span>
                      </div>
                      <span className="font-medium text-sm">
                        {lead?.name ?? `Lead #${call.leadId}`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        OUTCOME_COLORS[call.outcome as string] ??
                          "bg-gray-100 text-gray-700",
                      )}
                    >
                      {OUTCOME_LABELS[call.outcome as string] ??
                        (call.outcome as string)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDuration(call.duration)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    <p className="truncate">{call.notes || "—"}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {timeAgo(call.calledAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <CallModal open={logOpen} onClose={() => setLogOpen(false)} />
    </div>
  );
}
