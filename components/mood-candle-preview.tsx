function yFromVal(v: number) {
  const clamped = Math.min(10, Math.max(1, v));
  return 92 - ((clamped - 1) / 9) * 84;
}

export type MoodCandlePreviewProps = {
  open: number;
  high: number;
  low: number;
  close: number;
  /** 左侧行情条文案，默认 TODAY · 1D */
  chartLabel?: string;
  /** 历史列表等场景可收窄图表高度 */
  compact?: boolean;
  /** 为 false 时不展示底部说明条 */
  showFooter?: boolean;
};

export function MoodCandlePreview({
  open,
  high,
  low,
  close,
  chartLabel = "TODAY · 1D",
  compact = false,
  showFooter = true,
}: MoodCandlePreviewProps) {
  const yO = yFromVal(open);
  const yC = yFromVal(close);
  const yH = yFromVal(high);
  const yL = yFromVal(low);
  const bodyTop = Math.min(yO, yC);
  const bodyBottom = Math.max(yO, yC);
  const bodyH = Math.max(bodyBottom - bodyTop, 1.5);
  const up = close >= open;
  const color = up ? "#34d399" : "#fb7185";

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(63 63 70) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(63 63 70) 1px, transparent 1px)
          `,
          backgroundSize: "14px 14px",
        }}
      />
      <div className="relative flex items-center justify-between border-b border-zinc-800/80 px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {chartLabel}
        </span>
        <span className="font-mono text-[10px] text-zinc-500">
          O {open} · H {high} · L {low} · C {close}
        </span>
      </div>
      <svg
        viewBox="0 0 100 100"
        className={`relative block w-full ${compact ? "h-28" : "h-44"}`}
        aria-hidden
      >
        <line
          x1={50}
          x2={50}
          y1={yH}
          y2={yL}
          stroke={color}
          strokeWidth="1.2"
          opacity={0.85}
        />
        <rect
          x={40}
          y={bodyTop}
          width={20}
          height={bodyH}
          fill={color}
          opacity={0.92}
          rx={0.5}
        />
      </svg>
      {showFooter ? (
        <div className="relative border-t border-zinc-800/80 px-4 py-2">
          <p className="font-mono text-[10px] leading-relaxed text-zinc-600">
            预览随滑块更新 · 保存功能后续接入
          </p>
        </div>
      ) : null}
    </div>
  );
}
