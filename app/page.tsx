"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { AppShell } from "@/components/organisms/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, PlusCircle, BarChart3, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { data: session } = useSession();

  const quickActions = [
    { label: "Join Exam", href: "/join", icon: LogIn, description: "Enter an exam ID to participate" },
    { label: "Create Exam", href: "/createquiz", icon: PlusCircle, description: "Build a new exam with questions" },
    { label: "History", href: "/history", icon: Clock, description: "View your exam history" },
    { label: "Dashboard", href: "/dashboard", icon: BarChart3, description: "Analyze exam performance" },
  ];

  return (
    <AppShell title="Home">
      <div className="p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
            </h2>
            <p className="text-sm text-muted-foreground">
              Create exams, participate in quizzes, and get AI-powered insights.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link href={action.href}>
                <Card className="transition-colors hover:border-primary/50 cursor-pointer h-full group">
                  <CardContent className="pt-6 flex flex-col items-center gap-3 text-center">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{action.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
