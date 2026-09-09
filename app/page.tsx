"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { AppShell } from "@/components/organisms/AppShell";
import { LogIn, PlusCircle, BarChart3, Clock, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { data: session } = useSession();

  const quickActions = [
    { label: "Join Exam", href: "/join", icon: LogIn, description: "Enter an exam ID to participate", color: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-400" },
    { label: "Create Exam", href: "/createquiz", icon: PlusCircle, description: "Build a new exam with questions", color: "from-orange-500/20 to-amber-500/20", iconColor: "text-orange-400" },
    { label: "History", href: "/history", icon: Clock, description: "View your exam history", color: "from-purple-500/20 to-pink-500/20", iconColor: "text-purple-400" },
    { label: "Dashboard", href: "/dashboard", icon: BarChart3, description: "Analyze exam performance", color: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-400" },
  ];

  return (
    <AppShell title="Home">
      <div className="p-6 space-y-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl portal-card p-8 md:p-10"
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 portal-orb portal-orb-orange opacity-30 dark:opacity-60" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 portal-orb portal-orb-amber opacity-20 dark:opacity-40" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium">
              <Sparkles className="h-3 w-3" />
              AI-Powered Insights
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl">
              Create exams, participate in quizzes, and get AI-powered insights on performance.
            </p>
            <div className="flex gap-3 pt-2">
              <Link
                href="/createquiz"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl portal-btn-primary text-white text-sm font-medium"
              >
                Create Exam
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/join"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-foreground text-sm font-medium hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-colors"
              >
                Join Exam
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link href={action.href}>
                  <div className="group portal-card rounded-xl p-5 cursor-pointer h-full transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex flex-col items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">{action.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
