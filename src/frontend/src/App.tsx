import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AppLayout from "./components/layout/AppLayout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import Assistant from "./pages/Assistant";
import Calls from "./pages/Calls";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LoginPage from "./pages/LoginPage";
import Tasks from "./pages/Tasks";
import type { Page } from "./types/crm";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="space-y-3 w-48">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  if (isInitializing) return <LoadingScreen />;
  if (!identity) return <LoginPage />;

  return (
    <>
      <Toaster richColors position="top-right" />
      <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {currentPage === "dashboard" && (
          <Dashboard onNavigate={setCurrentPage} />
        )}
        {currentPage === "leads" && <Leads />}
        {currentPage === "calls" && <Calls />}
        {currentPage === "tasks" && <Tasks />}
        {currentPage === "assistant" && <Assistant />}
      </AppLayout>
    </>
  );
}
