"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  LogIn,
  PlusCircle,
  Clock,
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  User,
  ArrowLeft,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Join Exam", href: "/join", icon: LogIn },
  { label: "Create Exam", href: "/createquiz", icon: PlusCircle },
  { label: "History", href: "/history", icon: Clock },
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-full flex-col border-r border-sidebar-border glass-light dark:glass-dark transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 px-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            M
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap overflow-hidden">
              MYSkill
            </span>
          )}
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-0.5 px-2">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const icon = <item.icon className="h-4 w-4 shrink-0" />;

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  {icon}
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{linkContent}</div>;
            })}
          </nav>
        </ScrollArea>

        {/* Bottom section */}
        <div className="mt-auto">
          <Separator className="bg-sidebar-border" />
          <div className="flex flex-col gap-1 p-2">
            {/* Login / User info */}
            {!session?.user && (
              <>
                <Link href="/signin">
                  <button
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground w-full",
                      collapsed ? "justify-center" : ""
                    )}
                  >
                    <LogIn className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Login</span>}
                  </button>
                </Link>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") window.history.back();
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground w-full",
                    collapsed ? "justify-center" : ""
                  )}
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>Go Back</span>}
                </button>
              </>
            )}
            {session?.user && (
              <div
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm",
                  collapsed ? "justify-center" : ""
                )}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium">
                  {session.user.name?.charAt(0)?.toUpperCase() || <User className="h-3.5 w-3.5" />}
                </div>
                {!collapsed && (
                  <span className="truncate text-sidebar-foreground text-xs">
                    {session.user.name || session.user.email}
                  </span>
                )}
              </div>
            )}

            {/* Logout */}
            {session && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => signOut()}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      collapsed ? "justify-center" : ""
                    )}
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Logout</span>}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" sideOffset={8}>
                    Logout
                  </TooltipContent>
                )}
              </Tooltip>
            )}

            {/* Collapse toggle */}
            <button
              onClick={onToggle}
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                collapsed ? "justify-center" : ""
              )}
            >
              {collapsed ? (
                <ChevronsRight className="h-4 w-4 shrink-0" />
              ) : (
                <>
                  <ChevronsLeft className="h-4 w-4 shrink-0" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
