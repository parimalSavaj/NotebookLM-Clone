import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Light theme background - icy blue gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4ff] via-[#c8e4ff] to-[#a8d4ff] dark:hidden" />

      {/* Dark theme background - deep navy */}
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
    </div>
  );
}
