import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGetUserProfile } from "../../hooks/useQueries";

export default function TopBar() {
  const { data: profile } = useGetUserProfile();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principal ? `${principal.slice(0, 8)}...` : "";
  const displayName = profile?.name ?? "Sales Rep";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-4 sticky top-0 z-20">
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="topbar.search_input"
            placeholder="Search leads, calls..."
            className="pl-9 h-9 bg-background text-sm"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          data-ocid="topbar.notifications.button"
          className="relative w-9 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center transition-colors"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-border">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
              {initials || "SR"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">{displayName}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {shortPrincipal || "Loan Officer"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
