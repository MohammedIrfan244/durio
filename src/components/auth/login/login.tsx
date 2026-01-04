"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import PrivacyModal from "./privacy-policy";
import { APP_NAME } from "@/lib/brand";

export default function Login() {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      {/* Privacy Modal */}
      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />

      {/* Login Card */}
      <Card className="w-[380px] shadow-lg border border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-foreground">
            Welcome to <span className="title">{APP_NAME}</span>
          </CardTitle>
          <CardDescription>
            Your plan matters. Login or create an account to get started!
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">

          {/* Google Sign-In Button */}
          {/* Google Sign-In Button */}
          <div className="flex flex-col gap-3 w-full">
            <Button
              variant="default"
              onClick={() => signIn("google")}
              className="w-full flex items-center justify-center cursor-pointer gap-2 py-2.5 shadow-sm hover:shadow transition-all"
            >
              <span className="font-medium text-primary-foreground">
                Continue with 
                 &nbsp;
                <span className="text-blue-500 font-semibold text-base">G</span>
                <span className="text-red-500 font-semibold text-base">o</span>
                <span className="text-yellow-500 font-semibold text-base">o</span>
                <span className="text-blue-500 font-semibold text-base">g</span>
                <span className="text-green-500 font-semibold text-base">l</span>
                <span className="text-red-500 font-semibold text-base -rotate- inline-block">e</span>
              </span>
            </Button>
          </div>

          {/* Policy Text */}
          <p className="text-[11px] text-muted-foreground mt-6 text-center leading-normal">
            By continuing, you agree to our{" "}
            <button
              onClick={() => setPrivacyOpen(true)}
              className="underline underline-offset-2 text-foreground hover:opacity-80 transition"
            >
              Privacy Policy
            </button>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
