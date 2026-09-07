"use client";

import { AppShell } from "@/components/organisms/AppShell";
import { ExamForm } from "@/components/organisms/ExamForm";
import { motion } from "framer-motion";

export default function CreateQuizPage() {
  return (
    <AppShell
      title="Create Exam"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Create Exam" }]}
    >
      <div className="p-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ExamForm />
        </motion.div>
      </div>
    </AppShell>
  );
}
