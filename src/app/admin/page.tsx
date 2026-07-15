"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { verifyAdminStep1, verifyAdminStep2 } from "@/server/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await verifyAdminStep1(email, password);
    setLoading(false);

    if (res.success) {
      setStep(2);
    } else {
      // If fail, pretend page doesn't exist to confuse attackers
      window.location.href = "/404";
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await verifyAdminStep2(passphrase);
    setLoading(false);

    if (res.success) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      alert("Invalid passphrase.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-mono text-zinc-300">
      <div className="w-full max-w-sm space-y-8 rounded-lg border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tighter text-white">SYSTEM TERMINAL</h1>
          <p className="text-xs text-zinc-500">UNAUTHORIZED ACCESS STRICTLY PROHIBITED</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleStep1} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="ADMIN_EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-zinc-700 bg-zinc-950 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="ADMIN_PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-zinc-700 bg-zinc-950 text-white"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-zinc-200"
              disabled={loading}
            >
              {loading ? "VERIFYING..." : "INITIATE SEQUENCE"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleStep2} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-red-400">IDENTITY VERIFIED. AWAITING SECONDARY KEY.</label>
              <Input
                type="password"
                placeholder="ADMIN_SECRET_PASSPHRASE"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="border-red-900/50 bg-zinc-950 text-red-500 focus-visible:ring-red-500"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 text-white hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "DECRYPTING..." : "AUTHORIZE ACCESS"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
