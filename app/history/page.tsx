"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MoodCandlePreview } from "@/components/mood-candle-preview";
import { loadAllRecords, type DiaryRecord } from "@/lib/diary-storage";

const labelClass = "font-mono text-[11px] uppercase tracking-wider text-zinc-500";

/** 将 YYYY-MM-DD 转为 UTC 日历日序号，避免本地时区偏移 */
function utcDayIndex(isoDate: string): number {
  const parts = isoDate.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return NaN;
  const [y, m, d] = parts;
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** olderIso → newerIso 之间的日历天数差（ newer 更晚 ） */
function calendarDaysBetween(olderIso: string, newerIso: string): number {
  const a = utcDayIndex(olderIso);
  const b = utcDayIndex(newerIso);
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.NaN;
  return b - a;
}

/** records 需已按日期倒序（最新在前） */
function consecutiveRecordDays(sortedDesc: DiaryRecord[]): number {
  if (sortedDesc.length === 0) return 0;
  let streak = 1;
  for (let i = 1; i < sortedDesc.length; i++) {
    const newer = sortedDesc[i - 1].date;
    const older = sortedDesc[i].date;
    if (calendarDaysBetween(older, newer) === 1) streak++;
    else break;
  }
  return streak;
}

function latestCandleLabel(open: number, close: number): string {
  if (close > open) return "阳线";
  if (close < open) return "阴线";
  return "十字星";
}

const statCardClass =
  "rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]";

export default function HistoryPage() {
  const [records, setRecords] = useState<DiaryRecord[]>([]);
  /** 仅允许展开一条：存 `date` 字符串，null 为全部收起 */
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const totalDays = records.length;
    const streak = consecutiveRecordDays(records);
    const sumClose = records.reduce((s, r) => s + r.close, 0);
    const avgClose = (sumClose / totalDays).toFixed(1);
    const latest = records[0];
    const lastState = latestCandleLabel(latest.open, latest.close);
    return { streak, totalDays, avgClose, lastState };
  }, [records]);

  useEffect(() => {
    try {
      const all = loadAllRecords();
      const list = Object.values(all).sort((a, b) => b.date.localeCompare(a.date));
      setRecords(list);
    } catch {
      setRecords([]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-10">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={labelClass}>History · Review</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              历史复盘
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
          >
            ← 返回首页
          </Link>
        </header>

        {stats ? (
          <section
            className="mb-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
            aria-label="统计概览"
          >
            <div className={statCardClass}>
              <p className={labelClass}>连续记录</p>
              <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">
                {stats.streak}
                <span className="ml-1 text-sm font-normal text-zinc-500">天</span>
              </p>
            </div>
            <div className={statCardClass}>
              <p className={labelClass}>总记录天数</p>
              <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">
                {stats.totalDays}
                <span className="ml-1 text-sm font-normal text-zinc-500">天</span>
              </p>
            </div>
            <div className={statCardClass}>
              <p className={labelClass}>平均收盘</p>
              <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-emerald-400/90">
                {stats.avgClose}
              </p>
            </div>
            <div className={statCardClass}>
              <p className={labelClass}>最近一根</p>
              <p className="mt-2 text-lg font-semibold text-zinc-100">{stats.lastState}</p>
            </div>
          </section>
        ) : null}

        {records.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 px-8 py-16 text-center">
            <p className="text-lg font-medium text-zinc-200">还没有历史记录</p>
            <p className="mt-2 text-sm text-zinc-500">去记录今天的第一根情绪K线</p>
            <Link
              href="/record"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
            >
              去记录
            </Link>
          </div>
        ) : (
          <ul className="space-y-6">
            {records.map((rec) => {
              const title = rec.title.trim();
              const summary = rec.summary.trim();
              const content = rec.content.trim();
              const tags = rec.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
              const isOpen = expandedDate === rec.date;
              const amplitude = rec.high - rec.low;
              const candleLabel = latestCandleLabel(rec.open, rec.close);

              function toggleCard() {
                setExpandedDate((prev) => (prev === rec.date ? null : rec.date));
              }

              return (
                <li key={rec.date}>
                  <article
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    onClick={toggleCard}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleCard();
                      }
                    }}
                    className={`overflow-hidden rounded-xl border bg-zinc-900/40 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] transition-[border-color,box-shadow] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                      isOpen
                        ? "border-zinc-600 ring-1 ring-emerald-500/15"
                        : "cursor-pointer border-zinc-800/80 hover:border-zinc-700"
                    }`}
                  >
                    <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_min(280px,100%)] lg:items-start">
                      <div className="min-w-0 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <time
                            className="block font-mono text-sm tabular-nums text-emerald-400/90"
                            dateTime={rec.date}
                          >
                            {rec.date}
                          </time>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                            {isOpen ? "收起" : "展开详情"}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-zinc-500">
                          开 {rec.open} · 高 {rec.high} · 低 {rec.low} · 收 {rec.close}
                        </p>
                        <div className="space-y-2">
                          <h2 className="text-lg font-medium text-zinc-100">
                            {title ? title : "（无标题）"}
                          </h2>
                          {summary ? (
                            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                              {summary}
                            </p>
                          ) : null}
                          {tags.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {tags.map((tag) => (
                                <span
                                  key={`${rec.date}-${tag}`}
                                  className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-[11px] text-zinc-400"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="lg:justify-self-end lg:w-full">
                        <MoodCandlePreview
                          open={rec.open}
                          high={rec.high}
                          low={rec.low}
                          close={rec.close}
                          chartLabel={rec.date}
                          compact
                          showFooter={false}
                        />
                      </div>
                    </div>

                    {isOpen ? (
                      <div className="border-t border-zinc-800/80 bg-zinc-950/55 px-5 py-4 sm:px-6">
                        <p className={labelClass}>正文</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                          {content ? rec.content : "这一天没有写详细正文"}
                        </p>
                        <div className="mt-4 flex flex-col gap-2 border-t border-zinc-800/60 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
                          <p className="font-mono text-xs text-zinc-400">
                            状态：
                            <span className="text-zinc-200">{candleLabel}</span>
                          </p>
                          <p className="font-mono text-xs text-zinc-400">
                            振幅：
                            <span className="tabular-nums text-zinc-200">{amplitude}</span>
                            <span className="text-zinc-500">（高 − 低）</span>
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
