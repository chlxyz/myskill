"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, LogIn, ArrowLeft, ChevronsLeft, ChevronsRight } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";

interface TopBarProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function TopBar({ title, breadcrumbs, children, collapsed, onToggle }: TopBarProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 glass-dark border-b border-black/[0.08] dark:border-white/[0.06] px-4">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 px-0 shrink-0 hover:bg-black/[0.06] dark:hover:bg-black/[0.06] dark:bg-white/[0.06]"
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </Button>
        )}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-black/10 dark:text-white/10">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {title && !breadcrumbs && (
          <h1 className="text-sm font-semibold truncate tracking-tight">{title}</h1>
        )}
        {children}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-black/[0.06] dark:hover:bg-black/[0.06] dark:bg-white/[0.06]">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/10">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || <User className="h-3.5 w-3.5" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass-dark border-black/[0.08] dark:border-white/[0.08]" align="end" forceMount>
            {session?.user ? (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-black/[0.06] dark:bg-white/[0.06]" />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer focus:bg-black/[0.06] dark:bg-white/[0.06]">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-black/[0.06] dark:bg-white/[0.06]">
                  <Link href="/signin" className="flex items-center gap-2 w-full">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/[0.06] dark:bg-white/[0.06]" />
                <DropdownMenuItem onClick={() => window.history.back()} className="cursor-pointer focus:bg-black/[0.06] dark:bg-white/[0.06]">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Go Back</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
