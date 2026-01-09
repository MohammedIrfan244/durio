"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-foreground overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center space-y-8">
        {/* Large 404 Text */}
        <h1 className="text-[10rem] md:text-[14rem] font-bold leading-none tracking-tighter text-primary/10 select-none font-[family-name:var(--font-heading)]">
          404
        </h1>

        <div className="-mt-12 md:-mt-20 flex flex-col items-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
            Page not found
          </h2>
          <p className="text-muted-foreground text-lg max-w-[500px] font-[family-name:var(--font-body)]">
            Oops! The page you are looking for has vanished into thin air. It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <Button 
            onClick={() => router.back()}
            variant="outline" 
            size="lg"
            className="w-full sm:w-auto font-[family-name:var(--font-body)]"
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Button 
            asChild 
            size="lg"
            className="w-full sm:w-auto font-[family-name:var(--font-body)]"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
