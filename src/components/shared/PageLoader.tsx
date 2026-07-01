// Pure CSS — no Framer Motion dependency, safe in server components and loading.tsx routes
export function PageLoader() {
    return (
        <div className="h-[100dvh] w-full flex items-center justify-center bg-[#050505]">
            {/* Ambient Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#D4AF77]/5 blur-[100px] rounded-full" />
            </div>

            {/* Loading Indicator */}
            <div className="relative flex flex-col items-center gap-8 z-10">
                {/* Gold Pulse Ring */}
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border border-[#D4AF77]/20 animate-ping" />
                    <div className="absolute inset-1 rounded-full border border-[#D4AF77]/40 animate-pulse" />
                    <div className="absolute inset-3 rounded-full bg-[#D4AF77]/10" />
                </div>

                {/* Loading Text */}
                <div className="flex flex-col items-center gap-2">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF77]/40 to-transparent" />
                    <span className="text-[9px] font-sans tracking-[0.6em] text-[#D4AF77]/60 uppercase animate-pulse">
                        Loading
                    </span>
                </div>
            </div>
        </div>
    );
}
