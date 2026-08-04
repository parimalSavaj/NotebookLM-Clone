"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { signIn, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  if (isPending) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4ff] via-[#c8e4ff] to-[#a8d4ff] dark:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#001a3a] dark:block" />
        <div className="relative z-10 text-[#0d2847] dark:text-white">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Light theme background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4ff] via-[#c8e4ff] to-[#a8d4ff] dark:hidden" />

      {/* Dark theme background */}
      <div className="absolute inset-0 hidden bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#001a3a] dark:block" />

      {/* Decorative flowing curves - light */}
      <div className="absolute inset-0 dark:hidden">
        <div className="absolute -right-1/4 -top-1/4 h-[70%] w-[70%] rounded-full bg-gradient-to-bl from-blue-300/40 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[60%] w-[60%] rounded-full bg-gradient-to-tr from-blue-200/50 to-transparent blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-[40%] w-[40%] rounded-full bg-gradient-to-b from-sky-200/30 to-transparent blur-2xl" />
      </div>

      {/* Decorative flowing curves - dark */}
      <div className="absolute inset-0 hidden dark:block">
        <div className="absolute -bottom-1/4 -left-1/4 h-[80%] w-[80%] rounded-full bg-gradient-to-tr from-blue-600/30 to-transparent blur-3xl" />
        <div className="absolute -right-1/4 -top-1/4 h-[60%] w-[60%] rounded-full bg-gradient-to-bl from-blue-500/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[40%] w-[50%] rounded-full bg-gradient-to-t from-blue-700/15 to-transparent blur-2xl" />
      </div>

      {/* Glass header */}
      <header className="relative z-50 mx-auto mt-8 flex max-w-fit items-center gap-4 rounded-2xl border border-white/20 bg-white/50 px-8 py-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-[#0d2847] dark:text-white">
          NotebookLM
        </h1>
        <ThemeToggle />
      </header>

      {/* Sign in card */}
      <main className="relative z-10 flex min-h-[calc(100vh-140px)] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/60 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-[#0d2847] dark:text-white">
              Welcome to NotebookLM
            </h2>
            <p className="mt-2 text-sm text-[#0d2847]/70 dark:text-white/60">
              Sign in to get started with your notebooks
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/30 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </main>
    </div>
  );
}
