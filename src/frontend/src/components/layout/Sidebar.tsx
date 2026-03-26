import { cn } from "@/lib/utils";
import {
  Bot,
  Building2,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Phone,
  Settings,
  Users,
} from "lucide-react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import type { Page } from "../../types/crm";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: {
  icon: React.ComponentType<any>;
  label: string;
  page: Page;
}[] = [
  { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
  { icon: Users, label: "Leads", page: "leads" },
  { icon: Phone, label: "Calls", page: "calls" },
  { icon: CheckSquare, label: "Tasks", page: "tasks" },
  { icon: Bot, label: "AI Assistant", page: "assistant" },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { clear } = useInternetIdentity();

  return (
    <aside
      className="fixed inset-y-0 left-0 w-60 flex flex-col z-30"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.34 0.07 206) 0%, oklch(0.26 0.055 206) 100%)",
      }}
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-[15px] tracking-tight">
          LoanCall CRM
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2 mt-1">
          Main Menu
        </p>
        {NAV_ITEMS.map(({ icon: Icon, label, page }) => {
          const active = currentPage === page;
          return (
            <button
              type="button"
              key={page}
              data-ocid={`nav.${page}.link`}
              onClick={() => onNavigate(page)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-white/20 text-white"
                  : "text-white/65 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
              )}
            </button>
          );
        })}

        <div className="pt-3 mt-3 border-t border-sidebar-border">
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
            System
          </p>
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 cursor-not-allowed"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </nav>

      <div className="px-3 pb-5">
        <button
          type="button"
          data-ocid="nav.logout.button"
          onClick={clear}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
