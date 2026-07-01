"use client";

/**
 * SiteHUD — Single fixed header bar that holds:
 *   LEFT  : MinimalTime  (contained — no own fixed positioning)
 *   CENTER: HeaderLogo   (contained — no own fixed positioning)
 *   RIGHT : MenuButton   (contained — no own fixed positioning)
 *
 * All three share ONE flex row with items-center → true vertical alignment.
 * The MenuButton overlay still works because its full-screen panel uses fixed inset-0 internally.
 */

import MinimalTime from "@/components/shared/MinimalTime";
import HeaderLogo from "@/components/shared/HeaderLogo";
import MenuButton from "@/components/shared/MenuButton";

export default function SiteHUD({ showTimeMobile = false }: { showTimeMobile?: boolean }) {
    return (
        <>
            {/* Gradient blur fade — sits behind everything, fades content scrolling under HUD */}
            <div
                className="fixed top-0 left-0 right-0 z-[99] pointer-events-none"
                style={{
                    height: "120px",
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.38) 50%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
                    maskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                }}
            />

            {/* HUD bar — logo, time, menu button */}
            <div
                className="
                    fixed top-0 left-0 right-0 z-[100]
                    flex items-center justify-between
                    h-20 md:h-24
                    px-5 md:px-8
                    pointer-events-none
                "
            >
                {/* LEFT — time + weather */}
                <div className="pointer-events-auto flex-1 flex items-center">
                    <MinimalTime showOnMobile={showTimeMobile} contained />
                </div>

                {/* CENTER — logo, absolutely centered so left/right widths don't affect it */}
                <div className="absolute left-0 right-0 flex justify-center pointer-events-auto">
                    <HeaderLogo contained />
                </div>

                {/* RIGHT — menu button inside the flex row for true vertical alignment */}
                <div className="pointer-events-auto flex-1 flex items-center justify-end relative z-[200]">
                    <MenuButton contained />
                </div>
            </div>
        </>
    );
}
