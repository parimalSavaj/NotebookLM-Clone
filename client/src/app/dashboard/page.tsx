"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
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

  if (!session) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Light theme background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4ff] via-[#c8e4ff] to-[#a8d4ff] dark:hidden" />

      {/* Dark theme background */}
      <div className="absolute inset-0 hidden bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#001a3a] dark:block" />

      {/* Header */}
      <header className="relative z-50 mx-auto mt-8 flex max-w-fit items-center gap-4 rounded-2xl border border-white/20 bg-white/50 px-8 py-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-[#0d2847] dark:text-white">
          NotebookLM
        </h1>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto mt-12 max-w-4xl px-4">
        <div className="rounded-2xl border border-white/20 bg-white/60 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className="h-12 w-12 rounded-full"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold text-[#0d2847] dark:text-white">
                  Welcome, {session.user.name}
                </h2>
                <p className="text-sm text-[#0d2847]/70 dark:text-white/60">
                  {session.user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-xl border border-white/30 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-8 rounded-xl border border-dashed border-[#0d2847]/20 p-12 text-center dark:border-white/20">
            <p className="text-[#0d2847]/60 dark:text-white/50">
              Your notebooks will appear here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
