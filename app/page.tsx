import Link from "next/link";

function KLinePreview() {
  const candles = [
    { x: 18, open: 52, close: 68, high: 72, low: 48, up: true },
    { x: 44, open: 68, close: 45, high: 70, low: 42, up: false },
    { x: 70, open: 45, close: 58, high: 62, low: 40, up: true },
    { x: 96, open: 58, close: 48, high: 60, low: 44, up: false },
    { x: 122, open: 48, close: 72, high: 76, low: 46, up: true },
  ];
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]">
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(63 63 70) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(63 63 70) 1px, transparent 1px)
          `,
          backgroundSize: "20px 16px",
        }}
      />
      <div className="relative flex items-center justify-between border-b border-zinc-800/80 px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          MOOD · 1D
        </span>
        <span className="font-mono text-[10px] text-emerald-400/90">
          +2.4% 今日
        </span>
      </div>
      <svg
        viewBox="0 0 160 100"
        className="relative block h-40 w-full text-emerald-400"
        aria-hidden
      >
        {candles.map((c, i) => {
          const top = Math.min(c.open, c.close);
          const bottom = Math.max(c.open, c.close);
          const bodyH = Math.max(bottom - top, 2);
          const color = c.up ? "#34d399" : "#fb7185";
          return (
            <g key={i}>
              <line
                x1={c.x}
                x2={c.x}
                y1={100 - c.high}
                y2={100 - c.low}
                stroke={color}
                strokeWidth="1.2"
                opacity="0.85"
              />
              <rect
                x={c.x - 5}
                y={100 - top - bodyH}
                width="10"
                height={bodyH}
                fill={color}
                opacity="0.92"
                rx="0.5"
              />
            </g>
          );
        })}
      </svg>
      <div className="relative border-t border-zinc-800/80 px-4 py-2">
        <p className="font-mono text-[10px] leading-relaxed text-zinc-600">
          O·H·L·C 映射为情绪起落 — 复盘如读盘
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-5 py-16 sm:px-8 lg:px-10">
        <main className="grid flex-1 items-center gap-12 lg:grid-cols-[1fr_min(380px,100%)] lg:gap-16">
          <div className="flex flex-col gap-8">
            <header className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                Emotional Candle Journal
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
                情绪K线日记
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                用 K 线记录一天的状态，用日记复盘自己
              </p>
            </header>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/record"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                开始记录今天
              </Link>
              <Link
                href="/history"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                查看历史复盘
              </Link>
            </div>
          </div>
          <aside className="lg:justify-self-end">
            <KLinePreview />
          </aside>
        </main>
      </div>
    </div>
  );
}
