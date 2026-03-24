"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MoodCandlePreview } from "@/components/mood-candle-preview";
import {
  getLocalDateKey,
  loadTodayRecord,
  upsertTodayRecord,
} from "@/lib/diary-storage";

const OHLC_FIELDS = [
  {
    key: "open" as const,
    label: "开盘",
    hint: "起床时状态",
  },
  {
    key: "high" as const,
    label: "最高",
    hint: "今天最好时刻",
  },
  {
    key: "low" as const,
    label: "最低",
    hint: "今天最差时刻",
  },
  {
    key: "close" as const,
    label: "收盘",
    hint: "睡前整体状态",
  },
];

type OhlcState = Record<(typeof OHLC_FIELDS)[number]["key"], number>;

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none ring-emerald-500/30 transition-shadow focus:border-zinc-600 focus:ring-2";

const labelClass = "font-mono text-[11px] uppercase tracking-wider text-zinc-500";

export default function RecordPage() {
  const [ohlc, setOhlc] = useState<OhlcState>({
    open: 5,
    high: 7,
    low: 4,
    close: 6,
  });
  const [diaryTitle, setDiaryTitle] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [body, setBody] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    try {
      const existing = loadTodayRecord();
      if (!existing) return;
      setOhlc({
        open: existing.open,
        high: existing.high,
        low: existing.low,
        close: existing.close,
      });
      setDiaryTitle(existing.title);
      setOneLiner(existing.summary);
      setBody(existing.content);
      setTagsRaw(existing.tags);
    } catch {
      /* 存储不可用或数据异常时不阻断页面 */
    }
  }, []);

  function setField(key: keyof OhlcState, value: number) {
    setOhlc((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const date = getLocalDateKey();
    const normalizedTitle = diaryTitle.trim();
    const normalizedSummary = oneLiner.trim();
    const normalizedContent = body.trim();
    const normalizedTags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(", ");
    upsertTodayRecord({
      date,
      open: ohlc.open,
      high: ohlc.high,
      low: ohlc.low,
      close: ohlc.close,
      title: normalizedTitle,
      summary: normalizedSummary,
      content: normalizedContent,
      tags: normalizedTags,
    });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2600);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-10">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={labelClass}>Record · Today</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              记录今天
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-400">
              用开盘、最高、最低、收盘记录今天的状态
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
          >
            ← 返回首页
          </Link>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1fr_min(360px,100%)] lg:items-start lg:gap-12">
          <div className="space-y-10">
            <section className="space-y-6">
              <h2 className="text-sm font-medium text-zinc-300">情绪 OHLC（1–10）</h2>
              <ul className="space-y-6">
                {OHLC_FIELDS.map(({ key, label, hint }) => (
                  <li key={key}>
                    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <span className="text-sm font-medium text-zinc-200">{label}</span>
                        <span className="ml-2 text-xs text-zinc-500">{hint}</span>
                      </div>
                      <span className="font-mono text-sm tabular-nums text-emerald-400/90">
                        {ohlc[key]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={ohlc[key]}
                      onChange={(e) => setField(key, Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-emerald-500"
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-medium text-zinc-300">日记</h2>
              <div className="space-y-4">
                <div>
                  <label className={`mb-1.5 block ${labelClass}`}>标题</label>
                  <input
                    type="text"
                    value={diaryTitle}
                    onChange={(e) => setDiaryTitle(e.target.value)}
                    placeholder="给今天起个标题"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`mb-1.5 block ${labelClass}`}>今日一句话</label>
                  <input
                    type="text"
                    value={oneLiner}
                    onChange={(e) => setOneLiner(e.target.value)}
                    placeholder="一句话概括今天"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`mb-1.5 block ${labelClass}`}>正文</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="慢慢写……"
                    rows={6}
                    className={`${inputClass} resize-y min-h-[140px]`}
                  />
                </div>
                <div>
                  <label className={`mb-1.5 block ${labelClass}`}>标签</label>
                  <input
                    type="text"
                    value={tagsRaw}
                    onChange={(e) => setTagsRaw(e.target.value)}
                    placeholder="用英文逗号分隔，例如：工作, 跑步, 平静"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <div className="space-y-3 pt-2">
              {savedFlash ? (
                <p className="font-mono text-xs text-emerald-400/90" role="status">
                  已保存今天的记录（仅本机浏览器）。
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-white px-6 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 sm:max-w-xs"
              >
                保存今天记录
              </button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-10">
            <p className={`mb-3 ${labelClass}`}>K 线预览</p>
            <MoodCandlePreview
              open={ohlc.open}
              high={ohlc.high}
              low={ohlc.low}
              close={ohlc.close}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
