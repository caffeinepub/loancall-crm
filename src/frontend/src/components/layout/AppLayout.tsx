import type { ReactNode } from "react";
import { useSeeder } from "../../hooks/useSeeder";
import type { Page } from "../../types/crm";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface AppLayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}

export default function AppLayout({
  currentPage,
  onNavigate,
  children,
}: AppLayoutProps) {
  useSeeder();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">{children}</main>
        <footer className="px-6 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LoanCall CRM. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
