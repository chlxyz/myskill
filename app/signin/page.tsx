"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

type Mode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mode, setMode] = useState<Mode>("login");
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (session?.user) {
    router.push("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        username: loginData.username,
        password: loginData.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.email || !registerData.username || !registerData.password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post("/api/signup", registerData);
      if (res.status === 201) {
        setSuccess("Account created! Signing you in...");
        const result = await signIn("credentials", {
          username: registerData.email,
          password: registerData.password,
          redirect: false,
        });
        if (!result?.error) {
          router.push("/");
        } else {
          setMode("login");
          setLoginData({ username: registerData.email, password: registerData.password });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 portal-orb portal-orb-orange opacity-20 dark:opacity-50 animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 portal-orb portal-orb-amber opacity-15 dark:opacity-40 animate-glow-pulse" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/[0.02] dark:bg-orange-500/[0.03] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight">MYSkill</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Welcome back" : "Get started in seconds"}
          </p>
        </div>

        {/* Glass card */}
        <div className="portal-card rounded-2xl p-8 shadow-xl dark:shadow-2xl dark:shadow-black/20">
          {/* Mode switcher */}
          <div className="flex rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.06] p-1 mb-6">
            <button
              onClick={() => switchMode("login")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === "login"
                  ? "bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-400 shadow-sm border border-orange-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode("register")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === "register"
                  ? "bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-400 shadow-sm border border-orange-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>

          {/* Error / Success */}
          <AnimatePresence mode="wait">
            {(error || success) && (
              <motion.div
                key={error || success}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 text-sm text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    {success}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm text-muted-foreground">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    required
                    className="h-11 rounded-xl portal-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm text-muted-foreground">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="h-11 rounded-xl portal-input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl portal-btn-primary text-white font-medium border-0"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-sm text-muted-foreground">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    className="h-11 rounded-xl portal-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-username" className="text-sm text-muted-foreground">Username</Label>
                  <Input
                    id="reg-username"
                    type="text"
                    placeholder="johndoe"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                    className="h-11 rounded-xl portal-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-sm text-muted-foreground">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    className="h-11 rounded-xl portal-input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl portal-btn-primary text-white font-medium border-0"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          {mode === "login"
            ? "Don't have an account? Click Register above."
            : "Already have an account? Click Sign In above."}
        </p>
      </motion.div>
    </div>
  );
}
