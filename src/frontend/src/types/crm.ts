export type Page = "dashboard" | "leads" | "calls" | "tasks" | "assistant";

export const LEAD_STAGES = [
  { key: "new", label: "New", color: "bg-slate-100 text-slate-700" },
  { key: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-700" },
  {
    key: "qualified",
    label: "Qualified",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    key: "application",
    label: "Application",
    color: "bg-orange-100 text-orange-700",
  },
  {
    key: "approval",
    label: "Approval",
    color: "bg-purple-100 text-purple-700",
  },
  { key: "funded", label: "Funded", color: "bg-green-100 text-green-700" },
] as const;

export type StageKey = (typeof LEAD_STAGES)[number]["key"];

export const OUTCOME_LABELS: Record<string, string> = {
  noAnswer: "No Answer",
  callBack: "Call Back",
  notInterested: "Not Interested",
  interested: "Interested",
};

export const OUTCOME_COLORS: Record<string, string> = {
  noAnswer: "bg-gray-100 text-gray-700",
  callBack: "bg-yellow-100 text-yellow-700",
  notInterested: "bg-red-100 text-red-700",
  interested: "bg-green-100 text-green-700",
};

export function stageInfo(stage: string) {
  return LEAD_STAGES.find((s) => s.key === stage) ?? LEAD_STAGES[0];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(seconds: bigint): string {
  const s = Number(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m === 0) return `${rem}s`;
  return `${m}m ${rem}s`;
}

export function timeAgo(nanos: bigint): string {
  const ms = Number(nanos / BigInt(1_000_000));
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDate(nanos: bigint): string {
  const ms = Number(nanos / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
