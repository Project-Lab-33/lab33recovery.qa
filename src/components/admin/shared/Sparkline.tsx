"use client";

export interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    fillColor?: string;
}

export function Sparkline({ data, width = 280, height = 80, color = "var(--accent-gold)", fillColor }: SparklineProps) {
    if (data.length < 2) return null;
    const max = Math.max(...data) || 1;
    const min = Math.min(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 8) - 4}`);
    const line = `M ${pts.join(' L ')}`;
    const fill = `M 0,${height} L ${pts.join(' L ')} L ${width},${height} Z`;
    return (
        <svg width={width} height={height} className="block">
            {fillColor && <path d={fill} fill={fillColor} opacity={0.15} />}
            <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
