import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Pencil, PhoneCall, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ViewLead } from "../backend.d";
import CallModal from "../components/CallModal";
import LeadModal from "../components/LeadModal";
import { useDeleteLead, useGetAllLeads } from "../hooks/useQueries";
import {
  LEAD_STAGES,
  formatCurrency,
  formatDate,
  stageInfo,
} from "../types/crm";

const SKELETON_COLS = ["a", "b", "c", "d", "e", "f", "g"] as const;
const SKELETON_ROWS = ["r1", "r2", "r3", "r4", "r5"] as const;

export default function Leads() {
  const { data: leads = [], isLoading } = useGetAllLeads();
  const deleteLead = useDeleteLead();

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editLead, setEditLead] = useState<ViewLead | null>(null);
  const [callLead, setCallLead] = useState<ViewLead | null>(null);

  const filtered = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search);
    const matchStage =
      stageFilter === "all" || (l.stage as string) === stageFilter;
    return matchSearch && matchStage;
  });

  async function handleDelete(lead: ViewLead) {
    if (!confirm(`Delete lead "${lead.name}"?`)) return;
    try {
      await deleteLead.mutateAsync(lead.id);
      toast.success("Lead deleted");
    } catch {
      toast.error("Could not delete lead");
    }
  }

  return (
    <div className="space-y-5" data-ocid="leads.page">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {leads.length} total leads in pipeline
          </p>
        </div>
        <Button
          data-ocid="leads.add_lead.primary_button"
          onClick={() => setAddOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Lead
        </Button>
      </motion.div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="leads.search_input"
            placeholder="Search by name, email, phone..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger data-ocid="leads.stage_filter.select" className="w-40">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {LEAD_STAGES.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Loan Amount</TableHead>
              <TableHead className="font-semibold">Stage</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="w-24" />
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
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="leads.empty_state"
                >
                  No leads found
                </TableCell>
              </TableRow>
            )}
            {filtered.map((lead, i) => {
              const info = stageInfo(lead.stage as string);
              return (
                <TableRow
                  key={lead.id.toString()}
                  data-ocid={`leads.item.${i + 1}`}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {lead.phone}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {lead.email}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(lead.loanAmount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        info.color,
                      )}
                    >
                      {info.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7"
                        data-ocid={`leads.log_call.button.${i + 1}`}
                        onClick={() => setCallLead(lead)}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7"
                        data-ocid={`leads.edit_button.${i + 1}`}
                        onClick={() => setEditLead(lead)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-destructive hover:text-destructive"
                        data-ocid={`leads.delete_button.${i + 1}`}
                        onClick={() => handleDelete(lead)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <LeadModal open={addOpen} onClose={() => setAddOpen(false)} />
      <LeadModal
        open={!!editLead}
        onClose={() => setEditLead(null)}
        lead={editLead}
        onLogCall={(lead) => {
          setEditLead(null);
          setCallLead(lead);
        }}
      />
      <CallModal
        open={!!callLead}
        onClose={() => setCallLead(null)}
        preselectedLeadId={callLead?.id ?? null}
      />
    </div>
  );
}
