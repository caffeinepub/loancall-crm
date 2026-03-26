import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DollarSign, FileText, PhoneCall, Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { ViewLead } from "../backend.d";
import CallModal from "../components/CallModal";
import LeadModal from "../components/LeadModal";
import {
  useCompleteTask,
  useGetAllLeads,
  useGetAllTasks,
  useGetCallLogs,
  useGetDashboardStats,
} from "../hooks/useQueries";
import {
  LEAD_STAGES,
  OUTCOME_COLORS,
  OUTCOME_LABELS,
  formatCurrency,
  formatDate,
  stageInfo,
  timeAgo,
} from "../types/crm";
import type { Page } from "../types/crm";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const MINI_BARS = [4, 7, 5, 9, 6, 11, 8];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: leads = [], isLoading: leadsLoading } = useGetAllLeads();
  const { data: stats } = useGetDashboardStats();
  const { data: callLogs = [] } = useGetCallLogs();
  const { data: tasks = [] } = useGetAllTasks();
  const completeTask = useCompleteTask();

  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [editLead, setEditLead] = useState<ViewLead | null>(null);
  const [callLeadOpen, setCallLeadOpen] = useState(false);
  const [callLeadId, setCallLeadId] = useState<bigint | null>(null);

  const leadsByStage = LEAD_STAGES.map((s) => ({
    ...s,
    leads: leads.filter((l) => (l.stage as string) === s.key),
  }));

  const appLeads = leads.filter((l) =>
    ["application", "approval"].includes(l.stage as string),
  );
  const pendingTasks = tasks.filter((t) => !t.completed).slice(0, 6);
  const recentCalls = [...callLogs]
    .sort((a, b) => Number(b.calledAt - a.calledAt))
    .slice(0, 5);

  const maxFunded = 500000;
  const fundedPct = stats
    ? Math.min((stats.totalFunded / maxFunded) * 100, 100)
    : 0;

  function openLogCall(lead?: ViewLead) {
    setCallLeadId(lead?.id ?? null);
    setCallLeadOpen(true);
  }

  return (
    <div className="space-y-6" data-ocid="dashboard.page">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good Morning! 👋
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Your Sales Pipeline Overview
          </p>
        </div>
        <Button
          data-ocid="dashboard.add_lead.primary_button"
          onClick={() => setAddLeadOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Lead
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            icon: Users,
            label: "Total Leads",
            value: stats
              ? Number(stats.totalLeads).toString()
              : leads.length.toString(),
            sub: "All pipeline stages",
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            icon: PhoneCall,
            label: "Calls Today",
            value: stats ? Number(stats.callsToday).toString() : "—",
            sub: "Logged this session",
            color: "text-blue-600",
            bg: "bg-blue-50",
            miniChart: true,
          },
          {
            icon: FileText,
            label: "Applications",
            value: stats
              ? Number(stats.appsSubmitted).toString()
              : appLeads.length.toString(),
            sub: "Submitted",
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            icon: DollarSign,
            label: "Total Funded",
            value: stats
              ? formatCurrency(stats.totalFunded)
              : formatCurrency(
                  leads
                    .filter((l) => (l.stage as string) === "funded")
                    .reduce((s, l) => s + l.loanAmount, 0),
                ),
            sub: `${Math.round(fundedPct)}% of $500k target`,
            color: "text-green-600",
            bg: "bg-green-50",
            progress: fundedPct,
          },
        ].map(
          (
            { icon: Icon, label, value, sub, color, bg, miniChart, progress },
            i,
          ) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              data-ocid="dashboard.kpi.card"
              className="bg-card rounded-xl p-5 shadow-card border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-2xl font-bold mt-1">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    bg,
                  )}
                >
                  <Icon className={cn("w-5 h-5", color)} />
                </div>
              </div>
              {miniChart && (
                <div className="flex items-end gap-0.5 h-8 mt-2">
                  {MINI_BARS.map((h) => (
                    <div
                      key={h}
                      className="flex-1 rounded-sm bg-blue-200"
                      style={{ height: `${(h / 12) * 100}%` }}
                    />
                  ))}
                </div>
              )}
              {progress !== undefined && (
                <Progress value={progress} className="h-1.5 mt-3" />
              )}
            </motion.div>
          ),
        )}
      </div>

      {/* Kanban */}
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">My Lead Pipeline</h2>
          <Badge variant="secondary" className="text-xs">
            {leads.length} total leads
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-4 p-4" style={{ minWidth: "1000px" }}>
            {leadsByStage.map((col) => (
              <div key={col.key} className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      col.color,
                    )}
                  >
                    {col.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {col.leads.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {leadsLoading && (
                    <>
                      <Skeleton className="h-20 rounded-lg" />
                      <Skeleton className="h-20 rounded-lg" />
                    </>
                  )}
                  {col.leads.length === 0 && !leadsLoading && (
                    <div
                      data-ocid="kanban.empty_state"
                      className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg"
                    >
                      No leads
                    </div>
                  )}
                  {col.leads.map((lead) => (
                    <button
                      type="button"
                      key={lead.id.toString()}
                      data-ocid="kanban.lead.card"
                      onClick={() => setEditLead(lead)}
                      className="w-full text-left bg-background rounded-lg border border-border p-3 hover:shadow-card hover:border-primary/30 transition-all group"
                    >
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {lead.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatCurrency(lead.loanAmount)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDate(lead.createdAt)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card rounded-xl border border-border shadow-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold">Active Applications</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary"
              data-ocid="dashboard.view_all_leads.button"
              onClick={() => onNavigate("leads")}
            >
              View All
            </Button>
          </div>
          <div className="divide-y divide-border">
            {appLeads.length === 0 && (
              <p
                data-ocid="applications.empty_state"
                className="text-sm text-muted-foreground text-center py-8"
              >
                No applications yet
              </p>
            )}
            {appLeads.slice(0, 5).map((lead, i) => {
              const info = stageInfo(lead.stage as string);
              return (
                <div
                  key={lead.id.toString()}
                  data-ocid={`applications.item.${i + 1}`}
                  className="flex items-center gap-4 px-5 py-3"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-primary">
                      {lead.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.email}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                      {formatCurrency(lead.loanAmount)}
                    </p>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                        info.color,
                      )}
                    >
                      {info.label}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-xs"
                    data-ocid={`applications.log_call.button.${i + 1}`}
                    onClick={() => openLogCall(lead)}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border shadow-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">Today's Tasks</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary"
                data-ocid="dashboard.view_tasks.button"
                onClick={() => onNavigate("tasks")}
              >
                View All
              </Button>
            </div>
            <div className="divide-y divide-border">
              {pendingTasks.length === 0 && (
                <p
                  data-ocid="tasks.empty_state"
                  className="text-xs text-muted-foreground text-center py-6"
                >
                  All tasks complete! 🎉
                </p>
              )}
              {pendingTasks.map((task, i) => (
                <div
                  key={task.id.toString()}
                  data-ocid={`tasks.item.${i + 1}`}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <Checkbox
                    data-ocid={`tasks.checkbox.${i + 1}`}
                    checked={task.completed}
                    onCheckedChange={() =>
                      !task.completed && completeTask.mutate(task.id)
                    }
                    className="shrink-0"
                  />
                  <p
                    className={cn(
                      "text-xs flex-1 leading-tight",
                      task.completed && "line-through text-muted-foreground",
                    )}
                  >
                    {task.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">Call Log Activity</h2>
            </div>
            <div className="divide-y divide-border">
              {recentCalls.length === 0 && (
                <p
                  data-ocid="calllog.empty_state"
                  className="text-xs text-muted-foreground text-center py-6"
                >
                  No calls logged yet
                </p>
              )}
              {recentCalls.map((call, i) => {
                const lead = leads.find((l) => l.id === call.leadId);
                const initials =
                  lead?.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2) ?? "?";
                return (
                  <div
                    key={`${call.leadId}-${call.calledAt}`}
                    data-ocid={`calllog.item.${i + 1}`}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-primary">
                        {initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {lead?.name ?? "Unknown"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {timeAgo(call.calledAt)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                        OUTCOME_COLORS[call.outcome as string] ??
                          "bg-gray-100 text-gray-700",
                      )}
                    >
                      {OUTCOME_LABELS[call.outcome as string] ??
                        (call.outcome as string)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <LeadModal open={addLeadOpen} onClose={() => setAddLeadOpen(false)} />
      <LeadModal
        open={!!editLead}
        onClose={() => setEditLead(null)}
        lead={editLead}
        onLogCall={(lead) => openLogCall(lead)}
      />
      <CallModal
        open={callLeadOpen}
        onClose={() => {
          setCallLeadOpen(false);
          setCallLeadId(null);
        }}
        preselectedLeadId={callLeadId}
      />
    </div>
  );
}
