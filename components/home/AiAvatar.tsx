/**
 * Minimal "gentle AI" avatar — soft rounded shapes, warm glow halo,
 * no sharp edges. Built with pure CSS (no asset dependency).
 */
export default function AiAvatar() {
  return (
    <div className="relative select-none" aria-hidden="true">
      {/* warm light halo */}
      <div className="animate-hero-glow absolute -inset-10 rounded-full bg-gradient-to-br from-amber-200/50 via-rose-100/40 to-violet-200/50 blur-2xl" />

      {/* body sphere */}
      <div className="relative h-44 w-44 rounded-full bg-gradient-to-br from-blue-400 via-indigo-400 to-violet-400 shadow-[inset_-10px_-14px_28px_rgba(255,255,255,0.4),inset_10px_14px_28px_rgba(79,70,229,0.28)]">
        {/* soft highlight */}
        <div className="absolute left-8 top-6 h-12 w-20 -rotate-[20deg] rounded-full bg-white/45 blur-md" />
        {/* tiny blush */}
        <div className="absolute right-5 bottom-10 h-6 w-10 rounded-full bg-rose-300/40 blur-sm" />
        {/* eyes */}
        <div className="absolute left-1/2 top-[42%] flex -translate-x-1/2 gap-7">
          <div className="h-3 w-3 rounded-full bg-indigo-950/70" />
          <div className="h-3 w-3 rounded-full bg-indigo-950/70" />
        </div>
        {/* gentle smile */}
        <div className="absolute left-1/2 top-[57%] h-3.5 w-9 -translate-x-1/2 rounded-b-full border-b-[3px] border-indigo-950/50" />
      </div>
    </div>
  );
}
