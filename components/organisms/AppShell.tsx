"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  topBarExtra?: React.ReactNode;
}

export function AppShell({ children, title, breadcrumbs, topBarExtra }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Background orbs */}
        <div className="absolute top-20 right-10 w-96 h-96 portal-orb portal-orb-orange animate-glow-pulse opacity-20 dark:opacity-40" />
        <div className="absolute bottom-20 left-10 w-72 h-72 portal-orb portal-orb-amber animate-glow-pulse opacity-15 dark:opacity-30" style={{ animationDelay: "2s" }} />

        <TopBar title={title} breadcrumbs={breadcrumbs} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)}>
          {topBarExtra}
        </TopBar>
        <main className="flex-1 overflow-y-auto relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
