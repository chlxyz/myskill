"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/atoms/Logo";
import { motion } from "framer-motion";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username || !password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/signup", { email, username, password });
      if (res.status === 201) router.push("/signin");
      else setError(res.data.error || "Registration failed");
    } catch (err: any) {
      setError(err.response?.data?.error || "Internal server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 portal-orb portal-orb-orange opacity-50 animate-glow-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 portal-orb portal-orb-amber opacity-40 animate-glow-pulse" style={{ animationDelay: "2s" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6 relative z-10"
      >
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="portal-card rounded-2xl p-8 shadow-2xl shadow-black/20">
          <div className="text-center mb-6">
            <h1 className="text-lg font-semibold tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground mt-1">Get started with MYSkill</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl portal-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-muted-foreground">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 rounded-xl portal-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl portal-input"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-xl portal-btn-primary text-white font-medium border-0"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="text-orange-400 hover:text-orange-300 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
