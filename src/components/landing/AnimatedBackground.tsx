"use client";

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-secondary/10 blur-3xl animate-pulse [animation-duration:4s]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24px,rgba(120,120,120,0.06)_25px),linear-gradient(90deg,transparent_24px,rgba(120,120,120,0.06)_25px)] bg-[length:25px_25px]" />
      {/* slow rotating conic accent */}
      <div className="absolute left-1/2 top-1/2 h-[60rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(var(--tw-gradient-stops))] from-primary/10 via-transparent to-secondary/10 opacity-40 blur-3xl animate-[spin_60s_linear_infinite]" />
    </div>
  );
}
