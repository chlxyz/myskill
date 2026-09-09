"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  LogIn,
  PlusCircle,
  Clock,
  BarChart3,
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
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-full flex-col glass-dark border-r border-black/[0.08] dark:border-white/[0.06] transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 px-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white text-sm font-bold shadow-lg shadow-orange-500/20">
            M
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground whitespace-nowrap overflow-hidden tracking-tight">
              MYSkill
            </span>
          )}
        </div>

        <div className="portal-divider mx-3" />

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const icon = <item.icon className="h-4 w-4 shrink-0" />;

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "portal-nav-active text-orange-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
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
          <div className="portal-divider mx-3" />
          <div className="flex flex-col gap-1 p-2">
            {!session?.user && (
              <>
                <Link href="/signin">
                  <button
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04] w-full",
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
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04] w-full",
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
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm",
                  collapsed ? "justify-center" : ""
                )}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400 text-xs font-medium border border-orange-500/10">
                  {session.user.name?.charAt(0)?.toUpperCase() || <User className="h-3.5 w-3.5" />}
                </div>
                {!collapsed && (
                  <span className="truncate text-muted-foreground text-xs">
                    {session.user.name || session.user.email}
                  </span>
                )}
              </div>
            )}

            {session && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => signOut()}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04]",
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
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
